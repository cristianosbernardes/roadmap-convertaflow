/**
 * Busca client-side com Fuse.js sobre MOCK_FEATURES (S-C-05).
 *
 * Decisao (ADR-030): solucao intermediaria enquanto backend Sprint 4 nao expoe
 * /api/v1/roadmap/buscar com pgvector + embeddings. Fuse e leve (~20kB gzip),
 * suficiente pra ~15-30 features mock e nao bloqueia entrega da Sprint C.
 *
 * Quando backend chegar, este modulo vira um shim: searchFeatures continua
 * sendo a unica API consumida pelos componentes, mas internamente chama o
 * endpoint remoto (com debounce). Trocar `getFuse()` por fetch + AbortController.
 */
import Fuse, { type IFuseOptions } from "fuse.js";
import { MOCK_FEATURES } from "@/lib/mock-data";
import type { Feature } from "@/types/roadmap";

const FUSE_OPTIONS: IFuseOptions<Feature> = {
  keys: [
    { name: "title", weight: 3 },
    { name: "descriptionShort", weight: 2 },
    { name: "description", weight: 1 },
    { name: "category", weight: 1 },
  ],
  // 0 = match exato, 1 = qualquer coisa. 0.4 cobre typos comuns (ia/iaa, conexao/conecao)
  // sem deixar resultado virar lixo.
  threshold: 0.4,
  // Ignora posicao do match no texto (matching anywhere) — feature de roadmap nao
  // tem hierarquia de "comeco mais relevante" como titulo de artigo.
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
};

// Singleton lazy — Fuse indexa O(n) no primeiro acesso e mantem em memoria.
// Como MOCK_FEATURES e estatico em build time, podemos memoizar sem invalidacao.
let fuseInstance: Fuse<Feature> | null = null;

function getFuse(): Fuse<Feature> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(MOCK_FEATURES, FUSE_OPTIONS);
  }
  return fuseInstance;
}

export interface SearchResultItem {
  feature: Feature;
  /** Score do Fuse: 0 = match perfeito, 1 = irrelevante. */
  score: number;
}

/**
 * Busca fuzzy sobre features mock.
 *
 * @param query texto livre do usuario (trim aplicado internamente)
 * @param limit teto de resultados (default 20)
 * @returns lista ordenada por relevancia (score ascendente)
 */
export function searchFeatures(query: string, limit = 20): SearchResultItem[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return getFuse()
    .search(q, { limit })
    .map((r) => ({ feature: r.item, score: r.score ?? 0 }));
}
