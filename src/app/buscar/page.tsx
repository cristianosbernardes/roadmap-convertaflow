import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchX, Sparkles, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FeatureCard } from "@/components/feature-card";
import { FeatureListSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/empty-state";
import { SortControl } from "@/components/sort-control";
import { searchFeatures } from "@/lib/search";
import { sortFeatures, isSortKey } from "@/lib/sort";
import type { Feature } from "@/types/roadmap";

/**
 * Pagina dedicada de resultados de busca (S-C-05).
 *
 * Lida diretamente com `?q=` e `?sort=` (deep-linkable, compartilhavel).
 *
 * Ordenacao:
 *   - Default (sem `?sort=`): RELEVANCIA do Fuse (score ascendente).
 *     Faz sentido editorial: usuario buscou X, queremos mostrar o que
 *     mais combina com X primeiro.
 *   - Se usuario seleciona "Mais votados/Recentes/Em alta/Mais comentados"
 *     via SortControl, aplicamos sortFeatures() sobre o conjunto ja
 *     filtrado pelo Fuse. NAO refazemos busca — apenas reordenamos.
 *
 * Por que essa hibridacao: queremos que /buscar?q=ia ainda receba "Em alta"
 * etc, mas sem inverter o filtro (que sempre vem do Fuse). Quando backend
 * Sprint 4 chegar e expor /buscar?q&sort, o servidor faz isso nativamente.
 */
export const dynamic = "force-dynamic"; // searchParams.q muda por request

interface BuscarPageProps {
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>;
}

export async function generateMetadata({
  searchParams,
}: BuscarPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? "").trim();
  if (!q) {
    return {
      title: "Buscar features",
      description:
        "Encontre features do roadmap por palavra-chave, categoria ou tema.",
      // Pagina dinamica de busca nao deve ser indexada (sem conteudo canonico).
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `Busca: ${q}`,
    description: `Resultados de busca para "${q}" no roadmap ConvertaFlow.`,
    robots: { index: false, follow: false },
  };
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const sp = await searchParams;
  const query = (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? "").trim();
  const sortParam = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  // Apenas chaves validas alem do "relevance" implicito (default).
  const sortKey = isSortKey(sortParam) ? sortParam : null;

  // Busca client-side (Fuse) executada no server tambem — mesma funcao pura,
  // mesmo resultado. Quando backend Sprint 4 chegar, vira fetch SSR.
  const results = query.length >= 2 ? searchFeatures(query, 50) : [];
  const features: Feature[] = sortKey
    ? sortFeatures(
        results.map((r) => r.feature),
        sortKey,
      )
    : results.map((r) => r.feature);

  const hasQuery = query.length >= 2;
  const hasResults = features.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header activePath="/" />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-10 w-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--surface-low)",
                color: "var(--brand-primary)",
              }}
              aria-hidden="true"
            >
              <Search className="h-5 w-5" />
            </div>
            <div>
              {hasQuery ? (
                <h1
                  className="text-[28px] font-extrabold leading-tight"
                  style={{
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Resultados para &ldquo;{query}&rdquo;
                </h1>
              ) : (
                <h1
                  className="text-[28px] font-extrabold leading-tight"
                  style={{
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Buscar features
                </h1>
              )}
              <p
                className="text-[13px] mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {hasQuery
                  ? `${features.length} resultado${features.length === 1 ? "" : "s"} encontrado${features.length === 1 ? "" : "s"}`
                  : "Digite ao menos 2 letras pra começar"}
              </p>
            </div>
          </div>
        </section>

        {/* Sort + Lista */}
        <Suspense fallback={<FeatureListSkeleton count={5} />}>
          {!hasQuery ? (
            <EmptyState
              icon={Search}
              iconColor="brand"
              title="O que você procura?"
              body="Use a barra acima ou o atalho Ctrl+K (Cmd+K no Mac) pra abrir a busca rápida. Você também pode navegar pelas categorias na home."
              cta={{
                label: "Ver todas as categorias",
                href: "/",
              }}
              bordered
            />
          ) : !hasResults ? (
            <EmptyState
              icon={SearchX}
              iconColor="muted"
              title={`Nenhum resultado para "${query}"`}
              body="Tente termos diferentes ou navegue pelas categorias. Se a feature que você procura ainda não existe, sugira pra equipe avaliar."
              cta={{
                label: "Ver categorias",
                href: "/",
              }}
              ctaSecondary={{
                label: "Sugerir feature",
                href: "/nova",
                icon: Sparkles,
              }}
              bordered
            />
          ) : (
            <>
              {/* Sort control — default trending na URL, mas a pagina cai pra
                  relevancia do Fuse quando ?sort= ausente. Trocar pra outra
                  opcao reordena sobre a lista ja filtrada. */}
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <p
                  className="text-[12px] uppercase tracking-wider font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {sortKey ? "Reordenando por" : "Ordenado por relevância"}
                </p>
                <SortControl hideLabel />
              </div>

              <ul className="flex flex-col gap-2.5">
                {features.map((f) => (
                  <li key={f.id}>
                    <FeatureCard feature={f} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
