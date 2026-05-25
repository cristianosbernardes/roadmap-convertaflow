/**
 * Subscriptions a feature do roadmap (S-D-15) — mock-first.
 *
 * Por que existe
 * --------------
 * Visitante quer ser notificado quando uma feature avança de status
 * (`sob_analise` → `planejado` → `em_desenvolvimento` → `concluido`).
 * Hoje (Sprint D) persistimos apenas no localStorage. Sprint 3 substitui
 * pelo endpoint:
 *
 *   POST   /api/v1/roadmap/me/subscriptions   { feature_slug, channel: 'email' }
 *   DELETE /api/v1/roadmap/me/subscriptions/{feature_slug}
 *
 * com double opt-in (email de confirmação) + cron que dispara notification
 * quando `features.status` muda. Até lá, este helper guarda o set local de
 * slugs inscritos.
 *
 * Modelo
 * ------
 * Persistência: localStorage key `cf_roadmap_feature_subscriptions` com
 * array JSON de slugs. Operações são idempotentes e tolerantes a corrupção
 * (qualquer JSON inválido vira `[]` silenciosamente, mesmo padrão do
 * voter-cookie).
 *
 * Render SSR
 * ----------
 * Todas as funções retornam o estado "vazio" (false / []) em `window === undefined`
 * pra não quebrar SSR/SSG. O componente que consome HIDRATA no useEffect
 * (mesmo padrão do vote-button-interactive) pra evitar flash de
 * "não inscrito" piscando antes do read do localStorage.
 */

const SUBS_KEY = "cf_roadmap_feature_subscriptions";

/**
 * Lê o array de slugs inscritos do localStorage de forma defensiva.
 * Retorna [] em SSR ou se o JSON estiver corrompido.
 */
function readSubscriptions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sanitiza: só strings não-vazias
    return parsed.filter((s): s is string => typeof s === "string" && s.length > 0);
  } catch {
    return [];
  }
}

/**
 * Escreve o array de slugs no localStorage. No-op em SSR.
 */
function writeSubscriptions(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    // Dedup defensivo antes de gravar
    const unique = Array.from(new Set(slugs));
    localStorage.setItem(SUBS_KEY, JSON.stringify(unique));
  } catch {
    // QuotaExceededError ou storage desabilitado — silencioso (mock-first).
  }
}

/**
 * Retorna true se o visitante está inscrito nesta feature.
 * Sempre `false` em SSR — hidrate no client via useEffect.
 */
export function isSubscribedToFeature(slug: string): boolean {
  if (!slug) return false;
  return readSubscriptions().includes(slug);
}

/**
 * Toggle: se inscrito, desinscreve; senão, inscreve.
 * Retorna o NOVO estado (true = agora inscrito, false = agora desinscrito).
 *
 * Sprint 3 substitui esse no-op local por POST/DELETE no backend.
 */
export function toggleSubscriptionToFeature(slug: string): boolean {
  if (!slug) return false;
  const current = readSubscriptions();
  const isCurrentlySubscribed = current.includes(slug);
  if (isCurrentlySubscribed) {
    writeSubscriptions(current.filter((s) => s !== slug));
    return false;
  }
  writeSubscriptions([...current, slug]);
  return true;
}

/**
 * Lista todos os slugs inscritos. Útil pra futura tela "minhas inscrições"
 * ou pra sincronizar com backend no Sprint 3 (migração one-shot do localStorage).
 */
export function getAllSubscriptions(): string[] {
  return readSubscriptions();
}
