import Link from "next/link";
import { ChevronUp, MessageCircle } from "lucide-react";
import type { Feature } from "@/types/roadmap";
import { CategoryIcon } from "@/components/category-icon";

/**
 * Card compacto pro kanban /roadmap.
 * Mais denso que o FeatureCard da home — sem badges de status (status é a coluna).
 * Inspirado [[01 - ZDG (Upvoty white-label)]] §6.
 */
export function KanbanCard({ feature }: { feature: Feature }) {
  return (
    <Link
      href={`/feature/${feature.slug}`}
      className="group block"
    >
      <article
        className="flex items-center gap-3 p-3 transition-colors"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
          borderRadius: "10px",
        }}
      >
        <CategoryIcon category={feature.category} size="sm" />

        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-[13px] leading-snug truncate group-hover:underline underline-offset-2"
            style={{ color: "var(--text-primary)" }}
          >
            {feature.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center gap-0.5 text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              <MessageCircle className="h-3 w-3" />
              {feature.commentCount}
            </span>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center px-2 py-1 rounded-[8px] flex-shrink-0"
          style={{
            border: feature.hasVoted
              ? "1.5px solid var(--brand-primary)"
              : "1.5px solid var(--border-secondary)",
            background: feature.hasVoted
              ? "var(--info-bg)"
              : "var(--surface-low)",
            color: feature.hasVoted
              ? "var(--brand-primary)"
              : "var(--text-primary)",
            minWidth: "44px",
          }}
        >
          <ChevronUp className="h-3 w-3" strokeWidth={2.5} />
          <span className="text-[12px] font-bold tabular-nums leading-none">
            {feature.voteCount}
          </span>
        </div>
      </article>
    </Link>
  );
}
