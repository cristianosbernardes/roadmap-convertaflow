"use client";

/**
 * Segmented control horizontal de ordenacao.
 *
 * Visual: container outer 1.5px solid border-primary, rounded-[10px], h-10.
 * Items internos rounded-[7px] (concentric corners), h-8, sem border.
 * Estado ativo: bg `--info-bg`, color `--brand-primary`, font-medium.
 *
 * Comportamento:
 *   - Desktop: 4 botoes lado a lado, sempre visiveis.
 *   - Mobile (< sm): scroll horizontal (overflow-x-auto) sem barra visivel,
 *     mantendo a mesma anatomia. Decisao consciente vs dropdown:
 *     scroll mostra todas opcoes de imediato (descobribilidade alta).
 *
 * A11y: role=tablist no container, role=tab + aria-selected nos botoes.
 * Tab navigation nativa do browser (sem custom keyboard handlers).
 *
 * URL: usa useFeatureSort (nuqs). Mudanca sincroniza com `?sort=...`.
 */

import { useFeatureSort, SORT_OPTIONS } from "@/hooks/use-feature-sort";

export interface SortControlProps {
  /** Label opcional acima do segmented control (default: "Ordenar por") */
  label?: string;
  /** Esconde o label totalmente (a11y mantem via aria-label do tablist) */
  hideLabel?: boolean;
  className?: string;
}

export function SortControl({
  label = "Ordenar por",
  hideLabel = false,
  className,
}: SortControlProps) {
  const [sort, setSort] = useFeatureSort();

  return (
    <div className={className}>
      {!hideLabel ? (
        <p
          className="text-[12px] uppercase tracking-wider font-semibold mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
      ) : null}

      {/* Wrapper com overflow-x-auto pra mobile sem scrollbar visivel.
          [&::-webkit-scrollbar]:hidden = Tailwind arbitrary variant (Tailwind 4)
          combinado com scrollbar-width/ms-overflow-style inline pra Firefox/IE. */}
      <div
        className="relative overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          role="tablist"
          aria-label={label}
          className="inline-flex items-center gap-1 p-1 h-10"
          style={{
            background: "var(--surface-card)",
            border: "1.5px solid var(--border-primary)",
            borderRadius: "10px",
          }}
        >
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = sort === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${option.label} — ${option.description}`}
                onClick={() => setSort(option.key)}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-[13px] whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  borderRadius: "7px",
                  background: isActive ? "var(--info-bg)" : "transparent",
                  color: isActive
                    ? "var(--brand-primary)"
                    : "var(--text-muted)",
                  fontWeight: isActive ? 600 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--surface-low)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }
                }}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
