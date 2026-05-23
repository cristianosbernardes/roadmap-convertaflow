import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FeatureCard } from "@/components/feature-card";
import { CategoryIcon } from "@/components/category-icon";
import { CategorySidebar } from "@/components/category-sidebar";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";
import { getMockFeaturesByCategory } from "@/lib/mock-data";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = CATEGORIES[slug as CategorySlug];
  if (!category) {
    notFound();
  }

  const features = getMockFeaturesByCategory(slug);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header activePath="/" />

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
            {features.length === 0 ? (
              <div
                className="rounded-[10px] p-8 text-center"
                style={{
                  background: "var(--surface-card)",
                  border: "1.5px dashed var(--border-primary)",
                }}
              >
                <p
                  className="text-[14px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ainda não há sugestões nesta categoria. Quer ser o primeiro?
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {features.map((f) => (
                  <li key={f.id}>
                    <FeatureCard feature={f} />
                  </li>
                ))}
              </ul>
            )}
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
