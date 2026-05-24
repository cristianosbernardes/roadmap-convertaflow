"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  hasVotedLocal,
  toggleVoteLocal,
  checkVoteRateLimit,
  getOrCreateVoterCookie,
} from "@/lib/voter-cookie";

/**
 * Vote button interativo (client-side).
 *
 * Logica (ADR-026):
 *   - Anonimo: cookie UUID em localStorage (mock), max 20/24h, 5/min burst
 *   - Logado/assinante: tambem usa cookie inicialmente (sem mudanca de UX) +
 *     no backend (Sprint 4) sera merged ao user.id na primeira request autenticada
 *   - Toggle: 1 click vota, 2 clicks desfaz
 *   - Optimistic UI: contador atualiza imediato, rollback se rate limit
 *
 * Mock-only no momento — persistencia local. Backend POST /vote chega Sprint 3.
 */
export function VoteButtonInteractive({
  featureSlug,
  initialVoteCount,
  initialHasVoted,
  variant = "card",
}: {
  featureSlug: string;
  initialVoteCount: number;
  initialHasVoted?: boolean;
  variant?: "card" | "large";
}) {
  const [voted, setVoted] = useState<boolean>(initialHasVoted ?? false);
  const [count, setCount] = useState<number>(initialVoteCount);

  // Hidrata estado do localStorage no mount (cookie persistente)
  // Intencional: nao incluir 'voted' nas deps — so queremos hidratar 1x no mount
  useEffect(() => {
    getOrCreateVoterCookie(); // garante UUID gerado
    const localVoted = hasVotedLocal(featureSlug);
    if (localVoted) {
      setVoted((prev) => {
        if (!prev) {
          setCount((c) => c + 1);
          return true;
        }
        return prev;
      });
    }
  }, [featureSlug]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Se tentando ADICIONAR voto (nao desfazer), checa rate limit
    if (!voted) {
      const { canVote, retryAfterSeconds, reason } = checkVoteRateLimit();
      if (!canVote) {
        toast.error(reason ?? "Aguarde antes de votar de novo", {
          description: retryAfterSeconds
            ? `Tente em ${formatRetry(retryAfterSeconds)}`
            : undefined,
          duration: 4000,
        });
        return;
      }
    }

    // Optimistic toggle
    const newVoted = toggleVoteLocal(featureSlug);
    setVoted(newVoted);
    setCount((c) => (newVoted ? c + 1 : c - 1));

    if (newVoted) {
      toast.success("Voto registrado", {
        description: "Obrigado por contribuir com o roadmap.",
        duration: 2500,
      });
    }
  };

  if (variant === "large") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-[10px] transition-all hover:brightness-105 active:scale-95"
        style={{
          border: voted
            ? "1.5px solid var(--brand-primary)"
            : "1.5px solid var(--border-primary)",
          background: voted ? "var(--info-bg)" : "var(--surface-card)",
          color: voted ? "var(--brand-primary)" : "var(--text-primary)",
          minWidth: "72px",
        }}
        aria-label={voted ? "Remover voto" : "Votar"}
        aria-pressed={voted}
      >
        <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-[20px] font-extrabold tabular-nums leading-none">
          {count}
        </span>
        <span
          className="text-[10px] uppercase tracking-wider font-semibold"
          style={{
            color: voted ? "var(--brand-primary)" : "var(--text-muted)",
          }}
        >
          {voted ? "Votado" : "Votos"}
        </span>
      </button>
    );
  }

  // Variant card (compact)
  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-[10px] transition-all hover:brightness-105 active:scale-95 flex-shrink-0"
      style={{
        border: voted
          ? "1.5px solid var(--brand-primary)"
          : "1.5px solid var(--border-primary)",
        background: voted ? "var(--info-bg)" : "var(--surface-card)",
        color: voted ? "var(--brand-primary)" : "var(--text-primary)",
        minWidth: "56px",
      }}
      aria-label={voted ? "Remover voto" : "Votar"}
      aria-pressed={voted}
      suppressHydrationWarning
    >
      <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
      <span className="text-[14px] font-bold tabular-nums leading-none">
        {count}
      </span>
    </button>
  );
}

function formatRetry(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)}h`;
  return `${Math.ceil(seconds / 86400)} dia${seconds > 86400 ? "s" : ""}`;
}
