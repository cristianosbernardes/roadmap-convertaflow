"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Error boundary global (App Router).
 *
 * Renderiza quando uma pagina lanca exception nao tratada em runtime.
 * Microcopy editorial ConvertaFlow (Sprint C — S-C-12): tom acolhedor,
 * sem jargão burocrático tipo "Algo deu errado" / "Tivemos um problema".
 *
 * Componente client-only (App Router exige `"use client"` em error.tsx).
 * Por isso usamos metadata estatica do layout — title fica
 * "Roadmap ConvertaFlow — O que estamos construindo" (default) nesta
 * rota, o que é aceitável porque é fallback emergencial e o usuário
 * vai recarregar/sair em segundos.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log pra observabilidade — futura fase 0.9 plugar Sentry/Highlight aqui.
    // Mantemos console.error por enquanto pra debugging local + Vercel logs.
    console.error("[roadmap] error boundary capturou:", error);
  }, [error]);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: "#faf8ff" }}
    >
      <div className="max-w-md text-center">
        <div
          className="mx-auto inline-flex items-center justify-center h-20 w-20 rounded-full mb-6"
          style={{
            background:
              "linear-gradient(135deg, var(--warning-bg) 0%, var(--surface-low) 100%)",
            border: "1.5px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <AlertTriangle
            className="h-9 w-9"
            style={{ color: "var(--warning)" }}
            strokeWidth={1.75}
          />
        </div>
        <h1
          className="text-[24px] font-extrabold tracking-tight mb-3"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          Travou alguma coisa por aqui.
        </h1>
        <p
          className="text-[15px] leading-relaxed mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Não foi você. Foi a gente. Acontece — e quando acontece, anotamos
          pra consertar rápido.
        </p>
        {error.digest && (
          <p
            className="text-[12px] mt-4 mb-2 inline-block px-2 py-1 rounded-[7px]"
            style={{
              color: "var(--text-muted)",
              background: "var(--surface-low)",
              border: "1px solid var(--border-secondary)",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            ref: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
            style={{
              background:
                "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Tentar de novo
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] text-[14px] font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
            style={{
              background: "var(--surface-low)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-secondary)",
            }}
          >
            <Home className="h-4 w-4" />
            Voltar pro roadmap
          </Link>
        </div>
      </div>
    </main>
  );
}
