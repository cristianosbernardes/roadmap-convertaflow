import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/**
 * Empty state editorial reusavel.
 *
 * Casos de uso:
 *   - /categoria/[slug] quando categoria nao tem features (S-C-03)
 *   - /buscar?q= sem resultados (futuro S-C-05)
 *   - /changelog em mes sem releases (futuro)
 *
 * Anatomia:
 *   - Circulo soft com icone Lucide grande (centralizado)
 *   - Titulo h2 (text-[20px] font-bold)
 *   - Body parag (text-[14px] text-secondary, max ~500px de largura)
 *   - 1 ou 2 CTAs lado a lado (primario gradient + secundario surface-low)
 *
 * Padroes:
 *   - rounded-[10px] no CTA primario, rounded-full no circulo do icone
 *   - Heights grid 8pt: CTAs h-10 (40px)
 *   - PT-BR com acentos em todo texto visivel
 *   - Sem alert/confirm nativos
 */

type IconColor = "brand" | "muted" | "warning";

interface CTAConfig {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface EmptyStateProps {
  /** Icone Lucide grande no topo. */
  icon: LucideIcon;
  /** Tom do circulo + icone. Default: brand. */
  iconColor?: IconColor;
  /** Titulo curto e direto, ~1 linha. */
  title: string;
  /** Corpo editorial 2-3 linhas, ate ~500px de largura. */
  body: string;
  /** CTA primario opcional (gradient). */
  cta?: CTAConfig;
  /** CTA secundario opcional (surface-low). */
  ctaSecondary?: CTAConfig;
  /**
   * Quando `true`, envolve o conteudo num card com borda 1.5px.
   * Default `false` — empty state respira no proprio container da pagina.
   */
  bordered?: boolean;
}

const ICON_STYLES: Record<
  IconColor,
  { background: string; color: string }
> = {
  brand: {
    background: "var(--surface-low)",
    color: "var(--brand-primary)",
  },
  muted: {
    background: "var(--surface-low)",
    color: "var(--text-muted)",
  },
  warning: {
    background: "var(--warning-bg)",
    color: "var(--warning)",
  },
};

export function EmptyState({
  icon: Icon,
  iconColor = "brand",
  title,
  body,
  cta,
  ctaSecondary,
  bordered = false,
}: EmptyStateProps) {
  const iconStyle = ICON_STYLES[iconColor];

  const containerClass = bordered
    ? "w-full flex flex-col items-center text-center py-16 px-6 rounded-[10px]"
    : "w-full flex flex-col items-center text-center py-16 px-6";

  const containerStyle = bordered
    ? {
        background: "var(--surface-card)",
        border: "1.5px solid var(--border-primary)",
      }
    : undefined;

  return (
    <div
      className={containerClass}
      style={containerStyle}
      role="status"
      aria-live="polite"
    >
      {/* Circulo do icone */}
      <div
        className="h-20 w-20 rounded-full flex items-center justify-center mb-5"
        style={{
          background: iconStyle.background,
          color: iconStyle.color,
        }}
        aria-hidden="true"
      >
        <Icon className="h-10 w-10" />
      </div>

      {/* Titulo */}
      <h2
        className="text-[20px] font-bold leading-tight"
        style={{
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>

      {/* Body */}
      <p
        className="text-[14px] mt-2 leading-relaxed max-w-[500px]"
        style={{ color: "var(--text-secondary)" }}
      >
        {body}
      </p>

      {/* CTAs (opcional) */}
      {(cta || ctaSecondary) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {cta && (
            <Link
              href={cta.href}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-all hover:brightness-110"
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {cta.icon && <cta.icon className="h-4 w-4" />}
              {cta.label}
            </Link>
          )}
          {ctaSecondary && (
            <Link
              href={ctaSecondary.href}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-primary)",
              }}
            >
              {ctaSecondary.icon && (
                <ctaSecondary.icon className="h-4 w-4" />
              )}
              {ctaSecondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
