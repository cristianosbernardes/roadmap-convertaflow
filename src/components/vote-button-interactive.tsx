"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  getLocalVote,
  setLocalVote,
  checkVoteRateLimit,
  getOrCreateVoterCookie,
  type VoteType,
} from "@/lib/voter-cookie";

/**
 * Vote button interativo híbrido — modelo ZDG (ADR-026 + ADR-034).
 *
 * 2 botões públicos:
 *   ▲ Positivo — contador PÚBLICO visível
 *   ▼ Negativo — contador PRIVADO (não exposto na UI; backend coleta pra staff/CRM)
 *
 * Lógica:
 *   - Mutuamente exclusivo: votar em ▼ quando já tem ▲ DESFAZ o ▲ e SETA ▼
 *   - Toggle: clicar de novo no mesmo tipo remove o voto
 *   - Optimistic UI: contador atualiza imediato, rollback se rate limit
 *   - Rate limit cobre ambos (1 bucket de 20/24h anônimo)
 *
 * Mock-only no momento — persistência local. Backend POST /vote chega Sprint 3
 * com schema CHECK (vote_type IN ('up','oppose')) já antecipado.
 *
 * A11y:
 *   - Cada botão tem aria-label explícito (sem depender de ícone)
 *   - aria-pressed no estado ativo
 *   - aria-live="polite" no count span (anuncia mudanças)
 *   - Sem aria-live no ▼ (sem contador público)
 *   - Focus ring brand em :focus-visible (S-C-08)
 *   - Touch targets ≥ 44px em mobile via min-h (S-C-10)
 */
