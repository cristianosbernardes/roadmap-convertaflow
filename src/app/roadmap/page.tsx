import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { KanbanCard } from "@/components/kanban-card";
import { KanbanColumnSkeleton } from "@/components/skeletons";
import { STATUSES, type StatusSlug } from "@/lib/constants";
import { getMockFeaturesByStatus } from "@/lib/mock-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Roadmap — visão em colunas",
  description:
    "O que está em análise, em desenvolvimento e em beta privado no ConvertaFlow.",
};

/**
 * /roadmap — view kanban com 3 colunas principais.
 *
 * Decidimos mostrar APENAS os 3 status "em andamento":
 *   1. Em análise — captura interesse (sob_analise + planejado agrupados)
 *   2. Em desenvolvimento
 *   3. Beta privado
 *
 * "Concluído" vai pro /changelog. "Pausado" e "Não será feito" ficam só na home.
 * Isso evita scroll horizontal infinito de 7 colunas.
 */
const KANBAN_COLUMNS: {
  title: string;
  emoji: string;
  statuses: StatusSlug[];
  color: string;
}[] = [
  {
    title: "Sob análise & Planejados",
    emoji: "🔍",
    statuses: ["sob_analise", "planejado"],
    color: "#0284c7",
  },
  {
    title: "Em desenvolvimento",
    emoji: "🚧",
    statuses: ["em_desenvolvimento"],
    color: "#ea580c",
  },
  {
    title: "Beta privado",
    emoji: "🧪",
    statuses: ["beta_privado"],
    color: "#9333ea",
  },
];

export default function RoadmapPage() {
  const columns = KANBAN_COLUMNS.map((col) => ({
    ...col,
    features: col.statuses
      .flatMap((s) => getMockFeaturesByStatus(s))
      .sort((a, b) => b.voteCount - a.voteCount),
  }));

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header activePath="/roadmap" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        {/* Hero */}
        <section className="mb-6">
          <div className="inline-block">
            <h1
              className="text-[28px] font-extrabold tracking-tight pb-1.5"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
              }}
            >
              Roadmap (visão em colunas)
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
            Visualização kanban das features ativas. Para ver tudo (incluindo
            concluídas e pausadas), volte para a{" "}
            <Link
              href="/"
              className="underline"
              style={{ color: "var(--brand-primary)" }}
            >
              home
            </Link>
            . Para releases prontos, veja o{" "}
            <Link
              href="/changelog"
              className="underline"
              style={{ color: "var(--brand-primary)" }}
            >
              changelog
            </Link>
            .
          </p>
        </section>

        {/* Kanban grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col min-h-0">
              {/* Column header sticky */}
              <header
                className="flex items-center justify-between gap-2 px-1 pb-3 mb-3"
                style={{
                  borderBottom: `1.5px solid ${col.color}33`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: col.color }}
                  />
                  <h2
                    className="text-[13px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span className="mr-1">{col.emoji}</span>
                    {col.title}
                  </h2>
                </div>
                <span
                  className="text-[12px] tabular-nums font-semibold"
                  style={{ color: col.color }}
                >
                  {col.features.length}
                </span>
              </header>

              {/* Cards (Suspense fallback por coluna pra streaming progressivo) */}
              <Suspense fallback={<KanbanColumnSkeleton count={4} />}>
                {col.features.length === 0 ? (
                  <div
                    className="rounded-[10px] p-4 text-center text-[12px]"
                    style={{
                      background: "var(--surface-card)",
                      border: "1.5px dashed var(--border-primary)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Nada aqui ainda.
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {col.features.map((f) => (
                      <li key={f.id}>
                        <KanbanCard feature={f} />
                      </li>
                    ))}
                  </ul>
                )}
              </Suspense>
            </div>
          ))}
        </div>

        {/* Legenda secundaria — status fora do kanban */}
        <section
          className="mt-12 p-5 rounded-[10px]"
          style={{
            background: "var(--surface-card)",
            border: "1.5px solid var(--border-secondary)",
          }}
        >
          <h2
            className="text-[12px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Outros status
          </h2>
          <div className="flex flex-wrap gap-2">
            <StatusPill status="concluido" />
            <StatusPill status="pausado" />
            <StatusPill status="nao_sera_feito" />
          </div>
          <p
            className="text-[12px] mt-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Features concluídas têm página dedicada no{" "}
            <Link
              href="/changelog"
              className="underline"
              style={{ color: "var(--brand-primary)" }}
            >
              changelog
            </Link>
            . Pausadas e recusadas ficam visíveis na home com motivo público.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatusPill({ status }: { status: StatusSlug }) {
  const cfg = STATUSES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px]"
      style={{
        background: "var(--surface-low)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-secondary)",
      }}
    >
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}
