import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Copy, Rss } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ChangelogListSkeleton } from "@/components/skeletons";
import { MOCK_CHANGELOG, type MockChangelogEntry } from "@/lib/mock-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Histórico de releases do ConvertaFlow — o que foi entregue e quando.",
  alternates: {
    types: {
      "application/rss+xml": "/changelog/rss.xml",
    },
  },
};

/**
 * /changelog — layout 2 colunas inspirado [[01 - ZDG (Upvoty white-label)]] §8.
 * - Sticky esquerda: data + reactions + copy link
 * - Direita: corpo markdown + features relacionadas
 *
 * Versao mock (ADR-016). Quando backend chegar, vira fetch de
 * GET /api/v1/roadmap/changelog.
 */
export default function ChangelogPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-8">
        {/* Hero */}
        <section className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-block">
              <h1
                className="text-[28px] font-extrabold tracking-tight pb-1.5"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                Changelog
              </h1>
              <div
                className="h-[2px] rounded-full"
                style={{
                  width: "80px",
                  background:
                    "linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-cta) 100%)",
                }}
              />
            </div>
            <p
              className="text-[14px] mt-3 max-w-2xl"
              style={{ color: "var(--text-secondary)" }}
            >
              O que foi entregue recentemente no ConvertaFlow. Releases
              numerados por SemVer.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/changelog/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-3 rounded-[10px] text-[13px] font-semibold transition-colors hover:brightness-105"
              style={{
                background: "var(--surface-card)",
                color: "var(--text-secondary)",
                border: "1.5px solid var(--border-primary)",
              }}
              title="Assinar feed RSS do changelog"
              aria-label="Assinar feed RSS do changelog"
            >
              <Rss className="h-4 w-4" />
              RSS
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] text-[13px] font-semibold text-white transition-all hover:brightness-110"
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Bell className="h-4 w-4" />
              Inscrever-se em atualizações
            </button>
          </div>
        </section>

        {/* Lista de releases */}
        <Suspense fallback={<ChangelogListSkeleton count={3} />}>
          <ul className="flex flex-col gap-10">
            {MOCK_CHANGELOG.map((entry) => (
              <li key={entry.id}>
                <ChangelogItem entry={entry} />
              </li>
            ))}
          </ul>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

function ChangelogItem({ entry }: { entry: MockChangelogEntry }) {
  const dateFormatted = format(new Date(entry.releaseDate), "d MMM yyyy", {
    locale: ptBR,
  });

  return (
    <article className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
      {/* Coluna esquerda sticky */}
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="flex md:flex-col items-start gap-3">
          <div>
            <p
              className="text-[13px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {dateFormatted}
            </p>
            <p
              className="text-[12px] font-mono mt-0.5"
              style={{ color: "var(--brand-primary)" }}
            >
              {entry.releaseVersion}
            </p>
          </div>

          {/* Reactions + copy */}
          <div className="flex md:mt-3 items-center gap-1.5 flex-wrap">
            {entry.reactions.map((r) => (
              <span
                key={r.emoji}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px]"
                style={{
                  background: "var(--surface-card)",
                  border: "1.5px solid var(--border-secondary)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>{r.emoji}</span>
                <span className="tabular-nums">{r.count}</span>
              </span>
            ))}
            <button
              type="button"
              className="h-6 w-6 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-muted)",
              }}
              title="Copiar link"
              aria-label="Copiar link"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Coluna direita: conteúdo */}
      <div
        className="rounded-[10px] p-6"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
        }}
      >
        <h2
          className="text-[20px] font-bold mb-3"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {entry.title}
        </h2>

        {/* Markdown rico (react-markdown + remark-gfm) — ADR-024 Sprint A */}
        <MarkdownRenderer content={entry.bodyMarkdown} variant="default" />


        {entry.relatedFeatureSlugs.length > 0 && (
          <div
            className="mt-5 pt-4"
            style={{ borderTop: "1px solid var(--border-secondary)" }}
          >
            <p
              className="text-[11px] uppercase tracking-wider font-semibold mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Features relacionadas
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {entry.relatedFeatureSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/feature/${slug}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] transition-colors hover:underline"
                    style={{
                      background: "var(--surface-low)",
                      color: "var(--brand-primary)",
                      border: "1px solid var(--border-secondary)",
                    }}
                  >
                    {slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
