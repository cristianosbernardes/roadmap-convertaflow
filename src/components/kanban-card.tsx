import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Feature } from "@/types/roadmap";
import { CategoryIcon } from "@/components/category-icon";
import { VoteButtonInteractive } from "@/components/vote-button-interactive";

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

        <VoteButtonInteractive
          featureSlug={feature.slug}
          initialVoteCount={feature.voteCount}
          initialHasVoted={feature.hasVoted}
          variant="card"
        />
      </article>
    </Link>
  );
}
