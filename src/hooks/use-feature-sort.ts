"use client";

/**
 * Hook nuqs pra ordenacao de features via query string.
 *
 * Sincroniza `?sort=...` da URL com estado React. Default (`trending`) NAO
 * aparece na URL (mantem URL limpa quando usuario nao mexeu). Compartilhavel
 * por design — copiar URL `?sort=most-voted` e abrir em outra aba mantem.
 *
 * Usado por <SortControl /> (client). SSR le `searchParams.sort` direto via
 * `parseSortParam()` de @/lib/sort pra evitar hidratacao desnecessaria
 * de listas grandes.
 */

import { useQueryState, parseAsStringEnum } from "nuqs";
import {
  ArrowUp,
  Clock,
  MessageCircle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { SORT_KEYS, DEFAULT_SORT, type SortKey } from "@/lib/sort";

export interface SortOption {
  key: SortKey;
  label: string;
  icon: LucideIcon;
  /** Texto curto para aria-label adicional (opcional). */
  description: string;
}

/**
 * Catalogo canonico das opcoes — usado pelo SortControl pra renderizar
 * o segmented control. Ordem fixa (tab navigation previsivel).
 */
export const SORT_OPTIONS: readonly SortOption[] = [
  {
    key: "trending",
    label: "Em alta",
    icon: TrendingUp,
    description: "Combina votos, comentarios e idade",
  },
  {
    key: "most-voted",
    label: "Mais votados",
    icon: ArrowUp,
    description: "Maior numero de votos primeiro",
  },
  {
    key: "recent",
    label: "Recentes",
    icon: Clock,
    description: "Publicadas mais recentemente",
  },
  {
    key: "most-commented",
    label: "Mais comentados",
    icon: MessageCircle,
    description: "Mais discussao primeiro",
  },
] as const;

/**
 * Hook controlado: retorna `[sort, setSort]`. Setar `null` ou `DEFAULT_SORT`
 * remove o parametro da URL.
 */
export function useFeatureSort() {
  return useQueryState(
    "sort",
    parseAsStringEnum<SortKey>([...SORT_KEYS]).withDefault(DEFAULT_SORT),
  );
}
