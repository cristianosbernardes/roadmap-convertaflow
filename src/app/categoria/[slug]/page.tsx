import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FeatureCard } from "@/components/feature-card";
import { FeatureListSkeleton } from "@/components/skeletons";
import { CategoryIcon } from "@/components/category-icon";
import { CategorySidebar } from "@/components/category-sidebar";
import { EmptyState } from "@/components/empty-state";
import { SortControl } from "@/components/sort-control";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";
import { getMockFeaturesByCategory } from "@/lib/mock-data";
import { parseSortParam, sortFeatures } from "@/lib/sort";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES[slug as CategorySlug];
  if (!category) {
    return { title: "Categoria não encontrada" };
  }
  return {
    title: `${category.label} — Roadmap`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = parseSortParam(sp.sort);

  const category = CATEGORIES[slug as CategorySlug];
  if (!category) {
    notFound();
  }

  // Lista unica ordenada (sem agrupamento por status nessa rota).
  const features = sortFeatures(getMockFeaturesByCategory(slug), sort);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13px] mb-4 hover:underline"
          style={{ color: "var(--brand-primary)" }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar para o roadmap
        </Link>

        {/* Hero categoria */}
        <section className="mb-8">
          <div className="flex items-start gap-4">
            <CategoryIcon category={slug as CategorySlug} size="lg" />
            <div>
              <h1
                className="text-[28px] font-extrabold tracking-tight"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                {category.label}
              </h1>
              <p
                className="text-[14px] mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {category.description}
              </p>
              <p
                className="text-[12px] mt-2"
                style={{ color: "var(--text-muted)" }}
              >
                {features.length} sugest
                {features.length === 1 ? "ão" : "ões"} nessa categoria
              </p>
            </div>
          </div>
        </section>

        {/* Grid: lista + sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="flex-1 min-w-0">
            <Suspense fallback={<FeatureListSkeleton count={5} />}>
              {features.length === 0 ? (
                <EmptyState
                  icon={category.icon}
                  iconColor="brand"
                  title={`Nenhuma sugestão em ${category.label} ainda.`}
                  body="Seja o primeiro a sugerir uma feature pra esta categoria. Sua ideia entra em moderação e aparece aqui assim que aprovada pela equipe."
                  cta={{
                    label: "Sugerir feature",
                    href: `/nova?categoria=${slug}`,
                    icon: Sparkles,
                  }}
                  ctaSecondary={{
                    label: "Ver todas as categorias",
                    href: "/",
                  }}
                  bordered
                />
              ) : (
                <>
                  {/* Sort control — sincroniza com ?sort= na URL (nuqs). */}
                  <div className="mb-4">
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
          </section>

          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <CategorySidebar activeSlug={slug} />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
