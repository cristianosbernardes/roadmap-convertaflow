import { Header } from "@/components/header";
import { FeatureListSkeleton } from "@/components/skeletons";

/**
 * Loading global pra rotas em SSR — fallback final (App Router segment loading).
 * Usa FeatureListSkeleton porque a maioria das rotas top-level mostra lista de
 * features (home, categoria, status, /nova). Rotas com layout diferente
 * (feature/[slug], changelog, roadmap) podem definir loading.tsx proprio depois.
 *
 * Mantemos visualmente alinhado ao restante (mesma cor de fundo, header presente)
 * em vez do antigo spinner generico que parecia desconectado.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
        {/* Hero placeholder — reserva espaco do titulo pra evitar layout shift */}
        <div className="mb-10 space-y-3" aria-hidden="true">
          <div
            className="h-9 w-80 rounded-[7px] animate-pulse"
            style={{ background: "var(--surface-low)" }}
          />
          <div
            className="h-4 w-2/3 max-w-lg rounded-[7px] animate-pulse"
            style={{ background: "var(--surface-low)" }}
          />
        </div>

        {/* Grid: lista + sidebar (mesma estrutura da home) */}
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="flex-1 min-w-0">
            <FeatureListSkeleton count={6} />
          </section>

          <aside
            className="w-full lg:w-[300px] flex-shrink-0"
            aria-hidden="true"
          >
            <div
              className="h-64 rounded-[10px] animate-pulse"
              style={{ background: "var(--surface-low)" }}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
