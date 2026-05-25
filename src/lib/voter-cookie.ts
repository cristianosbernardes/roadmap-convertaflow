/**
 * Cookie de voto anonimo — ADR-026 + ADR-034 (voto híbrido ZDG).
 *
 * No mock atual: UUID persistido em localStorage. Quando backend chegar
 * (Sprint 3), o backend seta cookie httpOnly Secure SameSite=Lax
 * Domain=.convertaflow.com com 10 anos de TTL.
 *
 * Suporta 2 tipos de voto (ADR-034 modelo híbrido ZDG):
 *   - 'up'      → voto positivo, contador público
 *   - 'oppose'  → voto negativo, PRIVADO (staff vê no CRM)
 *
 * Mutuamente exclusivos: clicar em 'oppose' quando já tem 'up' DESFAZ o 'up'
 * e SETA 'oppose' (não acumula). Mesmo timestamp registrado pra rate limit.
 *
 * Rate limit cobre ambos os tipos (1 bucket): 20 votos / 24h anônimo,
 * 5/min burst — cf. permissions.ts LIMITS.vote.
 */

const COOKIE_KEY = "cf_roadmap_voter_id";
const VOTES_KEY = "cf_roadmap_local_votes";
const VOTE_TIMESTAMPS_KEY = "cf_roadmap_vote_timestamps";

/** Tipos de voto suportados (espelha schema backend `vote_type` enum) */
export type VoteType = "up" | "oppose";

/** Mapa interno: slug → 'up'|'oppose' (apenas o tipo ativo, mutex) */
type LocalVotesMap = Record<string, VoteType>;

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
 * Retorna o tipo de voto local atual pra essa feature, ou null se ausente.
 * Substitui o antigo hasVotedLocal(): boolean.
 */
export function getLocalVote(featureSlug: string): VoteType | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return null;
    const votes = JSON.parse(raw) as LocalVotesMap;
    return votes[featureSlug] ?? null;
  } catch {
    return null;
  }
}

/**
 * Lista TODOS os votos locais agrupados por slug → tipo.
 * Usado pelo histórico "Você votou em" no header (S-D-13).
 *
 * Server-side retorna {} (sem localStorage).
 * Quando backend chegar (Sprint 3), tem que existir endpoint paralelo
 * `GET /api/v1/roadmap/me/votes` pra sincronizar cross-device.
 */
export function getAllLocalVotes(): Record<string, VoteType> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, VoteType>;
  } catch {
    return {};
  }
}

/**
 * Aplica um voto local com lógica mutex:
 *   - Se atual === tipo solicitado: REMOVE (toggle off)
 *   - Se atual !== tipo solicitado (ou null): SETA o novo tipo
 *
 * Retorna o NOVO estado (tipo ativo ou null se removido).
 */
export function setLocalVote(
  featureSlug: string,
  type: VoteType
): VoteType | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    const votes: LocalVotesMap = raw ? JSON.parse(raw) : {};
    const current = votes[featureSlug];

    let newState: VoteType | null;
    if (current === type) {
      // Mesmo tipo → toggle off
      delete votes[featureSlug];
      newState = null;
    } else {
      // Tipo diferente ou ausente → seta (substitui)
      votes[featureSlug] = type;
      newState = type;
    }

    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
    // Timestamp registrado APENAS quando há voto efetivo (add ou troca),
    // não quando desfaz — UX espelha rate limit de servidor (delete não conta).
    if (newState !== null) {
      recordVoteTimestamp();
    }
    return newState;
  } catch {
    return null;
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
 *   - 20 votos/24h por cookie (ambos os tipos contam pro mesmo bucket)
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

/** @deprecated Use getLocalVote() — mantido temporariamente pra compat até refatorar consumers */
export function hasVotedLocal(featureSlug: string): boolean {
  return getLocalVote(featureSlug) === "up";
}

/** @deprecated Use setLocalVote(slug, "up") — toggle puro do positivo */
export function toggleVoteLocal(featureSlug: string): boolean {
  return setLocalVote(featureSlug, "up") === "up";
}
