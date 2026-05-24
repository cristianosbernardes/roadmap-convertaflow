import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renderiza markdown com GFM (tables, strikethrough, task lists, autolinks).
 *
 * Usado em:
 *   - /changelog (bodyMarkdown de cada release)
 *   - /feature/[slug] (description rica)
 *   - Comentarios (markdown leve — bold/italic/links/listas)
 *
 * Tipografia herdada via CSS classes (text-primary, text-secondary, etc).
 * Componentes customizados pra manter identidade ConvertaFlow:
 *   - h2/h3 em weight 700 + tracking -0.01em
 *   - links em brand-primary com underline-offset
 *   - code em surface-low com border
 *   - listas com bullet do brand-primary
 */
export function MarkdownRenderer({
  content,
  variant = "default",
}: {
  content: string;
  /**
   * "default" — para changelog (escala maior, padding-y entre elementos)
   * "compact" — para comentarios (escala menor, sem h1/h2)
   * "feature" — para descrição de feature (intermediário)
   */
  variant?: "default" | "compact" | "feature";
}) {
  const isCompact = variant === "compact";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1
            className={
              isCompact
                ? "text-[15px] font-bold mt-3 mb-1"
                : "text-[22px] font-extrabold mt-6 mb-2"
            }
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className={
              isCompact
                ? "text-[14px] font-bold mt-3 mb-1"
                : "text-[18px] font-bold mt-5 mb-2"
            }
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            className={
              isCompact
                ? "text-[13px] font-semibold mt-2 mb-1"
                : "text-[15px] font-bold mt-4 mb-1.5"
            }
            style={{ color: "var(--text-primary)" }}
          >
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p
            className={
              isCompact
                ? "text-[14px] leading-relaxed mb-2"
                : "text-[14px] leading-relaxed mb-3"
            }
            style={{ color: "var(--text-primary)" }}
          >
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul
            className="text-[14px] leading-relaxed mb-3 ml-5 space-y-1"
            style={{
              color: "var(--text-primary)",
              listStyleType: "disc",
            }}
          >
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol
            className="text-[14px] leading-relaxed mb-3 ml-5 space-y-1"
            style={{
              color: "var(--text-primary)",
              listStyleType: "decimal",
            }}
          >
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener" : undefined}
            className="underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ color: "var(--brand-primary)" }}
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children, ...props }) => {
          // inline code vs code block
          const isInline = !("inline" in props) || props.inline !== false;
          if (isInline) {
            return (
              <code
                className="text-[13px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--surface-low)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-secondary)",
                }}
              >
                {children}
              </code>
            );
          }
          return <code className="text-[13px] font-mono">{children}</code>;
        },
        pre: ({ children }) => (
          <pre
            className="text-[13px] font-mono p-3 rounded-[8px] overflow-x-auto mb-3"
            style={{
              background: "var(--surface-low)",
              border: "1px solid var(--border-secondary)",
              color: "var(--text-primary)",
            }}
          >
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="border-l-4 pl-3 my-3 italic"
            style={{
              borderColor: "var(--brand-primary)",
              color: "var(--text-secondary)",
            }}
          >
            {children}
          </blockquote>
        ),
        hr: () => (
          <hr
            className="my-4"
            style={{ borderColor: "var(--border-secondary)" }}
          />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table
              className="text-[13px] w-full"
              style={{ borderCollapse: "collapse" }}
            >
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className="text-left font-semibold p-2"
            style={{
              background: "var(--surface-low)",
              borderBottom: "1.5px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className="p-2"
            style={{
              borderBottom: "1px solid var(--border-secondary)",
              color: "var(--text-primary)",
            }}
          >
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
