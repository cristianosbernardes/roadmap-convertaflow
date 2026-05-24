/**
 * Reactions em comentarios — persistencia local mock-first.
 *
 * Espelha padrao do voter-cookie.ts (ADR-026): localStorage agora,
 * backend POST /comments/:id/react chega Sprint 3.
 *
 * Modelo de dados:
 *   - 5 emojis canonicos (👍 ❤️ 🎉 🚀 👀) — limite imposto pra evitar
 *     fragmentacao infinita e simplificar agregacao do contador.
 *   - Por comentario, o anonimo pode reagir com 1 ou mais emojis distintos.
 *     Cada par (comment, emoji) e' booleano: voce reagiu ou nao.
 *   - Toggle: clicar 2x no mesmo emoji desfaz (idempotente).
 *
 * No backend (Sprint 3) o modelo equivalente sera tabela
 * `roadmap.comment_reactions(comment_id, user_id, emoji)` com unique constraint
 * em (comment_id, user_id, emoji) — exatamente o que o toggle local emula.
 */

const STORAGE_KEY = "cf_roadmap_comment_reactions";

/**
 * Emojis canonicos suportados.
 * Ordem importa: e' a ordem de exibicao no picker.
 */
export const REACTION_EMOJIS = ["👍", "❤️", "🎉", "🚀", "👀"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

/** Type guard pra validar string contra os emojis canonicos. */
export function isReactionEmoji(value: string): value is ReactionEmoji {
  return (REACTION_EMOJIS as readonly string[]).includes(value);
}

/** commentId → emoji → boolean (voce reagiu?) */
type LocalReactions = Record<number, Partial<Record<ReactionEmoji, boolean>>>;

function readAll(): LocalReactions {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LocalReactions;
  } catch {
    return {};
  }
}

function writeAll(state: LocalReactions): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore (quota / private mode)
  }
}

/**
 * Voce ja reagiu nesse comentario com esse emoji?
 */
export function hasLocalReaction(
  commentId: number,
  emoji: ReactionEmoji
): boolean {
  const all = readAll();
  return all[commentId]?.[emoji] === true;
}

/**
 * Toggle de reaction local. Retorna o NOVO estado (true=reagiu, false=desfez).
 */
export function toggleLocalReaction(
  commentId: number,
  emoji: ReactionEmoji
): boolean {
  const all = readAll();
  const current = all[commentId]?.[emoji] === true;
  const next = !current;

  if (!all[commentId]) all[commentId] = {};
  if (next) {
    all[commentId][emoji] = true;
  } else {
    delete all[commentId][emoji];
    // Cleanup: se nao sobrou nenhuma reaction nesse comentario, remove a chave
    if (Object.keys(all[commentId]).length === 0) {
      delete all[commentId];
    }
  }

  writeAll(all);
  return next;
}

/**
 * Lista todos os emojis que voce reagiu nesse comentario.
 * Usado pra hidratar estado inicial no mount do ReactionsBar.
 */
export function getLocalReactionsForComment(
  commentId: number
): ReactionEmoji[] {
  const all = readAll();
  const entry = all[commentId];
  if (!entry) return [];
  return (Object.keys(entry) as ReactionEmoji[]).filter(
    (e) => entry[e] === true
  );
}

/**
 * Reset (dev tooling). Limpa todas as reactions locais.
 */
export function resetLocalReactions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
