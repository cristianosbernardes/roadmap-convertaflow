"use client";

import { useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { canComment, getCommentBlockReason, LIMITS } from "@/lib/permissions";
import { PermissionGateModal } from "@/components/permission-gate";

/**
 * Editor de comentario com permission gate + min chars + rate limit visual.
 *
 * Regras (ADR-026):
 *   - Anonimo: nao pode comentar — clica e abre modal "crie conta gratis"
 *   - Logado: pode comentar (5/h, min 15 chars, max 2000)
 *   - Assinante: + cooldown 30s entre comments
 *
 * Mock-only: simula POST sem chamar API. Backend Sprint 3 implementa.
 */
export function CommentEditor({ featureSlug: _featureSlug }: { featureSlug: string }) {
  // featureSlug usado quando backend chegar (Sprint 3 — POST /features/{slug}/comments)
  const ctx = useUserPermissions();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const allowed = canComment(ctx);
  const blockReason = getCommentBlockReason(ctx);

  const { minChars, maxChars } = LIMITS.comment;
  const len = body.length;
  const tooShort = len > 0 && len < minChars;
  const tooLong = len > maxChars;
  const canSubmit = allowed && len >= minChars && len <= maxChars && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowed) {
      setBlockModalOpen(true);
      return;
    }

    if (!canSubmit) return;

    setSubmitting(true);
    // Mock: simula latência da rede
    setTimeout(() => {
      toast.success("Comentário enviado", {
        description: "Aparecerá na thread em instantes.",
        duration: 2500,
      });
      setBody("");
      setSubmitting(false);
    }, 600);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-[10px] p-4"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
        }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => {
            if (!allowed) setBlockModalOpen(true);
          }}
          placeholder={
            allowed
              ? "O que você acha dessa feature? (mínimo 15 caracteres)"
              : "Entre na sua conta pra comentar..."
          }
          rows={3}
          maxLength={maxChars + 100} // permite digitar pouco a mais pra mostrar erro
          disabled={!allowed || submitting}
          className="w-full resize-none rounded-[8px] p-3 text-[14px] leading-relaxed transition-colors focus:outline-none disabled:cursor-not-allowed"
          style={{
            background: allowed
              ? "var(--surface-input)"
              : "var(--surface-low)",
            border: "1.5px solid transparent",
            color: "var(--text-primary)",
          }}
          onFocusCapture={(e) => {
            if (allowed) {
              e.currentTarget.style.background = "var(--surface-card)";
              e.currentTarget.style.borderColor = "rgba(5, 83, 160, 0.4)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(5, 83, 160, 0.08)";
            }
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.background = allowed
              ? "var(--surface-input)"
              : "var(--surface-low)";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-[12px]">
            {tooShort && (
              <span
                className="inline-flex items-center gap-1"
                style={{ color: "var(--warning)" }}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Mínimo {minChars} chars ({minChars - len} restantes)
              </span>
            )}
            {tooLong && (
              <span
                className="inline-flex items-center gap-1"
                style={{ color: "var(--danger)" }}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Máximo {maxChars} chars (passou {len - maxChars})
              </span>
            )}
            {!tooShort && !tooLong && len > 0 && (
              <span style={{ color: "var(--text-muted)" }}>
                {len}/{maxChars}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit && allowed}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[13px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Enviando..." : "Comentar"}
          </button>
        </div>

        {!allowed && (
          <p
            className="text-[12px] mt-3 pt-3 border-t"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border-secondary)",
            }}
          >
            <strong style={{ color: "var(--text-secondary)" }}>
              Comentários são pra cadastrados.
            </strong>{" "}
            Crie sua conta (é gratuita) e participe da conversa.
          </p>
        )}
      </form>

      <PermissionGateModal
        reason={blockModalOpen ? blockReason : null}
        onClose={() => setBlockModalOpen(false)}
      />
    </>
  );
}
