"use client";

/**
 * Segmented control horizontal de filtro por status.
 *
 * Visual: irmao gemeo do SortControl (S-C-04). Container outer 1.5px solid
 * border-primary, rounded-[10px], h-10. Items internos rounded-[7px]
 * (concentric corners), h-8, sem border. Bullet colorido (6px) antes do
 * label sinaliza visualmente a cor canonica do status (laranja em dev,
 * azul planejado, verde concluido). Tab ativa: bg `--info-bg` + color
 * `--brand-primary`.
 *
 * Comportamento:
 *   - 4 opcoes fixas: "Todos" + 3 status canonicos mais usados (em_dev,
 *     planejado, concluido). Os 4 restantes (sob_analise, beta_privado,
 *     pausado, nao_sera_feito) ficam acessiveis via /status/[slug]
 *     no futuro — mantem a home enxuta e focada no que importa.
 *   - "Todos" mapeia pra `null` (sem param na URL).
 *   - Desktop: 4 botoes lado a lado.
 *   - Mobile: scroll horizontal sem scrollbar (mesmo padrao do SortControl).
 *
 * A11y: role=tablist + role=tab + aria-selected. Bullet com `aria-hidden`
 * (e decorativo — label ja descreve o status).
 *
 * URL: usa useStatusFilter (nuqs). Mudanca sincroniza com `?status=...`.
 */

import { useStatusFilter } from "@/hooks/use-status-filter";
import type { StatusSlug } from "@/lib/constants";

interface StatusFilterOption {
  /** `null` = "Todos" (default, sem filtro). */
  key: StatusSlug | null;
  label: string;
  /** Cor hex do bullet (omitido para "Todos"). */
  bulletColor?: string;
}

/**
 * Catalogo das opcoes exibidas no filtro principal da home.
 * Ordem deliberada: "Todos" → status com mais movimento (em dev → planejado
 * → concluido). Reflete o que o usuario tipico quer ver primeiro.
 */
const STATUS_FILTER_OPTIONS: readonly StatusFilterOption[] = [
  { key: null, label: "Todos" },
  {
    key: "em_desenvolvimento",
    label: "Em desenvolvimento",
    bulletColor: "#ea580c",
  },
  { key: "planejado", label: "Planejado", bulletColor: "#0284c7" },
  { key: "concluido", label: "Concluído", bulletColor: "#16a34a" },
] as const;

export interface StatusFilterProps {
  /** Label opcional acima do segmented control (default: "Filtrar por status") */
  label?: string;
  /** Esconde o label visualmente (a11y mantem via aria-label do tablist) */
  hideLabel?: boolean;
  className?: string;
}

export function StatusFilter({
  label = "Filtrar por status",
  hideLabel = false,
  className,
}: StatusFilterProps) {
  const [status, setStatus] = useStatusFilter();

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
          {STATUS_FILTER_OPTIONS.map((option) => {
            const isActive = status === option.key;
            const keyAttr = option.key ?? "all";
            return (
              <button
                key={keyAttr}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={
                  option.key === null
                    ? "Todos os status"
                    : `Filtrar por ${option.label}`
                }
                onClick={() => setStatus(option.key)}
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
                {option.bulletColor ? (
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{
                      height: "8px",
                      width: "8px",
                      background: option.bulletColor,
                    }}
                    aria-hidden="true"
                  />
                ) : null}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
