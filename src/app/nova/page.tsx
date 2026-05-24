import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NewFeatureForm } from "@/components/new-feature-form";

export const metadata: Metadata = {
  title: "Sugerir nova feature",
  description:
    "Sugira uma feature pro roadmap ConvertaFlow. Toda sugestão entra em moderação e aparece no roadmap quando aprovada.",
};

/**
 * /nova — formulário pra sugerir feature.
 *
 * Regras (ADR-026 + ADR-027):
 *   - Visitante anônimo: vê paywall (modal "crie conta gratis")
 *   - Logado: pode sugerir (3/dia, título ≥10, descrição ≥30)
 *   - Assinante: pode sugerir (10/dia)
 *   - Moderação híbrida (STRICT default ON no MVP): sugestão entra em pending_review
 *
 * Mock-only: simula POST sem chamar API. Backend Sprint 3 implementa.
 */
export default function NewFeaturePage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        <section className="mb-8">
          <div className="inline-block">
            <h1
              className="text-[32px] font-extrabold leading-[1.05] pb-2"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Sugerir nova feature
            </h1>
            <div
              className="h-[2px] rounded-full"
              style={{
                width: "60px",
                background:
                  "linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-cta) 100%)",
              }}
            />
          </div>
          <p
            className="text-[15px] mt-4 max-w-2xl leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Sua sugestão entra em moderação. Quando aprovada pela equipe,
            aparece publicamente pra outros clientes votarem e comentarem.
            Antes de sugerir, dê uma busca rápida — pode ser que alguém já
            tenha proposto algo parecido.
          </p>
        </section>

        <NewFeatureForm />
      </main>

      <Footer />
    </div>
  );
}
