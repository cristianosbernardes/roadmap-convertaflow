import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Feature } from "@/types/roadmap";
import { CategoryIcon } from "@/components/category-icon";
import { StatusBadge } from "@/components/status-badge";
import { VoteButtonInteractive } from "@/components/vote-button-interactive";
import { CATEGORIES } from "@/lib/constants";

/**
 * Card de feature em layout horizontal.
 * Inspiracao primaria: [[06 - Productlane]] (lista vertical agrupada por status).
 *
 * Anatomia (esquerda → direita):
 *   - Icone de categoria colorido (caixa 40x40)
 *   - Conteudo: titulo + descricao 1 linha + meta (status badge, comments, tags)
 *   - Vote button vertical (chevron + contador)
 */
export function FeatureCard({ feature }: { feature: Feature }) {
  const category = CATEGORIES[feature.category];

  return (
    <Link
      href={`/feature/${feature.slug}`}
      className="group block rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
    >
      <article
        className="flex items-center gap-4 p-4 transition-all duration-200 ease-out will-change-transform hover:scale-[1.005] hover:shadow-[0_4px_12px_rgba(30,127,212,0.08)] active:scale-[0.995]"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
          borderRadius: "10px",
        }}
      >
        {/* Categoria icon */}
        <CategoryIcon category={feature.category} size="md" />

        {/* Conteudo central */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-[15px] leading-snug truncate group-hover:underline underline-offset-2 decoration-1"
            style={{ color: "var(--text-primary)" }}
          >
            {feature.title}
          </h3>
          <p
            className="text-[13px] leading-snug mt-0.5 line-clamp-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {feature.description}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge status={feature.status} />
            <span
              className="inline-flex items-center gap-1 text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {feature.commentCount}
            </span>
            <span
              className="text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              · {category.label}
            </span>
          </div>
        </div>

        {/* Vote button interativo (cookie anônimo + rate limit) */}
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
