/**
 * Filtro por status — utilitarios puros para SSR e cliente.
 *
 * Mantido SEM `"use client"` para que `parseStatusParam()` possa ser
 * importado pelo Server Component da home (page.tsx) sem violar a fronteira
 * server/client. O hook `useStatusFilter` (em src/hooks/use-status-filter.ts)
 * importa daqui pra reusar as keys validas e o type guard.
 *
 * Mesmo padrao de @/lib/sort + @/hooks/use-feature-sort.
 */

import type { StatusSlug } from "@/lib/constants";

/**
 * Slugs validos no filtro. Replica STATUSES keys para evitar import dinamico
 * em SSR. Mantido sincronizado a mao com src/lib/constants.ts (cobertura
 * garantida por satisfies abaixo).
 */
export const STATUS_FILTER_KEYS = [
  "sob_analise",
  "planejado",
  "em_desenvolvimento",
  "beta_privado",
  "concluido",
  "pausado",
  "nao_sera_feito",
] as const satisfies readonly StatusSlug[];

/** Type guard pra validar string vinda de query param. */
export function isStatusSlug(value: unknown): value is StatusSlug {
  return (
    typeof value === "string" &&
    (STATUS_FILTER_KEYS as readonly string[]).includes(value)
  );
}

/**
 * Sanitiza valor possivelmente invalido vindo de URL (SSR).
 * Retorna `null` se nao for um status valido (= "Todos").
 */
export function parseStatusParam(
  value: string | string[] | undefined,
): StatusSlug | null {
  const first = Array.isArray(value) ? value[0] : value;
  return isStatusSlug(first) ? first : null;
}
