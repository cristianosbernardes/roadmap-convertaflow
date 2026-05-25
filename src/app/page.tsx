import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CategorySidebar } from "@/components/category-sidebar";
import { Leaderboard } from "@/components/leaderboard";
import { FeatureCard } from "@/components/feature-card";
import { FeatureListSkeleton } from "@/components/skeletons";
import { SortControl } from "@/components/sort-control";
import { StatusFilter } from "@/components/status-filter";
import { EmptyState } from "@/components/empty-state";
import { STATUSES, STATUS_LIST } from "@/lib/constants";
import {
  getMockFeaturesByStatus,
  MOCK_FEATURES,
} from "@/lib/mock-data";
import {
  getTrendingFeatures,
  parseSortParam,
  sortFeatures,
} from "@/lib/sort";
import { parseStatusParam } from "@/lib/status-filter";

interface HomePageProps {
  searchParams: Promise<{
    sort?: string | string[];
    status?: string | string[];
  }>;
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
 * Filtro por status (S-D-05): quando `?status=...` esta presente, a home
 * desliga o agrupamento e mostra uma lista plana ordenada apenas do status
 * filtrado. Tab "Todos" (status=null) volta ao layout agrupado. Decisao UX:
 * filtro != null implica foco em UM status, agrupamento por status fica
 * redundante (so 1 secao) — lista plana reduz ruido visual e respeita
 * o sort escolhido sem hierarquia desnecessaria.
 *
 * Dados: por enquanto MOCK_FEATURES (ADR-016 mock-first).
 * Quando backend chegar, substituir por fetch SSR de GET /api/v1/roadmap/features.
 *
 * TODO Sprint 3 (backend): expor `?status=...` em GET /api/v1/roadmap/features
 * pra que o filtro funcione com paginacao server-side e queries SQL diretas
 * (WHERE status = ...) ao inves de filtrar em memoria.
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = parseSortParam(params.sort);
  const statusFilter = parseStatusParam(params.status);

  // Top 3 features "Em alta" pelo trendingScore (S-D-11). Calculado UMA vez
  // aqui no SSR e propagado pros cards via prop — evita recomputar em cada
  // render e centraliza a regra (filtro de status + threshold + topN).
  const trendingIds = getTrendingFeatures(MOCK_FEATURES, 3);

  // Modo filtrado (status != null): lista plana, ordenada pelo `sort` atual.
  // Modo agrupado (status == null): secoes por status canonico, cada uma
  // ordenada pelo `sort` atual. Apenas status com >= 1 feature aparecem
  // (evita secao vazia) e respeitam a ordem canonica do enum.
  const filteredFeatures = statusFilter
    ? sortFeatures(
        MOCK_FEATURES.filter((f) => f.status === statusFilter),
        sort,
      )
    : null;

  const sections = !statusFilter
    ? STATUS_LIST.map((status) => ({
        status,
        features: sortFeatures(getMockFeaturesByStatus(status.slug), sort),
      })).filter((s) => s.features.length > 0)
    : [];

  const filteredStatusConfig = statusFilter ? STATUSES[statusFilter] : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />

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
          {/* Conteudo central — agrupado por status (ou lista plana se filtrado) */}
          <section className="flex-1 min-w-0">
            {/* Filtro por status — tabs horizontais (S-D-05).
                Acima do SortControl: filtro define ESCOPO (o que vejo),
                sort define ORDEM (como vejo). Fluxo natural top-down. */}
            <div className="mb-3">
              <StatusFilter hideLabel />
            </div>

            {/* Sort control — sincroniza com ?sort= na URL (nuqs). */}
            <div className="mb-6">
              <SortControl hideLabel />
            </div>

            <Suspense fallback={<FeatureListSkeleton count={6} />}>
              {filteredFeatures && filteredStatusConfig ? (
                filteredFeatures.length > 0 ? (
                  // Modo filtrado: lista plana ordenada do status escolhido.
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2
                        className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span>{filteredStatusConfig.emoji}</span>
                        <span>{filteredStatusConfig.label}</span>
                        <span
                          className="text-[12px] font-normal lowercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          · {filteredFeatures.length}
                        </span>
                      </h2>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {filteredFeatures.map((feature) => (
                        <FeatureCard
                          key={feature.id}
                          feature={feature}
                          isTrending={trendingIds.has(feature.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  // Empty state: filtro retornou 0. CTA limpa o filtro.
                  <EmptyState
                    icon={Inbox}
                    iconColor="muted"
                    title={`Nenhuma feature em ${filteredStatusConfig.label} no momento.`}
                    body="Esse status está vazio por enquanto. Veja o que está acontecendo nos outros status do roadmap ou sugira uma nova feature."
                    cta={{ label: "Ver todas", href: "/" }}
                    ctaSecondary={{
                      label: "Sugerir feature",
                      href: "/nova",
                    }}
                    bordered
                  />
                )
              ) : (
                // Modo agrupado: secoes por status (default).
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
                          <FeatureCard
                            key={feature.id}
                            feature={feature}
                            isTrending={trendingIds.has(feature.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
