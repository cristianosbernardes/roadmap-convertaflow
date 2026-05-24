"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SmilePlus } from "lucide-react";
import { toast } from "sonner";
import {
  REACTION_EMOJIS,
  getLocalReactionsForComment,
  hasLocalReaction,
  toggleLocalReaction,
  type ReactionEmoji,
} from "@/lib/comment-reactions";
import type { MockReaction } from "@/lib/mock-data";

/**
 * Barra de reactions interativa pra comentarios.
 *
 * Mock-first (ADR-026): toggle persiste em localStorage; backend chega Sprint 3
 * com POST /comments/:id/react + lista de voters via JOIN server-side.
 *
 * Visual:
 *   [👍 5] [❤️ 12] [🎉 3]  [+]   ← '+' abre picker inline
 *                            ↓ picker
 *                          [👍][❤️][🎉][🚀][👀]
 *
 * Estados visuais por chip:
 *   - Inativo:    border 1px secondary, bg transparent
 *   - Hover:      bg surface-low
 *   - Ativo (voce reagiu): border 1.5px brand-primary, bg info-bg
 *
 * A11y:
 *   - aria-pressed em cada chip
 *   - aria-label completo em PT-BR ("Reagir com coracao, 12 reacoes")
 *   - Picker: ESC fecha, click fora fecha, focus ring visivel
 *   - Touch targets >= 44px no mobile (S-C-10)
 */
