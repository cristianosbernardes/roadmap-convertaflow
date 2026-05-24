/**
 * Helper isomorf de resolução de rota ativa no Header/MobileNav.
 *
 * Sprint D — S-D-03 (Auditoria UX-UI v2 — C.6).
 *
 * Problema: NavLinks do Header só consideravam rotas literais ("/", "/roadmap",
 * "/changelog"). Em rotas derivadas como /categoria/inbox ou /feature/X o
 * usuário ficava sem feedback visual de onde está no navbar.
 *
 * Solução: função pura que mapeia qualquer pathname pra um dos identificadores
 * canônicos de nav item. Categorias e detalhes de feature derivam pra
 * "publicacoes" porque são views filtradas/detalhe do feed principal.
 *
 * Rotas transversais (/buscar) retornam null — nenhum nav item destacado.
 */

export type ActivePath =
  | "publicacoes" // /, /categoria/*, /feature/*
  | "roadmap" // /roadmap
  | "changelog" // /changelog
  | "sugerir" // /nova
  | "sobre"; // /sobre

/**
 * Resolve identificador canônico do nav item ativo a partir do pathname.
 *
 * @param pathname pathname atual (de `usePathname()` ou request URL)
 * @returns identificador canônico ou null pra rotas transversais (busca)
 */
export function getActivePathFromPath(pathname: string): ActivePath | null {
  if (!pathname) return null;

  // Normaliza: remove trailing slash exceto pra raiz
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  // Raiz + rotas derivadas do feed principal
  if (path === "/") return "publicacoes";
  if (path.startsWith("/categoria/") || path === "/categoria") {
    return "publicacoes";
  }
  if (path.startsWith("/feature/") || path === "/feature") {
    return "publicacoes";
  }

  // Rotas literais top-level
  if (path === "/roadmap" || path.startsWith("/roadmap/")) return "roadmap";
  if (path === "/changelog" || path.startsWith("/changelog/")) {
    return "changelog";
  }
  if (path === "/nova" || path.startsWith("/nova/")) return "sugerir";
  if (path === "/sobre" || path.startsWith("/sobre/")) return "sobre";

  // Rotas transversais (busca, filtros, status views) — nenhum destaque
  return null;
}
