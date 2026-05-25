import Link from "next/link";
import { ChevronUp } from "lucide-react";
import type { Feature } from "@/types/roadmap";
import { CategoryIcon } from "@/components/category-icon";
import { StatusBadge } from "@/components/status-badge";
import { MOCK_FEATURES } from "@/lib/mock-data";
import { trendingScore } from "@/lib/sort";
import { CATEGORIES } from "@/lib/constants";

/**
 * S-D-14 — Bloco "Veja também" no rodapé da página de feature.
 *
 * Mostra até 4 features RELACIONADAS pela mesma categoria, ordenadas
 * por trendingScore desc (mais relevantes primeiro). Renderiza `null`
 * quando a categoria tem menos de 2 outras features (evita poluir o
 * rodapé com 1 item solto, conforme decisão editorial S-D-14).
 *
 * Server Component — cálculo de relacionados acontece no SSR/ISR
 * (sem hidratação extra no cliente).
 */
const MAX_RELATED = 4;
const MIN_RELATED = 2;

export function RelatedFeatures({ currentFeature }: { currentFeature: Feature }) {
  const now = Date.now();

  const related = MOCK_FEATURES.filter(
    (f) => f.category === currentFeature.category && f.id !== currentFeature.id,
  )
    .map((f) => ({ feature: f, score: trendingScore(f, now) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RELATED)
    .map((entry) => entry.feature);

  if (related.length < MIN_RELATED) {
    return null;
  }

  const category = CATEGORIES[currentFeature.category];

  return (
    <section
      aria-labelledby="related-features-heading"
      className="mt-12"
    >
      <h2
        id="related-features-heading"
        className="text-[14px] font-semibold uppercase tracking-wider mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Veja também — outras features de {category.label}
      </h2>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((rel) => (
          <li key={rel.id}>
            <Link
              href={`/feature/${rel.slug}`}
              className="group block rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
            >
              <article
                className="flex items-start gap-3 p-4 min-h-[88px] transition-all duration-200 ease-out will-change-transform hover:scale-[1.005] hover:shadow-[0_4px_12px_rgba(30,127,212,0.08)] active:scale-[0.995]"
                style={{
                  background: "var(--surface-card)",
                  border: "1.5px solid var(--border-primary)",
                  borderRadius: "10px",
                }}
              >
                <CategoryIcon category={rel.category} size="sm" />

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-[14px] leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-1"
                    style={{ color: "var(--text-primary)" }}
                    title={rel.title}
                  >
                    {rel.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={rel.status} />
                    <span
                      className="inline-flex items-center gap-0.5 text-[12px] tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      {rel.voteCount}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
