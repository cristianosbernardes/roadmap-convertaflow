"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Error boundary global (App Router).
 * Renderiza quando uma pagina lanca exception nao tratada.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: enviar pra Sentry quando configurar (fase 0.9)
    console.error("[roadmap] erro nao tratado:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--surface-base)" }}
    >
      <div className="text-center max-w-md">
        <div
          className="mx-auto h-20 w-20 rounded-[10px] flex items-center justify-center mb-6"
          style={{
            background: "var(--danger-bg)",
            border: "1.5px solid var(--border-primary)",
            color: "var(--danger)",
          }}
        >
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1
          className="text-[24px] font-extrabold tracking-tight mb-2"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          Algo deu errado
        </h1>
        <p
          className="text-[14px] mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Tivemos um problema ao carregar essa página. Já registramos o erro
          aqui. Tente recarregar.
        </p>
        {error.digest && (
          <p
            className="text-[11px] mb-4 font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-all hover:brightness-110"
          style={{
            background:
              "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
