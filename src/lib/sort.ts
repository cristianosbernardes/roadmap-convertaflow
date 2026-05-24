/**
 * Ordenacao de features — funcoes puras + algoritmo trending.
 *
 * Usado tanto no SSR (page.tsx) lendo `searchParams.sort` quanto no client
 * (SortControl + useFeatureSort via nuqs). Garante UMA fonte de verdade
 * pra ordem exibida em qualquer rota.
 *
 * TODO Sprint 3 (backend): replicar `trendingScore` em Python
 * (app-converta-flow/backend-python/app/api/v1/roadmap/sort.py) e expor
 * `?sort=trending` em GET /api/v1/roadmap/features pra consistencia
 * cross-rota. Algoritmo: Reddit hot (score / (age + 2)^1.5).
 */

import type { Feature } from "@/types/roadmap";

// ─── TIPOS ────────────────────────────────────────────────────────────

export type SortKey = "trending" | "most-voted" | "recent" | "most-commented";

export const SORT_KEYS: readonly SortKey[] = [
  "trending",
  "most-voted",
  "recent",
  "most-commented",
] as const;

export const DEFAULT_SORT: SortKey = "trending";

/** Type guard pra validar string vinda de query param. */
export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && (SORT_KEYS as readonly string[]).includes(value);
}

/** Sanitiza valor possivelmente invalido vindo de URL (SSR). */
export function parseSortParam(value: string | string[] | undefined): SortKey {
  const first = Array.isArray(value) ? value[0] : value;
  return isSortKey(first) ? first : DEFAULT_SORT;
}

// ─── ALGORITMOS ───────────────────────────────────────────────────────

/**
 * Reddit "hot" simplificado — combina score (votos + 50% comentarios)
 * com decay temporal `(idade_em_horas + 2)^1.5`. Features novas com poucos
 * votos ainda aparecem; features velhas com muitos votos decaem.
 *
 * Por que esse expoente: 1.5 e mais "perdoa idade" que o 1.8 do Reddit
 * (roadmap tem ciclo de vida mais lento que feed de noticia).
 *
 * Fallback de data: publishedAt > createdAt (publishedAt e quando staff
 * aprovou pra exibicao publica — momento real em que a feature "comeca"
 * a poder receber votos).
 */
export function trendingScore(feature: Feature, now: number = Date.now()): number {
  const reference = feature.publishedAt ?? feature.createdAt;
  const ageHours = Math.max(
    0,
    (now - new Date(reference).getTime()) / 3_600_000,
  );
  const score = feature.voteCount + 0.5 * (feature.commentCount ?? 0);
  return score / Math.pow(ageHours + 2, 1.5);
}

/**
 * Retorna NOVA lista ordenada (nao muta o input).
 * `sort` invalido cai em DEFAULT_SORT.
 */
export function sortFeatures(features: Feature[], sort: SortKey): Feature[] {
  const now = Date.now();
  const copy = [...features];

  switch (sort) {
    case "trending":
      return copy.sort((a, b) => trendingScore(b, now) - trendingScore(a, now));
    case "most-voted":
      return copy.sort((a, b) => b.voteCount - a.voteCount);
    case "recent":
      return copy.sort((a, b) => {
        const aTime = new Date(a.publishedAt ?? a.createdAt).getTime();
        const bTime = new Date(b.publishedAt ?? b.createdAt).getTime();
        return bTime - aTime;
      });
    case "most-commented":
      return copy.sort(
        (a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0),
      );
    default: {
      // Exaustividade — se SortKey ganhar uma chave nova, TS aponta aqui.
      const _exhaustive: never = sort;
      void _exhaustive;
      return copy;
    }
  }
}
