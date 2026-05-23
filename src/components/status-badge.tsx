import { STATUSES, type StatusSlug } from "@/lib/constants";

/**
 * Badge de status no estilo outline + dot.
 * Inspirado em [[01 - ZDG (Upvoty white-label)]] — sem fill heavy.
 *
 * Cores por status definidas em src/lib/constants.ts.
 * Mapeamento explicito de cor base (hex) para o dot, pra evitar dependencia
 * de classes Tailwind dinamicas que o purge nao captura.
 */

const STATUS_COLORS: Record<StatusSlug, string> = {
  sob_analise: "#6b7280",
  planejado: "#0284c7",
  em_desenvolvimento: "#ea580c",
  beta_privado: "#9333ea",
  concluido: "#16a34a",
  pausado: "#ca8a04",
  nao_sera_feito: "#dc2626",
};

export function StatusBadge({
  status,
  showLabel = true,
  size = "sm",
}: {
  status: StatusSlug;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const cfg = STATUSES[status];
  const color = STATUS_COLORS[status];
  const isSm = size === "sm";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        padding: isSm ? "2px 8px" : "4px 12px",
        fontSize: isSm ? "11px" : "12px",
        border: `1px solid ${color}40`,
        color,
        background: `${color}0d`,
      }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{
          height: "6px",
          width: "6px",
          background: color,
        }}
      />
      {showLabel && cfg.label}
    </span>
  );
}