export function VoteButtonInteractive({
  featureSlug,
  initialVoteCount,
  initialHasVoted,
  variant = "card",
}: {
  featureSlug: string;
  initialVoteCount: number;
  /** Compat: true = pré-marca como 'up'. Pra oppose pré-marcado, hidrata via cookie no mount */
  initialHasVoted?: boolean;
  variant?: "card" | "large";
}) {
  const [vote, setVote] = useState<VoteType | null>(
    initialHasVoted ? "up" : null
  );
  const [count, setCount] = useState<number>(initialVoteCount);

  // Hidrata estado do localStorage no mount (cookie persistente)
  useEffect(() => {
    getOrCreateVoterCookie();
    const localVote = getLocalVote(featureSlug);
    if (localVote) {
      setVote((prev) => {
        // Se já tinha 'up' inicial e cookie tem 'up' → mantém (count já +1)
        // Se cookie tem 'oppose' → seta sem mexer no count (oppose privado)
        // Se cookie tem 'up' mas prev era null → +1 no count
        if (prev === localVote) return prev;
        if (localVote === "up" && prev !== "up") {
          setCount((c) => c + 1);
        }
        if (prev === "up" && localVote !== "up") {
          setCount((c) => c - 1);
        }
        return localVote;
      });
    }
  }, [featureSlug]);

  const handleVote = (type: VoteType) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isAdding = vote !== type; // está virando esse tipo (não desfazendo)
    if (isAdding) {
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

    // Optimistic update — calcula delta no contador público
    const previous = vote;
    const newState = setLocalVote(featureSlug, type);

    // Delta no contador público depende de transição:
    //   null → up:        +1
    //   null → oppose:     0
    //   up → null:        -1
    //   up → oppose:      -1   (mutex: desfaz o up, oppose é privado)
    //   oppose → null:     0
    //   oppose → up:      +1   (mutex: desfaz oppose, soma up)
    //   up → up (toggle): -1   (remove)
    //   oppose → oppose:   0   (remove, mas oppose era privado)
    let delta = 0;
    if (previous === "up" && newState !== "up") delta -= 1;
    if (previous !== "up" && newState === "up") delta += 1;
    if (delta !== 0) setCount((c) => c + delta);
    setVote(newState);

    // Feedback editorial — diferenciado pra up vs oppose
    if (newState === "up") {
      toast.success("Voto positivo registrado", {
        description: "Obrigado por sinalizar interesse nesta feature.",
        duration: 2500,
      });
    } else if (newState === "oppose") {
      toast.success("Sinalização registrada", {
        description:
          "Anotamos que esta feature não interessa pra você. Nos ajuda a priorizar.",
        duration: 3000,
      });
    }
  };

  // aria-labels — incluem contagem positiva (única exposta publicamente)
  const upLabel =
    vote === "up"
      ? `Remover voto positivo. Total atual: ${count} ${count === 1 ? "voto" : "votos"}`
      : `Votar positivo. Total atual: ${count} ${count === 1 ? "voto" : "votos"}`;
  const opposeLabel =
    vote === "oppose"
      ? "Remover sinalização de desinteresse"
      : "Sinalizar que não tem interesse nesta feature";

  if (variant === "large") {
    return (
      <div
        className="inline-flex flex-col items-center gap-1 p-2 rounded-[10px]"
        style={{
          border:
            vote === "up"
              ? "1.5px solid var(--brand-primary)"
              : vote === "oppose"
                ? "1.5px solid var(--border-secondary)"
                : "1.5px solid var(--border-primary)",
          background:
            vote === "up"
              ? "var(--info-bg)"
              : vote === "oppose"
                ? "var(--surface-low)"
                : "var(--surface-card)",
          minWidth: "72px",
        }}
      >
        <button
          type="button"
          onClick={handleVote("up")}
          className="flex items-center justify-center h-9 w-full rounded-[7px] transition-all hover:bg-[var(--surface-low)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-card)] max-md:min-h-[44px]"
          style={{
            color:
              vote === "up" ? "var(--brand-primary)" : "var(--text-muted)",
          }}
          aria-label={upLabel}
          aria-pressed={vote === "up"}
        >
          <ChevronUp className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
        </button>
        <span
          className="text-[20px] font-extrabold tabular-nums leading-none"
          style={{ color: "var(--text-primary)" }}
          aria-live="polite"
          aria-atomic="true"
        >
          {count}
        </span>
        <button
          type="button"
          onClick={handleVote("oppose")}
          className="flex items-center justify-center h-9 w-full rounded-[7px] transition-all hover:bg-[var(--surface-low)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-card)] max-md:min-h-[44px]"
          style={{
            color:
              vote === "oppose"
                ? "var(--text-secondary)"
                : "var(--text-muted)",
          }}
          aria-label={opposeLabel}
          aria-pressed={vote === "oppose"}
          title={opposeLabel}
        >
          <ChevronDown
            className="h-6 w-6"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </button>
      </div>
    );
  }

  // Variant card (compact)
  return (
    <div
      className="inline-flex flex-col items-center gap-0.5 p-1 rounded-[10px] flex-shrink-0"
      style={{
        border:
          vote === "up"
            ? "1.5px solid var(--brand-primary)"
            : vote === "oppose"
              ? "1.5px solid var(--border-secondary)"
              : "1.5px solid var(--border-primary)",
        background:
          vote === "up"
            ? "var(--info-bg)"
            : vote === "oppose"
              ? "var(--surface-low)"
              : "var(--surface-card)",
        minWidth: "56px",
      }}
      suppressHydrationWarning
    >
      <button
        type="button"
        onClick={handleVote("up")}
        className="flex items-center justify-center h-7 w-full rounded-[7px] transition-all hover:bg-[var(--surface-low)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-card)] max-md:min-h-[44px]"
        style={{
          color: vote === "up" ? "var(--brand-primary)" : "var(--text-muted)",
        }}
        aria-label={upLabel}
        aria-pressed={vote === "up"}
      >
        <ChevronUp className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
      </button>
      <span
        className="text-[14px] font-bold tabular-nums leading-none"
        style={{ color: "var(--text-primary)" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {count}
      </span>
      <button
        type="button"
        onClick={handleVote("oppose")}
        className="flex items-center justify-center h-7 w-full rounded-[7px] transition-all hover:bg-[var(--surface-low)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-card)] max-md:min-h-[44px]"
        style={{
          color:
            vote === "oppose"
              ? "var(--text-secondary)"
              : "var(--text-muted)",
        }}
        aria-label={opposeLabel}
        aria-pressed={vote === "oppose"}
        title={opposeLabel}
      >
        <ChevronDown className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}

function formatRetry(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)}h`;
  return `${Math.ceil(seconds / 86400)} dia${seconds > 86400 ? "s" : ""}`;
}
