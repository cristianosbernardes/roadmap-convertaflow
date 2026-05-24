"use client";

import { useState } from "react";
import { X, Lock, Sparkles } from "lucide-react";
import type { BlockReason } from "@/lib/permissions";
import { redirectToLogin, redirectToSignup } from "@/lib/auth-redirect";

/**
 * Modal que aparece quando usuario tenta uma acao que nao pode fazer.
 * Honestidade total: explica o que falta + oferece CTA correto.
 *
 * Auth flow (ADR-029 — SSO unificado estilo Google):
 *   CTAs "signin"/"signup" redirecionam pra app.convertaflow.com/login|register
 *   com `?return_to=<url-atual>`, e o cookie compartilhado em `.convertaflow.com`
 *   traz a sessao de volta. Sem modal Clerk inline.
 *
 * Inspirado [[06 - Productlane]] (UX recuada) + [[05 - Frill.co]] (paywall claro).
 * Detalhes em [[ADRs]] #026 + #029.
 */
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

  const renderCta = (cta: BlockReason["cta"], isPrimary: boolean) => {
    const baseClass = isPrimary
      ? "inline-flex items-center justify-center h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
      : "inline-flex items-center justify-center h-10 px-5 rounded-[10px] text-[14px] font-semibold transition-opacity hover:opacity-80";
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
        className="relative w-full max-w-md rounded-[10px] p-6"
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
          className="absolute top-4 right-4 h-8 w-8 rounded-[8px] flex items-center justify-center transition-colors hover:bg-[var(--surface-low)]"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </button>

        <div
          className="h-12 w-12 rounded-[10px] flex items-center justify-center mb-4"
          style={{
            background: "var(--surface-low)",
            color: "var(--brand-primary)",
          }}
        >
          <Lock className="h-5 w-5" />
        </div>

        <h2
          className="text-[18px] font-bold mb-2"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {reason.title}
        </h2>

        <p
          className="text-[14px] leading-relaxed mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          {reason.body}
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
          {reason.ctaSecondary && renderCta(reason.ctaSecondary, false)}
          {renderCta(reason.cta, true)}
        </div>
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
