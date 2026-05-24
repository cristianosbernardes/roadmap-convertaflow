"use client";

/**
 * Botao client-side no Header que abre o modal Cmd+K.
 *
 * Isolado do Header (Server Component) pra evitar marcar o header inteiro
 * como client. O visual replica EXATAMENTE o "pseudo-input" do Header
 * original — quem ja conhecia o atalho ⌘K nao perde nada.
 */
import { Search } from "lucide-react";
import { useSearch } from "@/components/search-provider";

export function SearchTrigger() {
  const { openSearch } = useSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className="hidden lg:flex items-center gap-2 h-10 px-3 rounded-[10px] text-[13px] transition-colors hover:bg-[var(--surface-low)]"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-high)",
        color: "var(--text-muted)",
        minWidth: "200px",
      }}
      aria-label="Abrir busca (Ctrl+K)"
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      <span>Pesquisar...</span>
      <kbd
        className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono"
        style={{
          background: "var(--surface-low)",
          color: "var(--text-muted)",
        }}
      >
        {"⌘"}K
      </kbd>
    </button>
  );
}