export function ReactionsBar({
  commentId,
  initialReactions,
}: {
  commentId: number;
  initialReactions: MockReaction[];
}) {
  // ─── Estado otimista ────────────────────────────────────────────────
  // Map emoji → count agregado. So inclui emojis canonicos (filtra legados).
  const [counts, setCounts] = useState<Map<ReactionEmoji, number>>(() => {
    const map = new Map<ReactionEmoji, number>();
    for (const r of initialReactions) {
      if ((REACTION_EMOJIS as readonly string[]).includes(r.emoji)) {
        map.set(r.emoji as ReactionEmoji, r.count);
      }
    }
    return map;
  });

  // Set de emojis que VOCE reagiu (hidratado do localStorage no mount).
  const [myReactions, setMyReactions] = useState<Set<ReactionEmoji>>(
    () => new Set()
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // ─── Hidratacao do localStorage (cookie persistente) ────────────────
  useEffect(() => {
    const mine = getLocalReactionsForComment(commentId);
    if (mine.length === 0) return;

    // Ajusta counts: pra cada reaction local que voce tem, soma +1 se o
    // backend mock nao ja contou voce. Como o mock nao sabe quem voce e',
    // assumimos que initialReactions NAO inclui voce — entao soma sempre.
    setMyReactions(new Set(mine));
    setCounts((prev) => {
      const next = new Map(prev);
      for (const emoji of mine) {
        next.set(emoji, (next.get(emoji) ?? 0) + 1);
      }
      return next;
    });
  }, [commentId]);

  // ─── Close picker em ESC ou click fora ──────────────────────────────
  useEffect(() => {
    if (!pickerOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPickerOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [pickerOpen]);

  // ─── Acao: toggle reaction (chip existente OU pick novo do picker) ──
  const handleReact = useCallback(
    (emoji: ReactionEmoji) => {
      const wasReacted = hasLocalReaction(commentId, emoji);
      const nowReacted = toggleLocalReaction(commentId, emoji);

      // Otimista: ajusta state baseado no novo valor
      setMyReactions((prev) => {
        const next = new Set(prev);
        if (nowReacted) next.add(emoji);
        else next.delete(emoji);
        return next;
      });

      setCounts((prev) => {
        const next = new Map(prev);
        const current = next.get(emoji) ?? 0;
        const delta = nowReacted ? +1 : -1;
        const updated = current + delta;
        if (updated <= 0) next.delete(emoji);
        else next.set(emoji, updated);
        return next;
      });

      // Toast editorial (curto, positivo)
      if (nowReacted && !wasReacted) {
        toast.success("Reação registrada", { duration: 1500 });
      }
    },
    [commentId]
  );

  const handlePickerChoice = useCallback(
    (emoji: ReactionEmoji) => {
      handleReact(emoji);
      setPickerOpen(false);
      triggerRef.current?.focus();
    },
    [handleReact]
  );

  // ─── Ordenacao estavel: canonical order (REACTION_EMOJIS) ───────────
  const visibleChips = useMemo(() => {
    return REACTION_EMOJIS.filter((e) => (counts.get(e) ?? 0) > 0);
  }, [counts]);

  return (
    <div className="relative inline-flex items-center gap-1.5 flex-wrap">
      {/* Chips de reactions com count > 0 */}
      {visibleChips.map((emoji) => {
        const count = counts.get(emoji) ?? 0;
        const isMine = myReactions.has(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReact(emoji)}
            aria-pressed={isMine}
            aria-label={`Reagir com ${describeEmoji(emoji)}, ${count} ${
              count === 1 ? "reação" : "reações"
            }${isMine ? ", você reagiu" : ""}`}
            // S-C-10 (Auditoria UX-UI v2 — D.3): touch target >= 44px mobile.
            // Desktop mantem h-7 (28px) — sem regressao visual.
            className="inline-flex items-center gap-1 px-2 h-7 max-md:min-h-[44px] rounded-full text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]"
            style={{
              background: isMine ? "var(--info-bg)" : "var(--surface-card)",
              border: isMine
                ? "1.5px solid var(--brand-primary)"
                : "1px solid var(--border-secondary)",
              color: isMine
                ? "var(--brand-primary)"
                : "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (!isMine) {
                e.currentTarget.style.background = "var(--surface-low)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isMine) {
                e.currentTarget.style.background = "var(--surface-card)";
              }
            }}
          >
            <span aria-hidden="true">{emoji}</span>
            <span className="tabular-nums font-medium">{count}</span>
          </button>
        );
      })}

      {/* Trigger do picker (+ Reagir) */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        aria-label="Adicionar reação"
        aria-haspopup="true"
        aria-expanded={pickerOpen}
        // S-C-10: touch target >= 44px mobile.
        className="inline-flex items-center gap-1 px-2 h-7 max-md:min-h-[44px] rounded-full text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]"
        style={{
          color: pickerOpen
            ? "var(--brand-primary)"
            : "var(--text-muted)",
          border: "1px dashed var(--border-secondary)",
          background: pickerOpen ? "var(--surface-low)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!pickerOpen) {
            e.currentTarget.style.background = "var(--surface-low)";
            e.currentTarget.style.color = "var(--brand-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (!pickerOpen) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }
        }}
      >
        <SmilePlus className="h-3.5 w-3.5" aria-hidden="true" />
        {visibleChips.length === 0 && <span>Reagir</span>}
      </button>

      {/* Picker (popover inline) */}
      {pickerOpen && (
        <div
          ref={pickerRef}
          role="menu"
          aria-label="Escolher emoji para reagir"
          // posicionamento: logo abaixo do trigger, alinhado a direita
          // do row de chips — z-10 pra sobrepor reactions adjacentes.
          className="absolute top-full left-0 mt-1.5 z-10 flex items-center gap-0.5 p-1.5 rounded-full shadow-lg"
          style={{
            background: "var(--surface-card)",
            border: "1.5px solid var(--border-primary)",
            // Slight elevation feel — sombra reservada pra dropdowns reais
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
          }}
        >
          {REACTION_EMOJIS.map((emoji) => {
            const isMine = myReactions.has(emoji);
            return (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                onClick={() => handlePickerChoice(emoji)}
                aria-label={`Reagir com ${describeEmoji(emoji)}${
                  isMine ? " (remover sua reação)" : ""
                }`}
                // Picker items: 32px desktop, 44px mobile (S-C-10).
                className="inline-flex items-center justify-center h-8 w-8 max-md:min-h-[44px] max-md:min-w-[44px] rounded-full text-[16px] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] hover:scale-125"
                style={{
                  background: isMine ? "var(--info-bg)" : "transparent",
                }}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Descricao acessivel do emoji em PT-BR pra aria-label.
 * Sem isso, screen readers leem "U+1F44D" ou nada.
 */
function describeEmoji(emoji: ReactionEmoji): string {
  switch (emoji) {
    case "👍":
      return "joinha";
    case "❤️":
      return "coração";
    case "🎉":
      return "festa";
    case "🚀":
      return "foguete";
    case "👀":
      return "olhos";
  }
}
