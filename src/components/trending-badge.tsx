import { Flame } from "lucide-react";

/**
 * Badge "Em alta" — exibido nos cards das top N features pelo `trendingScore`
 * (S-D-11). Cálculo do "quem é trending" é feito em `lib/sort.ts#getTrendingFeatures`
 * e executado no Server Component (page.tsx / roadmap/page.tsx).
 *
 * Visual: pill `rounded-full` com gradient warning sutil + ícone Flame.
 * Cor herda de `var(--warning)` (pré-existente no design system) pra ficar
 * coerente com a paleta semantica do app principal. Sem hardcode hex.
 *
 * Tamanhos seguem escala canonica (ADR-035): xs/sm/md.
 * - xs (h-5 / 10px text): kanban card, contextos densos
 * - sm (h-6 / 11px text): feature card da home (default)
 * - md (h-7 / 12px text): destaque (hero, side panel)
 *
 * Acessibilidade: `aria-label` explícito porque o ícone Flame sozinho não
 * comunica o significado pra leitor de tela.
 */

interface TrendingBadgeProps {
  size?: "xs" | "sm" | "md";
  /** Quando true, mostra so o icone (sem label). Util pra contextos super-densos. */
  iconOnly?: boolean;
}

const SIZE_MAP = {
  xs: {
    height: "h-5",
    px: "px-1.5",
    text: "text-[10px]",
    icon: "h-3 w-3",
    gap: "gap-0.5",
  },
  sm: {
    height: "h-6",
    px: "px-2",
    text: "text-[11px]",
    icon: "h-3 w-3",
    gap: "gap-1",
  },
  md: {
    height: "h-7",
    px: "px-2.5",
    text: "text-[12px]",
    icon: "h-3.5 w-3.5",
    gap: "gap-1",
  },
} as const;

export function TrendingBadge({
  size = "sm",
  iconOnly = false,
}: TrendingBadgeProps) {
  const s = SIZE_MAP[size];

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.height} ${s.px} ${s.text} rounded-full font-bold uppercase tracking-wide flex-shrink-0`}
      style={{
        // Gradient sutil: warning-bg → fade laranja-orange via brand-cta-light
        background:
          "linear-gradient(135deg, var(--warning-bg) 0%, rgba(252, 158, 28, 0.22) 100%)",
        color: "var(--warning)",
        border: "1px solid rgba(202, 138, 4, 0.35)",
      }}
      aria-label="Feature em alta — uma das mais comentadas e votadas recentemente"
      title="Em alta — uma das features mais comentadas e votadas nos últimos dias"
    >
      <Flame
        className={s.icon}
        aria-hidden="true"
        strokeWidth={2.25}
      />
      {!iconOnly && <span>Em alta</span>}
    </span>
  );
}
