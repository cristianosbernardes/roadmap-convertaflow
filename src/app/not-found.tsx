import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Lightbulb } from "lucide-react";
import { Header } from "@/components/header";

/**
 * Metadata estatica pra rota /not-found (App Router).
 *
 * Fix bug Auditoria UX-UI v2 A.5 (Sprint C — S-C-12):
 * sem este export, o <title> da pagina 404 herdava o default da home
 * ("O que estamos construindo"), prejudicando SEO e UX no histórico do
 * navegador. Com `template: "%s — Roadmap ConvertaFlow"` no layout root,
 * o resultado final fica:
 *
 *     "Página não encontrada — Roadmap ConvertaFlow"
 *
 * Funciona tanto pra rota inexistente capturada pelo App Router quanto
 * pra `notFound()` programático chamado em pages SSR.
 */
export const metadata: Metadata = {
  title: "Página não encontrada",
  description:
    "A URL que você abriu não existe no roadmap da ConvertaFlow. Volte pro roadmap completo ou sugira uma nova feature.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <div
            className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "var(--surface-card)",
              border: "1.5px solid var(--border-primary)",
              color: "var(--brand-primary)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Compass className="h-9 w-9" strokeWidth={1.75} />
          </div>
          <h1
            className="text-[28px] font-extrabold tracking-tight mb-3"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            Essa página foi pro além.
          </h1>
          <p
            className="text-[15px] leading-relaxed mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            A URL que você abriu não existe (ou foi removida do roadmap).
            Vamos te levar de volta?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Compass className="h-4 w-4" />
              Ver roadmap completo
            </Link>
            <Link
              href="/nova"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] text-[14px] font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-secondary)",
              }}
            >
              <Lightbulb className="h-4 w-4" />
              Sugerir nova feature
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
