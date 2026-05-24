/**
 * Cookie de voto anonimo — ADR-026.
 *
 * No mock atual: UUID persistido em localStorage. Quando backend chegar
 * (Sprint 4), o backend seta cookie httpOnly Secure SameSite=Lax
 * Domain=.convertaflow.com com 10 anos de TTL.
 *
 * Mock tambem rastreia votos locais (slug → boolean) e timestamps pra
 * simular rate limit client-side (visual feedback).
 */

const COOKIE_KEY = "cf_roadmap_voter_id";
const VOTES_KEY = "cf_roadmap_local_votes";
const VOTE_TIMESTAMPS_KEY = "cf_roadmap_vote_timestamps";

/**
 * Pega o UUID do voter atual, gerando se nao existir.
 * Server-side retorna null (nao tem localStorage).
 */
export function getOrCreateVoterCookie(): string | null {
  if (typeof window === "undefined") return null;
  let uuid = localStorage.getItem(COOKIE_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(COOKIE_KEY, uuid);
  }
  return uuid;
}

/**
 * Verifica se o cookie atual ja votou nessa feature (mock-only).
 * Backend real vai verificar via uniq_vote_cookie index.
 */
export function hasVotedLocal(featureSlug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return false;
    const votes = JSON.parse(raw) as Record<string, boolean>;
    return votes[featureSlug] === true;
  } catch {
    return false;
  }
}

/**
 * Marca/desmarca voto local (mock-only).
 * Retorna o novo estado (true = votou, false = removeu voto).
 */
export function toggleVoteLocal(featureSlug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    const votes: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    const newState = !votes[featureSlug];
    if (newState) {
      votes[featureSlug] = true;
    } else {
      delete votes[featureSlug];
    }
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
    recordVoteTimestamp();
    return newState;
  } catch {
    return false;
  }
}

/**
 * Registra timestamp do voto pra simular rate limit.
 */
function recordVoteTimestamp(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(VOTE_TIMESTAMPS_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    // mantem so ultimas 24h
    const filtered = timestamps.filter((t) => now - t < 24 * 60 * 60 * 1000);
    filtered.push(now);
    localStorage.setItem(VOTE_TIMESTAMPS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Verifica se o anonimo atual pode votar agora ou se excedeu limite.
 * Retorna { canVote, retryAfterSeconds?, reason? }.
 *
 * Limites (ADR-026):
 *   - 20 votos/24h por cookie
 *   - 5 votos/min burst
 */
export function checkVoteRateLimit(): {
  canVote: boolean;
  retryAfterSeconds?: number;
  reason?: string;
  remaining24h?: number;
} {
  if (typeof window === "undefined") return { canVote: true };
  try {
    const raw = localStorage.getItem(VOTE_TIMESTAMPS_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();

    // 24h sliding window
    const last24h = timestamps.filter((t) => now - t < 24 * 60 * 60 * 1000);
    if (last24h.length >= 20) {
      const oldest = Math.min(...last24h);
      const retryAfterMs = 24 * 60 * 60 * 1000 - (now - oldest);
      return {
        canVote: false,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        reason: "Você atingiu o limite diário de 20 votos. Volte amanhã.",
        remaining24h: 0,
      };
    }

    // 1 min burst (5 votos)
    const lastMin = timestamps.filter((t) => now - t < 60 * 1000);
    if (lastMin.length >= 5) {
      const oldest = Math.min(...lastMin);
      const retryAfterMs = 60 * 1000 - (now - oldest);
      return {
        canVote: false,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        reason: "Você está votando muito rápido. Aguarde alguns segundos.",
        remaining24h: 20 - last24h.length,
      };
    }

    return {
      canVote: true,
      remaining24h: 20 - last24h.length,
    };
  } catch {
    return { canVote: true };
  }
}

/**
 * Reseta tudo (dev tooling).
 */
export function resetVoterCookie(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COOKIE_KEY);
  localStorage.removeItem(VOTES_KEY);
  localStorage.removeItem(VOTE_TIMESTAMPS_KEY);
}
