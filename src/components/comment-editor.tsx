"use client";

import { useEffect, useRef, useState } from "react";
import { Send, AlertCircle, Loader2 } from "lucide-react";
import { toastSuccess } from "@/lib/toast-presets";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { canComment, getCommentBlockReason, LIMITS } from "@/lib/permissions";
import { PermissionGateModal } from "@/components/permission-gate";

export type CommentEditorVariant = "default" | "reply";

interface CommentEditorProps {
  featureSlug: string;
  /** "default" — caixa principal de comentario. "reply" — compacta, inline. */
  variant?: CommentEditorVariant;
  /** ID do comment pai quando variant="reply" (mock log diferenciado). */
  parentCommentId?: number;
  /** Botao "Cancelar" exibido em variant="reply". */
  onCancel?: () => void;
  /** Foco automatico no textarea ao montar (util pra variant reply abrindo). */
  autoFocus?: boolean;
  /** Callback chamado apos submit bem-sucedido (mock). */
  onSubmitted?: () => void;
}

/**
 * Editor de comentario com permission gate + min chars + rate limit visual.
 *
 * Regras (ADR-026):
 *   - Anonimo: nao pode comentar — clica e abre modal "crie conta gratis"
 *   - Logado: pode comentar (5/h, min 15 chars, max 2000)
 *   - Assinante: + cooldown 30s entre comments
 *
 * Variants:
 *   - "default": caixa principal da feature, 3 linhas, header generico
 *   - "reply": versao compacta inline (2 linhas, placeholder "Escreva sua resposta...",
 *              botao Cancelar do lado de Comentar). Usado dentro do CommentThread.
 *
 * Mock-only: simula POST sem chamar API. Backend Sprint 3 implementa.
 */
export function CommentEditor({
  featureSlug: _featureSlug,
  variant = "default",
  parentCommentId,
  onCancel,
  autoFocus = false,
  onSubmitted,
}: CommentEditorProps) {
  // featureSlug usado quando backend chegar (Sprint 3 — POST /features/{slug}/comments)
  const ctx = useUserPermissions();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReply = variant === "reply";

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const allowed = canComment(ctx);
  const blockReason = getCommentBlockReason(ctx);

  const { minChars, maxChars } = LIMITS.comment;
  const len = body.length;
  const tooShort = len > 0 && len < minChars;
  const tooLong = len > maxChars;
  const canSubmit = allowed && len >= minChars && len <= maxChars && !submitting;

  const placeholderText = isReply
    ? allowed
      ? "Escreva sua resposta..."
      : "Entre na sua conta pra responder..."
    : allowed
      ? "O que você acha dessa feature? (mínimo 15 caracteres)"
      : "Entre na sua conta pra comentar...";

  const submitLabel = isReply ? "Responder" : "Comentar";
  const submittingLabel = isReply ? "Enviando resposta..." : "Enviando...";
  const successDescription = isReply
    ? "Sua resposta aparecerá na thread em instantes."
    : "Aparecerá na thread em instantes.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowed) {
      setBlockModalOpen(true);
      return;
    }

    if (!canSubmit) return;

    setSubmitting(true);
    // Mock: simula latência da rede. Sprint 3 substitui por POST /comments.
    if (parentCommentId != null) {
      // Log diferenciado pra debug em mock-only
      console.info(
        `[mock] reply parent_comment_id=${parentCommentId} body=${body.slice(0, 40)}...`
      );
    }

    setTimeout(() => {
      toastSuccess(
        isReply ? "Resposta enviada" : "Comentário enviado",
        successDescription
      );
      setBody("");
      setSubmitting(false);
      onSubmitted?.();
    }, 600);
  };

  // Padding e radius diferentes por variant — concentric corners pra reply (aninhado)
  const containerClass = isReply
    ? "rounded-[7px] p-3"
    : "rounded-[10px] p-4";
  const containerBorder = isReply
    ? "1px solid var(--border-secondary)"
    : "1.5px solid var(--border-primary)";
  const containerBg = isReply
    ? "var(--surface-low)"
    : "var(--surface-card)";

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={containerClass}
        style={{
          background: containerBg,
          border: containerBorder,
        }}
      >
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => {
            if (!allowed) setBlockModalOpen(true);
          }}
          placeholder={placeholderText}
          rows={isReply ? 2 : 3}
          maxLength={maxChars + 100}
          disabled={!allowed || submitting}
          className={`w-full resize-none rounded-[${isReply ? 6 : 8}px] p-3 ${isReply ? "text-[13px]" : "text-[14px]"} leading-relaxed transition-colors focus:outline-none disabled:cursor-not-allowed`}
          style={{
            background: allowed
              ? "var(--surface-card)"
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
              ? "var(--surface-card)"
              : "var(--surface-low)";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <div className={`flex items-center justify-between ${isReply ? "mt-2" : "mt-3"} gap-3 flex-wrap`}>
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

          <div className="flex items-center gap-2">
            {isReply && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="inline-flex items-center h-8 px-3 rounded-[10px] text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-secondary)",
                }}
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={!canSubmit && allowed}
              className={`inline-flex items-center gap-1.5 ${isReply ? "h-8 px-3 text-[12px]" : "h-9 px-4 text-[13px]"} rounded-[10px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {submitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </div>

        {!allowed && !isReply && (
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
