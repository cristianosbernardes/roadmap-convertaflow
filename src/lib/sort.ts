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

// ─── TRENDING BADGE (S-D-11) ──────────────────────────────────────────

/**
 * Status considerados elegíveis para o badge "Em alta".
 *
 * Critério editorial: trending só faz sentido pras features que AINDA podem
 * crescer (acumular votos pra mudar nossa fila de prioridade). Em desenvolvimento
 * e beta_privado já estao em movimento; concluido/pausado/nao_sera_feito sao
 * terminais — destacar trending neles confundiria o leitor ("ja decidimos").
 *
 * Decisao tomada em S-D-11. Se mudarmos a politica, ajustar aqui.
 */
const TRENDING_ELIGIBLE_STATUSES = new Set<Feature["status"]>([
  "sob_analise",
  "planejado",
]);

/**
 * Score mínimo pra entrar no top trending. Evita "Em alta" em feature recém
 * publicada com 1 voto — mesmo que matematicamente esteja no topo do decay.
 * Valor calibrado com o mock atual: features sob_analise mais frescas ficam
 * na faixa 0.01–0.03; threshold 0.005 corta apenas casos degenerados.
 */
const TRENDING_MIN_SCORE = 0.005;

/**
 * Identifica top N features pelo `trendingScore` para exibir badge "Em alta"
 * nos cards. Retorna `Set<number>` pra check O(1) no render.
 *
 * Regras:
 * 1. Filtra apenas status ∈ `TRENDING_ELIGIBLE_STATUSES`
 * 2. Ordena por `trendingScore` desc
 * 3. Aplica `TRENDING_MIN_SCORE` (descarta scores muito baixos)
 * 4. Pega top N (default 3 — suficiente pra home, sem poluir)
 *
 * Calculado UMA VEZ no Server Component e passado pros cards via prop.
 */
export function getTrendingFeatures(
  features: Feature[],
  topN = 3,
  now: number = Date.now(),
): Set<number> {
  const ranked = features
    .filter((f) => TRENDING_ELIGIBLE_STATUSES.has(f.status))
    .map((f) => ({ id: f.id, score: trendingScore(f, now) }))
    .filter((s) => s.score >= TRENDING_MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return new Set(ranked.map((s) => s.id));
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
