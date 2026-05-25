"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bookmark, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { resetVoterCookie } from "@/lib/voter-cookie";
import {
  useVotedFeatures,
  notifyVotesChanged,
  type VotedFeatureEntry,
} from "@/hooks/use-voted-features";

/**
 * Histórico "Você votou em" — popover do header (S-D-13).
 *
 * Lista as features que o user (anônimo ou logado) votou — fonte hoje é o
 * cookie/localStorage `cf_roadmap_local_votes`. Quando backend chegar (Sprint 3),
 * troca por GET `/me/votes` + merge com cookie.
 *
 * Visibilidade:
 *   - Esconde COMPLETAMENTE se count === 0 (só aparece pra quem já votou).
 *   - Aparece tanto anônimo (cookie) quanto logado (mesma fonte mock-first).
 *
 * Implementação manual (state + click-outside + ESC) — mesma abordagem do
 * `ShareButton` pra manter consistência visual (rounded-[10px] + 1.5px border
 * primary). Evita destoar do design system com `bg-popover` do shadcn padrão.
 *
 * A11y:
 *   - Trigger: aria-label, aria-haspopup=menu, aria-expanded, aria-controls
 *   - Menu: role=menu, items role=menuitem
 *   - ESC fecha + devolve foco ao trigger
 *   - Click fora fecha
 *   - Touch targets ≥ 44px (items h-12 mobile, h-11 desktop = 44px)
 *
 * Mobile (< sm):
 *   - Trigger só mostra ícone + count (sem label "Histórico").
 *   - Popover usa max-w viewport (right-0) com margem segura.
 */
export function VotedFeaturesPopover() {
  const { entries, count, hydrated, refresh } = useVotedFeatures();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();

  // Fecha ESC + click fora.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (
        wrapperRef.current &&
        target &&
        !wrapperRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const handleClearAll = useCallback(() => {
    resetVoterCookie();
    notifyVotesChanged();
    refresh();
    setOpen(false);
  }, [refresh]);

  // Pré-hidratação: renderiza placeholder neutro pra evitar layout shift +
  // flash do "count==0 escondido → count==N visível".
  if (!hydrated) {
    return <div className="h-10 w-10" aria-hidden />;
  }

  // Sem votos → não renderiza nada (cláusula do spec).
  if (count === 0) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Histórico de votos (${count} ${count === 1 ? "feature" : "features"})`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-[10px] text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]"
        style={{
          background: open ? "var(--surface-low)" : "transparent",
          border: "1px solid var(--border-secondary)",
          color: "var(--text-primary)",
        }}
      >
        <Bookmark className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Histórico</span>
        <span
          className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold"
          style={{
            background: "var(--brand-primary)",
            color: "#ffffff",
          }}
        >
          {count}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Histórico de votos"
          className="fixed sm:absolute right-3 sm:right-0 top-[64px] sm:top-[calc(100%+6px)] z-50 w-[min(360px,calc(100vw-24px))] rounded-[10px] flex flex-col"
          style={{
            background: "var(--surface-card)",
            border: "1.5px solid var(--border-primary)",
            boxShadow:
              "0 12px 32px rgba(2, 23, 74, 0.12), 0 4px 10px rgba(2, 23, 74, 0.06)",
            maxHeight: "min(560px, calc(100vh - 96px))",
          }}
        >
          {/* Header do popover */}
          <div
            className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-secondary)" }}
          >
            <div className="flex flex-col leading-tight">
              <span
                className="text-[13px] font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Você votou em
              </span>
              <span
                className="text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                {count} {count === 1 ? "feature" : "features"}
              </span>
            </div>
          </div>

          {/* Lista com scroll interno (mostra ~8 visíveis antes de rolar) */}
          <ul
            className="flex-1 overflow-y-auto p-1 flex flex-col gap-0.5"
            role="presentation"
          >
            {entries.map((entry) => (
              <VotedFeatureItem
                key={entry.feature.id}
                entry={entry}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </ul>

          {/* Footer: Limpar histórico */}
          <div
            className="px-1 py-1 flex-shrink-0"
            style={{ borderTop: "1px solid var(--border-secondary)" }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleClearAll}
              className="w-full inline-flex items-center gap-2 h-11 px-2.5 rounded-[7px] text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              style={{
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-low)";
                e.currentTarget.style.borderColor = "var(--border-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "var(--surface-low)";
                e.currentTarget.style.borderColor = "var(--border-secondary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
              <span>Limpar histórico</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Item individual da lista de features votadas.
 * Estrutura: [ícone categoria sm] [título + ago] [chip 👍/👎]
 */
function VotedFeatureItem({
  entry,
  onNavigate,
}: {
  entry: VotedFeatureEntry;
  onNavigate: () => void;
}) {
  const { feature, voteType } = entry;
  const ago = formatDistanceToNow(new Date(feature.updatedAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const isUp = voteType === "up";

  return (
    <li>
      <Link
        href={`/feature/${feature.slug}`}
        role="menuitem"
        onClick={onNavigate}
        className="flex items-center gap-2.5 min-h-[56px] px-2 py-1.5 rounded-[7px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
        style={{
          background: "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--surface-low)";
          e.currentTarget.style.borderColor = "var(--border-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = "var(--surface-low)";
          e.currentTarget.style.borderColor = "var(--border-secondary)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
        }}
      >
        <CategoryIcon category={feature.category} size="sm" />

        <div className="flex-1 min-w-0 flex flex-col leading-tight">
          <span
            className="text-[13px] font-semibold line-clamp-2"
            style={{ color: "var(--text-primary)" }}
          >
            {feature.title}
          </span>
          <span
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {ago}
          </span>
        </div>

        <span
          className="inline-flex items-center justify-center h-7 w-7 rounded-full flex-shrink-0"
          style={{
            background: isUp
              ? "rgba(22, 163, 74, 0.12)"
              : "rgba(220, 38, 38, 0.12)",
            color: isUp ? "#16a34a" : "#dc2626",
          }}
          aria-label={isUp ? "Voto positivo" : "Voto contra"}
          title={isUp ? "Voto positivo" : "Voto contra"}
        >
          {isUp ? (
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
          )}
        </span>
      </Link>
    </li>
  );
}
