"use client";

/**
 * Hook nuqs pra filtro de status de features via query string.
 *
 * Sincroniza `?status=...` da URL com estado React. Sem default — `null`
 * significa "Todos" e NAO aparece na URL (mantem URL limpa). Compartilhavel
 * por design: `?status=em_desenvolvimento` aberto em outra aba mantem filtro.
 *
 * Usado por <StatusFilter /> (client). O SSR de page.tsx le `searchParams.status`
 * direto via `parseStatusParam()` exportado de @/lib/status-filter (server-safe,
 * sem `"use client"`) — evita erro "Attempted to call client function from server".
 *
 * TODO Sprint 3 (backend): expor `?status=...` em GET /api/v1/roadmap/features
 * pra que filtros funcionem cross-rota e com paginacao server-side.
 */

import { useQueryState, parseAsStringEnum } from "nuqs";
import type { StatusSlug } from "@/lib/constants";
import { STATUS_FILTER_KEYS } from "@/lib/status-filter";

// Re-export pra preservar import path historico (caso outros componentes
// peguem o helper sem perceber o split server/client).
export { STATUS_FILTER_KEYS, parseStatusParam, isStatusSlug } from "@/lib/status-filter";

/**
 * Hook controlado: retorna `[status, setStatus]`. Setar `null` remove o
 * parametro da URL (estado "Todos"). Sem `withDefault` por design — a
 * tab "Todos" mapeia explicitamente pra `null`.
 *
 * `shallow: false` é OBRIGATORIO: a home (Server Component) le `?status=`
 * de `searchParams` e filtra MOCK_FEATURES no servidor. Sem isso, a URL
 * atualizaria mas a lista nao re-renderizaria (ficaria mostrando todas as
 * secoes apesar do filtro ativo). Quando o backend chegar e a filtragem
 * for SQL-side, esta flag continua necessaria pra refetch do RSC.
 */
export function useStatusFilter() {
  return useQueryState(
    "status",
    parseAsStringEnum<StatusSlug>([...STATUS_FILTER_KEYS]).withOptions({
      shallow: false,
    }),
  );
}
