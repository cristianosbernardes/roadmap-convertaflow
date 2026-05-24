"use client";

/**
 * Provider de contexto pra abrir o modal de busca (Cmd+K).
 *
 * Por que Context? O Header (Server Component possivel via children) e o
 * proprio SearchCommand vivem em arvores separadas no layout raiz. Precisamos
 * de um canal compartilhado pra disparar `openSearch()` de qualquer botao
 * sem prop drilling.
 *
 * Atalho global Cmd+K / Ctrl+K e registrado UMA vez aqui no provider —
 * evita listeners duplicados se SearchCommand fosse responsavel.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SearchContextValue {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  // Atalho global Cmd+K (Mac) / Ctrl+K (Win/Linux).
  // Toggle: se ja aberto, fecha. Evita comportamento "stuck" se usuario
  // apertar duas vezes.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo<SearchContextValue>(
    () => ({ open, openSearch, closeSearch, setOpen }),
    [open, openSearch, closeSearch],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch deve ser usado dentro de <SearchProvider />");
  }
  return ctx;
}
