"use client";

/**
 * Modal Cmd+K de busca rapida (S-C-05).
 *
 * Pattern: Linear/Raycast — input no topo, lista de resultados, footer com
 * hints de atalhos. Implementado com `cmdk` (a11y nativa: setas Up/Down,
 * Enter, Escape, foco trapado, role=combobox + listbox).
 *
 * Visual: overlay fixed + dialog centralizado (w-full max-w-2xl).
 * z-index 100 garante que fica acima do header sticky (z-30) e do
 * mobile-nav drawer (z-50).
 *
 * Estado:
 *   - `open` controlado por SearchProvider via useSearch()
 *   - `query` local (efemero) — NAO persiste em URL. Persistencia rola
 *     apenas quando usuario clica "Ver todos resultados" → /buscar?q=
 *   - Lista de resultados memoizada por query (top 8 do Fuse)
 *
 * A11y:
 *   - Backdrop click fecha
 *   - ESC fecha (gerenciado pelo cmdk)
 *   - body overflow=hidden enquanto aberto (igual ao MobileNav)
 *   - Foco vai pro input automaticamente (cmdk faz)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Command } from "cmdk";
import { Search, SearchX, CornerDownLeft, ArrowRight } from "lucide-react";
import { useSearch } from "@/components/search-provider";
import { searchFeatures } from "@/lib/search";
import { CategoryIcon } from "@/components/category-icon";
import { StatusBadge } from "@/components/status-badge";
import { CATEGORIES } from "@/lib/constants";

const MAX_VISIBLE_RESULTS = 8;

export function SearchCommand() {
  const { open, closeSearch } = useSearch();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Portal precisa de window — so monta no client.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trava scroll do body enquanto modal aberto. Espelha MobileNav.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Reseta query ao fechar — proxima abertura comeca limpa.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // Foca input ao abrir (cmdk ja tenta, mas garantimos um nudge apos animacao).
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // Memo evita re-search a cada render desnecessario.
  const results = useMemo(
    () => searchFeatures(query, MAX_VISIBLE_RESULTS),
    [query],
  );

  const hasQuery = query.trim().length >= 2;
  const hasResults = results.length > 0;

  const goToFullResults = () => {
    if (!hasQuery) return;
    closeSearch();
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
  };

  const onSelectFeature = (slug: string) => {
    closeSearch();
    router.push(`/feature/${slug}`);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-150 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop — clicavel pra fechar */}
      <button
        type="button"
        aria-label="Fechar busca"
        onClick={closeSearch}
        className="absolute inset-0 w-full h-full cursor-default"
        style={{
          background: "rgba(2, 23, 74, 0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        tabIndex={-1}
      />

      {/* Dialog — centralizado, sai do top-25% pra parecer overlay rapido */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar features"
        className={`absolute left-1/2 top-[12vh] sm:top-[18vh] w-[92%] max-w-2xl -translate-x-1/2 transition-all duration-150 ${
          open ? "translate-y-0 scale-100" : "-translate-y-2 scale-[0.98]"
        }`}
      >
        <Command
          shouldFilter={false}
          loop
          label="Buscar features"
          className="flex flex-col w-full overflow-hidden"
          style={{
            background: "var(--surface-card)",
            border: "1.5px solid var(--border-primary)",
            borderRadius: "10px",
            boxShadow: "var(--shadow-lg)",
          }}
          onKeyDown={(e) => {
            // Tab → ver todos resultados (atalho documentado no footer).
            if (e.key === "Tab" && !e.shiftKey && hasQuery) {
              e.preventDefault();
              goToFullResults();
            }
          }}
        >
          {/* Input com icone */}
          <div
            className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-secondary)" }}
          >
            <Search
              className="h-4 w-4 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
              aria-hidden="true"
            />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar por feature, categoria ou palavra-chave..."
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:font-normal"
              style={{
                color: "var(--text-primary)",
              }}
            />
            <kbd
              className="hidden sm:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-muted)",
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Lista de resultados (max ~480px de altura — scroll interno se passar) */}
          <Command.List
            className="overflow-y-auto p-2"
            style={{ maxHeight: "min(480px, 60vh)" }}
          >
            {!hasQuery && (
              <div
                className="flex flex-col items-center justify-center px-6 py-10 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <Search className="h-8 w-8 mb-3" aria-hidden="true" />
                <p className="text-[14px]">
                  Digite ao menos 2 letras pra começar.
                </p>
                <p className="text-[12px] mt-1">
                  Busque por título, descrição ou categoria.
                </p>
              </div>
            )}

            {hasQuery && !hasResults && (
              <Command.Empty>
                <div
                  className="flex flex-col items-center justify-center px-6 py-10 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  <SearchX className="h-8 w-8 mb-3" aria-hidden="true" />
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Nenhum resultado pra &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[12px] mt-1 max-w-sm">
                    Tente termos diferentes ou navegue pelas categorias.
                  </p>
                </div>
              </Command.Empty>
            )}

            {hasQuery && hasResults && (
              <Command.Group
                heading={`Resultados (${results.length})`}
                className="flex flex-col gap-1"
              >
                {results.map(({ feature }) => {
                  const category = CATEGORIES[feature.category];
                  return (
                    <Command.Item
                      key={feature.id}
                      value={`${feature.slug}-${feature.title}`}
                      onSelect={() => onSelectFeature(feature.slug)}
                      className="flex items-center gap-3 px-2 py-2 cursor-pointer transition-colors data-[selected=true]:bg-[var(--surface-low)]"
                      style={{
                        borderRadius: "7px",
                      }}
                    >
                      <CategoryIcon
                        category={feature.category}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[14px] font-semibold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {feature.title}
                        </p>
                        <p
                          className="text-[12px] truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <span>{category.label}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{feature.descriptionShort}</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={feature.status} size="sm" />
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer com hints */}
          <div
            className="flex items-center justify-between gap-2 px-4 h-11 flex-shrink-0 text-[11px] flex-wrap"
            style={{
              borderTop: "1px solid var(--border-secondary)",
              background: "var(--surface-low)",
              color: "var(--text-muted)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd
                  className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded font-mono"
                  style={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-secondary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                </kbd>
                <span>abrir feature</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <kbd
                  className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded font-mono text-[10px]"
                  style={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-secondary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Tab
                </kbd>
                <span>ver todos</span>
              </span>
            </div>
            {hasQuery && (
              <Link
                href={`/buscar?q=${encodeURIComponent(query.trim())}`}
                onClick={closeSearch}
                className="inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
                style={{ color: "var(--brand-primary)" }}
              >
                Ver todos resultados
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        </Command>
      </div>
    </div>,
    document.body,
  );
}
