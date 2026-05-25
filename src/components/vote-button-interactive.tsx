"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast-presets";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getLocalVote,
  setLocalVote,
  checkVoteRateLimit,
  getOrCreateVoterCookie,
  type VoteType,
} from "@/lib/voter-cookie";
import { fireVoteConfetti } from "@/lib/celebrate";

/**
 * Vote button interativo híbrido — modelo ZDG (ADR-026 + ADR-034 + S-D-01).
 *
 * Ícones ThumbsUp/ThumbsDown (refinamento UX 2026-05-24):
 *   - Chevrons originais eram ambíguos sem tooltip ("sobe/desce item?")
 *   - Thumbs é semântica universal (Facebook, YouTube, Apple Reviews)
 *   - Tooltip shadcn explícito em cada botão remove qualquer dúvida
 *
 * 2 botões públicos:
 *   👍 Positivo — contador PÚBLICO visível, fill quando ativo
 *   👎 Negativo — contador PRIVADO (não exposto na UI; backend coleta pra staff/CRM)
 *
 * Lógica:
 *   - Mutuamente exclusivo: votar em 👎 quando já tem 👍 DESFAZ o 👍 e SETA 👎
 *   - Toggle: clicar de novo no mesmo tipo remove o voto
 *   - Optimistic UI: contador atualiza imediato, rollback se rate limit
 *   - Rate limit cobre ambos (1 bucket de 20/24h anônimo)
 *
 * Mock-only no momento — persistência local. Backend POST /vote chega Sprint 3
 * com schema CHECK (vote_type IN ('up','oppose')) já antecipado.
 *
 * A11y:
 *   - Tooltip shadcn substitui title= HTML (delay 200ms, visual controlado)
 *   - aria-label dinâmico em cada botão (independente do tooltip)
 *   - aria-pressed no estado ativo
 *   - aria-live="polite" no count span (anuncia mudanças)
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

    // Captura rect ANTES de qualquer await/setState — currentTarget é null
    // depois do handler React (event pooling-like behavior em delegação).
    const buttonRect = (
      e.currentTarget as HTMLElement
    ).getBoundingClientRect();

    const isAdding = vote !== type;
    if (isAdding) {
      const { canVote, retryAfterSeconds, reason } = checkVoteRateLimit();
      if (!canVote) {
        toastError(
          reason ?? "Aguarde antes de votar de novo",
          retryAfterSeconds
            ? `Tente em ${formatRetry(retryAfterSeconds)}`
            : undefined
        );
        return;
      }
    }

    const previous = vote;
    const newState = setLocalVote(featureSlug, type);

    let delta = 0;
    if (previous === "up" && newState !== "up") delta -= 1;
    if (previous !== "up" && newState === "up") delta += 1;
    if (delta !== 0) setCount((c) => c + delta);
    setVote(newState);

    if (newState === "up") {
      toastSuccess(
        "Voto positivo registrado",
        "Obrigado por sinalizar interesse nesta feature."
      );
      // Confetti sutil (1x por sessão) — ancorado no botão clicado.
      // NÃO dispara em vote negativo, remove vote, ou após rate limit
      // (early return acima já bloqueou esses caminhos).
      fireVoteConfetti(buttonRect);
    } else if (newState === "oppose") {
      toastSuccess(
        "Sinalização registrada",
        "Anotamos que esta feature não interessa pra você. Nos ajuda a priorizar."
      );
    }
  };

  // aria-labels (sempre presentes pra screen reader — tooltip é visual extra)
  const upLabel =
    vote === "up"
      ? `Remover voto positivo. Total atual: ${count} ${count === 1 ? "voto" : "votos"}`
      : `Votar positivo. Total atual: ${count} ${count === 1 ? "voto" : "votos"}`;
  const opposeLabel =
    vote === "oppose"
      ? "Remover sinalização de desinteresse"
      : "Sinalizar que esta feature não interessa pra você";

  // tooltip texts (editorial, transparente sobre coleta privada)
  const upTooltip =
    vote === "up"
      ? "Clique pra remover seu voto"
      : "Votar positivo · sua opinião conta na priorização";
  const opposeTooltip =
    vote === "oppose"
      ? "Clique pra remover a sinalização"
      : "Não tem interesse? · anotamos privadamente pra melhorar";

  // Dimensões por variant.
  // Regra de proporção: ícones decorativos = ~70% do tamanho do texto-protagonista
  // (heurística Apple HIG / Material). Texto principal aqui é o contador.
  //   large: count 20px → ícone 14px (h-3.5)
  //   card:  count 14px → ícone 12px (h-3) com strokeWidth menor pra leveza
  const iconSize = variant === "large" ? "h-3.5 w-3.5" : "h-3 w-3";
  const iconStroke = variant === "large" ? 2 : 1.75;
  const buttonH = variant === "large" ? "h-9" : "h-7";
  const containerMinW = variant === "large" ? "72px" : "56px";
  const countSize =
    variant === "large"
      ? "text-[20px] font-extrabold"
      : "text-[14px] font-bold";

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
        minWidth: containerMinW,
      }}
      suppressHydrationWarning
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleVote("up")}
            className={`flex items-center justify-center ${buttonH} w-full rounded-[7px] transition-all hover:bg-[var(--surface-low)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-card)] max-md:min-h-[44px]`}
            style={{
              color:
                vote === "up" ? "var(--brand-primary)" : "var(--text-muted)",
            }}
            aria-label={upLabel}
            aria-pressed={vote === "up"}
          >
            <ThumbsUp
              className={iconSize}
              strokeWidth={iconStroke}
              fill={vote === "up" ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          {upTooltip}
        </TooltipContent>
      </Tooltip>

      <span
        className={`${countSize} tabular-nums leading-none`}
        style={{ color: "var(--text-primary)" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {count}
      </span>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleVote("oppose")}
            className={`flex items-center justify-center ${buttonH} w-full rounded-[7px] transition-all hover:bg-[var(--surface-low)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-card)] max-md:min-h-[44px]`}
            style={{
              color:
                vote === "oppose"
                  ? "var(--text-secondary)"
                  : "var(--text-muted)",
            }}
            aria-label={opposeLabel}
            aria-pressed={vote === "oppose"}
          >
            <ThumbsDown
              className={iconSize}
              strokeWidth={iconStroke}
              fill={vote === "oppose" ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {opposeTooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function formatRetry(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)}h`;
  return `${Math.ceil(seconds / 86400)} dia${seconds > 86400 ? "s" : ""}`;
}
