import { ChevronUp } from "lucide-react";
import type { Feature } from "@/types/roadmap";

/**
 * Vote button grande pra pagina de feature individual.
 * Inspirado [[01 - ZDG (Upvoty white-label)]] — vertical com chevron grande.
 *
 * Versao mock — quando backend chegar, vira <VoteButtonLarge feature={f} />
 * client component com optimistic update via TanStack Query.
 */
export function VoteButtonLarge({ feature }: { feature: Feature }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-[10px] transition-all hover:brightness-105"
      style={{
        border: feature.hasVoted
          ? "1.5px solid var(--brand-primary)"
          : "1.5px solid var(--border-primary)",
        background: feature.hasVoted
          ? "var(--info-bg)"
          : "var(--surface-card)",
        color: feature.hasVoted
          ? "var(--brand-primary)"
          : "var(--text-primary)",
        minWidth: "72px",
      }}
      aria-label={feature.hasVoted ? "Remover voto" : "Votar"}
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
      <span className="text-[20px] font-extrabold tabular-nums leading-none">
        {feature.voteCount}
      </span>
      <span
        className="text-[10px] uppercase tracking-wider font-semibold"
        style={{
          color: feature.hasVoted
            ? "var(--brand-primary)"
            : "var(--text-muted)",
        }}
      >
        {feature.hasVoted ? "Votado" : "Votos"}
      </span>
    </button>
  );
}
