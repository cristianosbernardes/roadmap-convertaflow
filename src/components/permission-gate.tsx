"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Check,
  MessagesSquare,
  Lightbulb,
  TrendingUp,
  LifeBuoy,
  Lock,
  type LucideIcon,
} from "lucide-react";
import type { BlockReason } from "@/lib/permissions";
import type { PendingActionType } from "@/lib/auth-redirect";
import { redirectToLogin, redirectToSignup } from "@/lib/auth-redirect";

/**
 * Modal que aparece quando usuario tenta uma acao que nao pode fazer.
 * Honestidade total: explica o que falta + oferece CTA correto.
 *
 * Redesign benefit-driven (Sprint C/S-C-09 — Auditoria UX-UI v2 A.4):
 *   - Ilustração grande temática por actionType (vs cadeado solto)
 *   - Microcopy benefit-first (vs "Comentários são só pra cadastrados")
 *   - Lista de 2-3 benefícios concretos (Productlane/Linear style)
 *   - Footer de reasurance ("Sem cartão de crédito · Cancele quando quiser")
 *
 * Auth flow (ADR-029 — SSO unificado estilo Google):
 *   CTAs "signin"/"signup" redirecionam pra app.convertaflow.com/login|register
 *   com `?return_to=<url-atual>`, e o cookie compartilhado em `.convertaflow.com`
 *   traz a sessao de volta. Sem modal Clerk inline.
 *
 * Inspirado [[06 - Productlane]] (UX recuada) + [[05 - Frill.co]] (paywall claro).
 * Detalhes em [[ADRs]] #026 + #029.
 */

/**
 * Mapa actionType → ícone Lucide temático.
 * Substitui o cadeado genérico anterior por um ícone que comunica o
 * benefício da ação bloqueada (mensagem pra comentário, lâmpada pra ideia, etc).
 */
const ACTION_ICONS: Record<PendingActionType, LucideIcon> = {
  comment: MessagesSquare,
  "comment-reply": MessagesSquare,
  suggestion: Lightbulb,
  "vote-priority": TrendingUp,
  "bug-report": LifeBuoy,
};

function getIllustrationIcon(
  actionType: PendingActionType | undefined
): LucideIcon {
  if (actionType && ACTION_ICONS[actionType]) {
    return ACTION_ICONS[actionType];
  }
  return Lock;
}

export function PermissionGateModal({
  reason,
  onClose,
}: {
  reason: BlockReason | null;
  onClose: () => void;
}) {
  if (!reason) return null;

  const pending = reason.actionType
    ? { type: reason.actionType }
    : undefined;

  const IllustrationIcon = getIllustrationIcon(reason.actionType);

  const renderCta = (cta: BlockReason["cta"], isPrimary: boolean) => {
    const baseClass = isPrimary
      ? "inline-flex items-center justify-center h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 w-full sm:w-auto"
      : "inline-flex items-center justify-center h-10 px-5 rounded-[10px] text-[14px] font-semibold transition-opacity hover:opacity-80 w-full sm:w-auto";
    const primaryStyle = {
      background:
        "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
      boxShadow: "var(--shadow-sm)",
    };
    const secondaryStyle = {
      background: "var(--surface-low)",
      color: "var(--text-primary)",
    };

    if (cta.action === "signin") {
      return (
        <button
          type="button"
          className={baseClass}
          style={isPrimary ? primaryStyle : secondaryStyle}
          onClick={() => {
            onClose();
            redirectToLogin({ pendingAction: pending });
          }}
        >
          {cta.label}
        </button>
      );
    }
    if (cta.action === "signup") {
      return (
        <button
          type="button"
          className={baseClass}
          style={isPrimary ? primaryStyle : secondaryStyle}
          onClick={() => {
            onClose();
            redirectToSignup({ pendingAction: pending });
          }}
        >
          {cta.label}
        </button>
      );
    }
    if (cta.action === "upgrade" && cta.href) {
      return (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener"
          className={baseClass}
          style={
            isPrimary
              ? {
                  background:
                    "linear-gradient(180deg, var(--brand-cta) 0%, #ea8e1a 100%)",
                  boxShadow: "var(--shadow-cta)",
                  color: "#ffffff",
                }
              : secondaryStyle
          }
        >
          <Sparkles className="h-4 w-4 mr-1.5" />
          {cta.label}
        </a>
      );
    }
    return (
      <button
        type="button"
        className={baseClass}
        style={secondaryStyle}
        onClick={onClose}
      >
        {cta.label}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2, 23, 74, 0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[10px] p-6 sm:p-7"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
          boxShadow: "var(--shadow-float)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-[10px] flex items-center justify-center transition-colors hover:bg-[var(--surface-low)]"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </button>

        {/* Ilustração temática — gradiente brand + ícone grande */}
        <div className="flex justify-center mb-5">
          <div
            className="relative h-24 w-24 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-deeper) 100%)",
              boxShadow:
                "0 12px 32px rgba(30, 127, 212, 0.28), inset 0 -2px 6px rgba(2, 23, 74, 0.15)",
              transform: "rotate(-4deg)",
            }}
          >
            <IllustrationIcon
              className="h-12 w-12"
              style={{ color: "#ffffff", transform: "rotate(4deg)" }}
              strokeWidth={1.75}
            />
            {/* Pequeno highlight pra dar profundidade */}
            <span
              aria-hidden
              className="absolute top-2 left-3 h-3 w-6 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
                filter: "blur(2px)",
              }}
            />
          </div>
        </div>

        <h2
          className="text-[20px] font-bold text-center mb-2"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {reason.title}
        </h2>

        <p
          className="text-[14px] leading-relaxed text-center mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          {reason.body}
        </p>

        {/* Lista de benefícios — só renderiza se houver bullets */}
        {reason.benefits && reason.benefits.length > 0 && (
          <ul
            className="flex flex-col gap-2.5 mb-6 p-4 rounded-[10px]"
            style={{
              background: "var(--surface-low)",
              border: "1px solid var(--border-secondary)",
            }}
          >
            {reason.benefits.map((benefit, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[13px] leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-px"
                  style={{
                    background: "var(--brand-primary)",
                    color: "#ffffff",
                  }}
                  aria-hidden
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-center gap-2">
          {reason.ctaSecondary && renderCta(reason.ctaSecondary, false)}
          {renderCta(reason.cta, true)}
        </div>

        {/* Footer de reassurance — "Sem cartão de crédito", etc */}
        {reason.footer && (
          <p
            className="text-[12px] text-center mt-4"
            style={{ color: "var(--text-muted)" }}
          >
            {reason.footer}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Componente wrapper que renderiza children OU intercepta click pra mostrar modal de bloqueio.
 *
 * Uso:
 *   <PermissionGate when={!canVote(ctx)} reason={voteBlockReason}>
 *     <button onClick={vote}>Votar</button>
 *   </PermissionGate>
 */
export function PermissionGate({
  when,
  reason,
  children,
}: {
  /** Se TRUE, intercepta clicks e mostra modal */
  when: boolean;
  reason: BlockReason | null;
  children: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!when || !reason) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setModalOpen(true);
        }}
        className="inline-block cursor-pointer"
      >
        {children}
      </span>
      {modalOpen && (
        <PermissionGateModal
          reason={reason}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
