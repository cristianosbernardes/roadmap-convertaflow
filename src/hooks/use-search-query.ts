"use client";

/**
 * Hook nuqs pra query de busca via `?q=...`.
 *
 * Usado pela pagina /buscar (lendo SSR-side com `searchParams.q`) e pelo
 * SearchCommand (modal Cmd+K) quando o usuario clica "Ver todos resultados".
 *
 * O proprio modal NAO usa este hook — ele controla o input localmente
 * (state efemero) pra evitar reescrever URL a cada tecla. Persistencia
 * em URL acontece apenas no submit pra /buscar?q=...
 */
import { useQueryState, parseAsString } from "nuqs";

export function useSearchQuery() {
  return useQueryState("q", parseAsString.withDefault(""));
}
