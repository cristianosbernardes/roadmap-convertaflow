import Link from "next/link";
import { Compass } from "lucide-react";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#faf8ff" }}
    >
      <Header />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="mx-auto h-20 w-20 rounded-[10px] flex items-center justify-center mb-6"
            style={{
              background: "var(--surface-card)",
              border: "1.5px solid var(--border-primary)",
              color: "var(--brand-primary)",
            }}
          >
            <Compass className="h-10 w-10" />
          </div>
          <h1
            className="text-[28px] font-extrabold tracking-tight mb-2"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            Página não encontrada
          </h1>
          <p
            className="text-[15px] mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Essa rota não existe ou a feature foi removida do roadmap.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-all hover:brightness-110"
            style={{
              background:
                "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            Voltar para o roadmap
          </Link>
        </div>
      </main>
    </div>
  );
}
