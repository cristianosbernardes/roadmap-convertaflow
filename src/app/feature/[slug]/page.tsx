import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, MessageCircle, Share2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VoteButtonInteractive } from "@/components/vote-button-interactive";
import { CommentEditor } from "@/components/comment-editor";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { FeatureArticleLd } from "@/components/json-ld";
import { FeatureSidePanel } from "@/components/feature-side-panel";
import { CommentThread } from "@/components/comment-thread";
import { CommentsThreadSkeleton } from "@/components/skeletons";
import { CategoryIcon } from "@/components/category-icon";
import {
  getMockFeatureBySlug,
  getMockCommentsForFeature,
  getRelatedMockFeatures,
} from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/constants";

// ISR: regenera a cada 60s (cláusula §8 do app)
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getMockFeatureBySlug(slug);
  if (!feature) {
    return { title: "Feature não encontrada" };
  }
  return {
    title: feature.title,
    description: feature.description.slice(0, 160),
    openGraph: {
      title: feature.title,
      description: feature.description.slice(0, 160),
      type: "article",
    },
  };
}

export default async function FeaturePage({ params }: PageProps) {
  const { slug } = await params;
  const feature = getMockFeatureBySlug(slug);

  if (!feature) {
    notFound();
  }

  const comments = getMockCommentsForFeature(feature.id);
  const related = getRelatedMockFeatures(feature, 3);
  const category = CATEGORIES[feature.category];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <FeatureArticleLd feature={feature} />
      <Header activePath="/" />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-[12px] mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          <Link href="/" className="hover:underline">
            Roadmap
          </Link>
          <span>›</span>
          <Link
            href={`/categoria/${category.slug}`}
            className="hover:underline"
          >
            {category.label}
          </Link>
          <span>›</span>
          <span style={{ color: "var(--text-secondary)" }}>
            {feature.title}
          </span>
        </nav>

        {/* Back link mobile */}
        <Link
          href="/"
          className="lg:hidden inline-flex items-center gap-1 text-[13px] mb-4 hover:underline"
          style={{ color: "var(--brand-primary)" }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar
        </Link>

        {/* Grid principal: conteudo + side panel */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna principal */}
          <section className="flex-1 min-w-0">
            {/* Cabeçalho da feature: vote + título */}
            <div className="flex items-start gap-4 mb-6">
              <VoteButtonInteractive
                featureSlug={feature.slug}
                initialVoteCount={feature.voteCount}
                initialHasVoted={feature.hasVoted}
                variant="large"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryIcon category={feature.category} size="sm" />
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {category.label}
                  </span>
                </div>
                <h1
                  className="text-[26px] font-extrabold tracking-tight leading-tight"
                  style={{
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {feature.title}
                </h1>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] font-semibold transition-colors"
                    style={{
                      background: "var(--surface-card)",
                      border: "1.5px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Compartilhar
                  </button>

                  <a
                    href="#comentarios"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] font-semibold transition-colors"
                    style={{
                      background: "var(--surface-card)",
                      border: "1.5px solid var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {feature.commentCount} comentário
                    {feature.commentCount === 1 ? "" : "s"}
                  </a>
                </div>
              </div>
            </div>

            {/* Descrição completa */}
            <div
              className="rounded-[10px] p-6 mb-8"
              style={{
                background: "var(--surface-card)",
                border: "1.5px solid var(--border-primary)",
              }}
            >
              <MarkdownRenderer
                content={feature.description}
                variant="feature"
              />
            </div>

            {/* Comentários */}
            <section id="comentarios">
              <h2
                className="text-[18px] font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Comentários ({comments.length})
              </h2>
              <Suspense fallback={<CommentsThreadSkeleton count={3} />}>
                <CommentThread comments={comments} featureSlug={feature.slug} />
              </Suspense>

              {/* Editor: gate de permissão + min chars + min/max validation */}
              <div className="mt-4">
                <CommentEditor featureSlug={feature.slug} />
              </div>
            </section>

            {/* Features relacionadas */}
            {related.length > 0 && (
              <section className="mt-12">
                <h2
                  className="text-[14px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Relacionadas em {category.label}
                </h2>
                <ul className="flex flex-col gap-2">
                  {related.map((rel) => (
                    <li key={rel.id}>
                      <Link
                        href={`/feature/${rel.slug}`}
                        className="flex items-center gap-3 p-3 rounded-[10px] transition-colors hover:bg-[var(--surface-low)]"
                        style={{
                          background: "var(--surface-card)",
                          border: "1.5px solid var(--border-secondary)",
                        }}
                      >
                        <CategoryIcon category={rel.category} size="sm" />
                        <span
                          className="flex-1 text-[13px] truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {rel.title}
                        </span>
                        <span
                          className="text-[12px] tabular-nums"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ▲ {rel.voteCount}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </section>

          {/* Side panel direita */}
          <FeatureSidePanel feature={feature} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
