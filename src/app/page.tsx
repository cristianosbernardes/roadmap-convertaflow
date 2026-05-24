import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CategorySidebar } from "@/components/category-sidebar";
import { Leaderboard } from "@/components/leaderboard";
import { FeatureCard } from "@/components/feature-card";
import { FeatureListSkeleton } from "@/components/skeletons";
import { SortControl } from "@/components/sort-control";
import { STATUS_LIST } from "@/lib/constants";
import { getMockFeaturesByStatus } from "@/lib/mock-data";
import { parseSortParam, sortFeatures } from "@/lib/sort";

interface HomePageProps {
  searchParams: Promise<{ sort?: string | string[] }>;
}

/**
 * Home — listagem agrupada por status em coluna unica vertical.
 *
 * Layout escolhido por ADR-005 (vs kanban): melhor mobile, mais densidade
 * visual, suporta 7 status (kanban com 7 colunas e ilegivel).
 *
 * Ordenacao (S-C-04): mantemos agrupamento por status (semantica do roadmap
 * publico), mas DENTRO de cada grupo ordenamos pelo `?sort` selecionado.
 * Opcao A vs B: A (agrupada) preserva o "roadmap publico vs feed".
 *
 * Dados: por enquanto MOCK_FEATURES (ADR-016 mock-first).
 * Quando backend chegar, substituir por fetch SSR de GET /api/v1/roadmap/features.
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = parseSortParam(params.sort);

  // Apenas status com pelo menos 1 feature aparecem (evita secao vazia)
  // e respeitam a ordem canonica (sortOrder do enum).
  // Dentro de cada grupo, aplicar sort escolhido pelo usuario.
  const sections = STATUS_LIST.map((status) => ({
    status,
    features: sortFeatures(getMockFeaturesByStatus(status.slug), sort),
  })).filter((s) => s.features.length > 0);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header activePath="/" />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-6xl px-6 py-10"
      >
        {/* Hero (LP-style: 40px / 800 / -0.02em) */}
        <section className="mb-10">
          <div className="inline-block">
            <h1
              className="text-[40px] font-extrabold leading-[1.05] pb-2"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              O que estamos construindo
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
            className="text-[17px] mt-4 max-w-2xl leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Roadmap público da ConvertaFlow. Veja o que está em análise,
            planejado, em desenvolvimento e concluído. Vote nas features que
            mais importam pra você.
          </p>
        </section>

        {/* Grid: conteudo central + sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Conteudo central — agrupado por status */}
          <section className="flex-1 min-w-0">
            {/* Sort control — sincroniza com ?sort= na URL (nuqs). */}
            <div className="mb-6">
              <SortControl hideLabel />
            </div>

            <Suspense fallback={<FeatureListSkeleton count={6} />}>
              <div className="flex flex-col gap-10">
                {sections.map(({ status, features }) => (
                  <div key={status.slug}>
                    {/* Header da seção de status */}
                    <div className="flex items-center justify-between mb-3">
                      <h2
                        className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span>{status.emoji}</span>
                        <span>{status.label}</span>
                        <span
                          className="text-[12px] font-normal lowercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          · {features.length}
                        </span>
                      </h2>
                    </div>

                    {/* Lista de cards */}
                    <div className="flex flex-col gap-2.5">
                      {features.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Suspense>

            {/* Aviso mock — remover quando backend conectar */}
            <div
              className="mt-12 p-4 rounded-[10px] text-[13px]"
              style={{
                background: "var(--surface-low)",
                border: "1.5px solid var(--border-secondary)",
                color: "var(--text-muted)",
              }}
            >
              <strong style={{ color: "var(--text-secondary)" }}>
                Versão preview ({process.env.NEXT_PUBLIC_ENV ?? "dev"}):
              </strong>{" "}
              dados de exemplo. Em breve as features reais aparecem aqui.
              Acompanhe pelo{" "}
              <a
                href="https://app.convertaflow.com"
                className="underline"
                style={{ color: "var(--brand-primary)" }}
              >
                aplicativo ConvertaFlow
              </a>
              .
            </div>
          </section>

          {/* Sidebar direita */}
          <aside className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-6">
            <CategorySidebar activeSlug="all" />
            <Leaderboard />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
