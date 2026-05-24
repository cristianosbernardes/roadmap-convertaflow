"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Pin,
  Reply,
  Shield,
} from "lucide-react";
import type { MockComment } from "@/lib/mock-data";
import { CommentEditor } from "@/components/comment-editor";

/**
 * Lista de comentarios da feature com threading shallow (1 nivel).
 * Inspirado [[03 - Featurebase]] + [[01 - ZDG (Upvoty white-label)]].
 *
 * - Comentario oficial: border-left azul + badge "Oficial ConvertaFlow" + sticky (pinned)
 * - Threading 1 nivel: top-level (parentCommentId == null) + replies aninhadas.
 *   Se alguem responde a uma reply, o parentCommentId continua apontando pro
 *   top-level (nao cria thread infinita). Visual: "Em resposta a @nome" no header.
 * - Reactions emoji (👍 ❤️ 🎉)
 *
 * Estado local: qual comment esta "respondendo" agora (so 1 reply-form aberto por vez).
 */

interface ThreadedComment {
  comment: MockComment;
  replies: MockComment[];
}

export function CommentThread({
  comments,
  featureSlug,
}: {
  comments: MockComment[];
  /** Repassado ao CommentEditor (necessario pra futuro POST /features/{slug}/comments). */
  featureSlug?: string;
}) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const threads = useMemo<ThreadedComment[]>(() => {
    const topLevel = comments.filter((c) => c.parentCommentId == null);
    return topLevel.map((parent) => ({
      comment: parent,
      replies: comments
        .filter((c) => c.parentCommentId === parent.id)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    }));
  }, [comments]);

  const toggleCollapse = (commentId: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  if (comments.length === 0) {
    return (
      <div
        className="rounded-[10px] p-8 text-center"
        style={{
          background: "var(--surface-card)",
          border: "1.5px dashed var(--border-primary)",
        }}
      >
        <p
          className="text-[14px]"
          style={{ color: "var(--text-secondary)" }}
        >
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {threads.map(({ comment, replies }) => {
        const isCollapsed = collapsed.has(comment.id);
        const replyCount = replies.length;

        return (
          <li
            key={comment.id}
            className="rounded-[10px]"
            style={{
              background: comment.isOfficial
                ? "var(--info-bg)"
                : "var(--surface-card)",
              border: comment.isOfficial
                ? "1.5px solid var(--brand-primary)"
                : "1.5px solid var(--border-primary)",
              borderLeftWidth: comment.isOfficial ? "4px" : "1.5px",
            }}
          >
            {/* Top-level comment */}
            <div className="p-4">
              <CommentBody
                comment={comment}
                variant="top"
                onReplyClick={() =>
                  setReplyingTo(
                    replyingTo === comment.id ? null : comment.id
                  )
                }
                isReplying={replyingTo === comment.id}
              />

              {/* Toggle "N respostas" — so aparece se tiver replies */}
              {replyCount > 0 && (
                <button
                  type="button"
                  onClick={() => toggleCollapse(comment.id)}
                  className="inline-flex items-center gap-1 mt-3 h-7 px-2 -ml-2 rounded-[7px] text-[12px] font-medium transition-colors hover:bg-[var(--surface-low)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  {replyCount} {replyCount === 1 ? "resposta" : "respostas"}
                </button>
              )}

              {/* Reply editor inline (so 1 aberto por vez via replyingTo) */}
              {replyingTo === comment.id && (
                <div className="mt-3">
                  <CommentEditor
                    featureSlug={featureSlug ?? ""}
                    variant="reply"
                    parentCommentId={comment.id}
                    autoFocus
                    onCancel={() => setReplyingTo(null)}
                    onSubmitted={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </div>

            {/* Replies aninhadas (indentadas via border-left) */}
            {replyCount > 0 && !isCollapsed && (
              <div
                className="ml-4 mb-3 mr-3 pl-4"
                style={{
                  borderLeft: "2px solid var(--border-secondary)",
                }}
              >
                <ul className="flex flex-col gap-2">
                  {replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-[7px] p-3"
                      style={{
                        background: reply.isOfficial
                          ? "var(--info-bg)"
                          : "var(--surface-card)",
                        border: reply.isOfficial
                          ? "1px solid var(--brand-primary)"
                          : "1px solid var(--border-secondary)",
                      }}
                    >
                      <CommentBody
                        comment={reply}
                        variant="reply"
                        onReplyClick={() =>
                          setReplyingTo(
                            replyingTo === reply.id ? null : reply.id
                          )
                        }
                        isReplying={replyingTo === reply.id}
                      />
                    </li>
                  ))}
                </ul>

                {/* Reply editor pra uma das replies — threading shallow:
                    a nova reply vai pro mesmo parent top-level, mas
                    visualmente mostra "Em resposta a @autorDaReply" */}
                {replyingTo != null &&
                  replies.some((r) => r.id === replyingTo) && (
                    <div className="mt-3">
                      <CommentEditor
                        featureSlug={featureSlug ?? ""}
                        variant="reply"
                        parentCommentId={comment.id}
                        autoFocus
                        onCancel={() => setReplyingTo(null)}
                        onSubmitted={() => setReplyingTo(null)}
                      />
                    </div>
                  )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Helpers internos ─────────────────────────────────────────────────

interface CommentBodyProps {
  comment: MockComment;
  variant: "top" | "reply";
  onReplyClick: () => void;
  isReplying: boolean;
}

function CommentBody({
  comment,
  variant,
  onReplyClick,
  isReplying,
}: CommentBodyProps) {
  const isOfficial = comment.isOfficial;
  const isReplyItem = variant === "reply";
  const createdAt = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const avatarSize = isReplyItem ? "h-8 w-8" : "h-10 w-10";
  const avatarFontSize = isReplyItem ? "text-[10px]" : "text-[12px]";
  const bodyFontSize = isReplyItem ? "text-[13px]" : "text-[14px]";

  return (
    <>
      {comment.isPinned && !isReplyItem && (
        <div
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold mb-2"
          style={{ color: "var(--brand-primary)" }}
        >
          <Pin className="h-3 w-3" />
          Fixado pela equipe
        </div>
      )}

      <header className="flex items-center gap-2 mb-2">
        <div
          className={`${avatarSize} rounded-full flex items-center justify-center ${avatarFontSize} font-semibold flex-shrink-0`}
          style={{
            background: isOfficial
              ? "var(--brand-primary)"
              : "var(--surface-low)",
            color: isOfficial ? "#ffffff" : "var(--text-secondary)",
          }}
        >
          {comment.authorInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold text-[13px]"
              style={{ color: "var(--text-primary)" }}
            >
              {comment.authorName}
            </span>
            {isOfficial && <OfficialBadge />}
            {!isOfficial && comment.badge === "subscriber" && (
              <SubscriberBadge />
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              {createdAt}
            </span>
            {isReplyItem && comment.repliedToAuthor && (
              <span
                className="inline-flex items-center gap-1 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                <CornerDownRight className="h-3 w-3" />
                Em resposta a{" "}
                <span
                  className="font-medium"
                  style={{ color: "var(--brand-primary)" }}
                >
                  @{shortenAuthor(comment.repliedToAuthor)}
                </span>
              </span>
            )}
          </div>
        </div>
      </header>

      <p
        className={`${bodyFontSize} leading-relaxed whitespace-pre-wrap`}
        style={{ color: "var(--text-primary)" }}
      >
        {comment.body}
      </p>

      {/* Action bar: Responder + reactions */}
      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <button
          type="button"
          onClick={onReplyClick}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-[7px] text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]"
          style={{
            color: isReplying
              ? "var(--brand-primary)"
              : "var(--text-muted)",
            background: isReplying ? "var(--surface-low)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!isReplying)
              e.currentTarget.style.color = "var(--brand-primary)";
          }}
          onMouseLeave={(e) => {
            if (!isReplying) e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Reply className="h-3.5 w-3.5" />
          Responder
        </button>

        {comment.reactions.map((r) => (
          <span
            key={r.emoji}
            className="inline-flex items-center gap-1 px-2 h-7 rounded-full text-[12px]"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            <span>{r.emoji}</span>
            <span className="tabular-nums">{r.count}</span>
          </span>
        ))}
        {comment.reactions.length > 0 && (
          <button
            type="button"
            className="text-[12px] px-2 h-7 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]"
            style={{
              color: "var(--text-muted)",
              border: "1px dashed var(--border-secondary)",
            }}
          >
            + Reagir
          </button>
        )}
      </div>
    </>
  );
}

/** Reduz "Cristiano (ConvertaFlow)" → "Cristiano" pra usar como @handle visual */
function shortenAuthor(name: string): string {
  const firstWord = name.split(/\s|\(/)[0];
  return firstWord ?? name;
}

function OfficialBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{
        background: "var(--brand-primary)",
        color: "#ffffff",
      }}
    >
      <Shield className="h-2.5 w-2.5" />
      Oficial ConvertaFlow
    </span>
  );
}

function SubscriberBadge() {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
      style={{
        background: "var(--surface-low)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-secondary)",
      }}
    >
      Cliente
    </span>
  );
}
