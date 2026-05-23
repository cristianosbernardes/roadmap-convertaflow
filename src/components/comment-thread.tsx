import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pin, Shield } from "lucide-react";
import type { MockComment } from "@/lib/mock-data";

/**
 * Lista de comentarios da feature.
 * Inspirado [[03 - Featurebase]] + [[01 - ZDG (Upvoty white-label)]].
 *
 * - Comentario oficial: border-left azul + badge "Oficial ConvertaFlow" + sticky (pinned)
 * - Threading 1 nivel (replies — fase 0.4)
 * - Reactions emoji (👍 ❤️ 🎉)
 */
export function CommentThread({ comments }: { comments: MockComment[] }) {
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
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} />
      ))}
    </ul>
  );
}

function CommentItem({ comment }: { comment: MockComment }) {
  const isOfficial = comment.isOfficial;
  const createdAt = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <li
      className="rounded-[10px] p-4"
      style={{
        background: isOfficial ? "var(--info-bg)" : "var(--surface-card)",
        border: isOfficial
          ? "1.5px solid var(--brand-primary)"
          : "1.5px solid var(--border-primary)",
        borderLeftWidth: isOfficial ? "4px" : "1.5px",
      }}
    >
      {comment.isPinned && (
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
          className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
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
          <span
            className="text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {createdAt}
          </span>
        </div>
      </header>

      <p
        className="text-[14px] leading-relaxed whitespace-pre-wrap"
        style={{ color: "var(--text-primary)" }}
      >
        {comment.body}
      </p>

      {comment.reactions.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {comment.reactions.map((r) => (
            <span
              key={r.emoji}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px]"
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
          <button
            type="button"
            className="text-[12px] px-2 py-0.5 rounded-full transition-colors"
            style={{
              color: "var(--text-muted)",
              border: "1px dashed var(--border-secondary)",
            }}
          >
            + Reagir
          </button>
        </div>
      )}
    </li>
  );
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
