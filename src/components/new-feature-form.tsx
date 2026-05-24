"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle, Send, Lock, Info } from "lucide-react";
import { toast } from "sonner";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import {
  canSuggestFeature,
  getSuggestionBlockReason,
  LIMITS,
} from "@/lib/permissions";
import { PermissionGateModal } from "@/components/permission-gate";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORY_LIST, type CategorySlug } from "@/lib/constants";
import { MOCK_FEATURES } from "@/lib/mock-data";

/**
 * Formulário de sugerir nova feature.
 *
 * Regras (ADR-026 + ADR-027):
 *   - Anônimo: paywall (modal SignIn/SignUp)
 *   - Logado: 3/dia, título ≥10, descrição ≥30 chars
 *   - Assinante: 10/dia
 *   - Honeypot + time-trap (mock client-side, backend valida)
 *   - Dedupe semântico (mock: substring; backend: pgvector cosine > 0.85)
 *   - Moderação híbrida: sempre entra como pending_review no MVP (STRICT ON)
 *
 * Mock-only: simula POST + dedupe; backend Sprint 3 implementa real.
 */
export function NewFeatureForm() {
  const router = useRouter();
  const ctx = useUserPermissions();
  const allowed = canSuggestFeature(ctx);
  const blockReason = getSuggestionBlockReason(ctx);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategorySlug>("inbox");
  const [honeypot, setHoneypot] = useState(""); // bots preenchem isso
  const [formRenderedAt] = useState(() => Date.now()); // time-trap
  const [submitting, setSubmitting] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  // Se não pode, abre modal já ao montar
  useEffect(() => {
    if (!allowed) setBlockModalOpen(true);
  }, [allowed]);

  const { titleMinChars, titleMaxChars, descMinChars, descMaxChars } =
    LIMITS.suggestion;

  // Dedupe semântico (mock simples — substring de 6+ chars)
  const similar = useMemo(() => {
    if (title.length < 8) return [];
    const titleLower = title.toLowerCase();
    return MOCK_FEATURES.filter((f) => {
      const t = f.title.toLowerCase();
      // pega palavras significativas (>5 chars) e busca match
      const titleWords = titleLower.split(/\s+/).filter((w) => w.length > 5);
      return titleWords.some((w) => t.includes(w));
    }).slice(0, 3);
  }, [title]);

  const titleOk =
    title.length >= titleMinChars && title.length <= titleMaxChars;
  const descOk =
    description.length >= descMinChars && description.length <= descMaxChars;
  const canSubmit = allowed && titleOk && descOk && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowed) {
      setBlockModalOpen(true);
      return;
    }
    if (!canSubmit) return;

    // Honeypot check (mock client-side; backend valida tb)
    if (honeypot !== "") {
      toast.error("Erro ao enviar", { description: "Tente de novo." });
      return;
    }
    // Time-trap (mock: rejeita se <2s)
    if (Date.now() - formRenderedAt < 2000) {
      toast.error("Aguarde um momento antes de enviar.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success("Sugestão enviada", {
        description:
          "Está em moderação. Você recebe um email quando aprovada.",
        duration: 5000,
      });
      setSubmitting(false);
      router.push("/");
    }, 800);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-[10px] p-6"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
          opacity: allowed ? 1 : 0.6,
          pointerEvents: allowed ? "auto" : "none",
        }}
      >
        {/* Honeypot — bot preenche, humano não vê */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}
        >
          <label>
            Não preencha este campo
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>

        {/* Título */}
        <label className="block mb-4">
          <span
            className="block text-[13px] font-semibold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            Título <span style={{ color: "var(--danger)" }}>*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Notificação push pra novos comentários"
            maxLength={titleMaxChars + 50}
            disabled={!allowed}
            className="w-full h-10 rounded-[10px] px-3 text-[14px] transition-colors focus:outline-none disabled:cursor-not-allowed"
            style={{
              background: "var(--surface-input)",
              border: "1.5px solid transparent",
              color: "var(--text-primary)",
            }}
          />
          <ValidationHint
            len={title.length}
            min={titleMinChars}
            max={titleMaxChars}
          />
        </label>

        {/* Sugestões similares (dedupe semântico mock) */}
        {similar.length > 0 && (
          <div
            className="mb-4 rounded-[10px] p-3"
            style={{
              background: "var(--warning-bg)",
              border: "1px solid rgba(202, 138, 4, 0.3)",
            }}
          >
            <p
              className="text-[12px] font-semibold mb-2 flex items-center gap-1.5"
              style={{ color: "var(--warning)" }}
            >
              <Info className="h-3.5 w-3.5" />
              Já existem sugestões parecidas — pode ser melhor votar nelas:
            </p>
            <ul className="flex flex-col gap-1">
              {similar.map((f) => (
                <li key={f.id}>
                  <a
                    href={`/feature/${f.slug}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[13px] hover:underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    → {f.title}{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      ({f.voteCount} votos)
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Categoria */}
        <label className="block mb-4">
          <span
            className="block text-[13px] font-semibold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            Categoria <span style={{ color: "var(--danger)" }}>*</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORY_LIST.map((cat) => {
              const selected = category === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  disabled={!allowed}
                  className="flex items-center gap-2 p-2 rounded-[8px] text-[12px] text-left transition-colors disabled:cursor-not-allowed"
                  style={{
                    background: selected
                      ? "rgba(30, 127, 212, 0.08)"
                      : "var(--surface-card)",
                    border: selected
                      ? "1.5px solid var(--brand-primary)"
                      : "1.5px solid var(--border-secondary)",
                    color: selected
                      ? "var(--brand-primary)"
                      : "var(--text-secondary)",
                  }}
                >
                  <CategoryIcon category={cat.slug} size="sm" />
                  <span className="font-semibold truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </label>

        {/* Descrição */}
        <label className="block mb-4">
          <span
            className="block text-[13px] font-semibold mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            Descrição <span style={{ color: "var(--danger)" }}>*</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Conte com calma: o que é, por que importa pra você, como você imagina que funciona. Mínimo ${descMinChars} caracteres.`}
            rows={6}
            maxLength={descMaxChars + 100}
            disabled={!allowed}
            className="w-full resize-none rounded-[10px] p-3 text-[14px] leading-relaxed transition-colors focus:outline-none disabled:cursor-not-allowed"
            style={{
              background: "var(--surface-input)",
              border: "1.5px solid transparent",
              color: "var(--text-primary)",
            }}
          />
          <ValidationHint
            len={description.length}
            min={descMinChars}
            max={descMaxChars}
          />
        </label>

        {/* Aviso moderação */}
        <div
          className="rounded-[10px] p-3 mb-4 flex items-start gap-2 text-[12px]"
          style={{
            background: "var(--surface-low)",
            color: "var(--text-secondary)",
          }}
        >
          <Sparkles
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            style={{ color: "var(--brand-cta)" }}
          />
          <span>
            <strong style={{ color: "var(--text-primary)" }}>
              Toda sugestão passa por moderação.
            </strong>{" "}
            A equipe ConvertaFlow revisa e aprova em até 48h úteis. Você recebe
            email quando aparecer publicamente.
          </span>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center h-10 px-4 rounded-[10px] text-[13px] font-semibold transition-opacity hover:opacity-80"
            style={{
              background: "var(--surface-low)",
              color: "var(--text-primary)",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit && allowed}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] text-[14px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {submitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar sugestão
              </>
            )}
          </button>
        </div>
      </form>

      {/* Overlay visual se anônimo */}
      {!allowed && (
        <div
          className="mt-4 rounded-[10px] p-5 flex items-center gap-3"
          style={{
            background: "var(--info-bg)",
            border: "1.5px solid var(--brand-primary)",
            color: "var(--text-primary)",
          }}
        >
          <Lock
            className="h-5 w-5 flex-shrink-0"
            style={{ color: "var(--brand-primary)" }}
          />
          <div className="flex-1 text-[13px]">
            <strong>Sugerir feature precisa cadastro.</strong> Crie conta
            gratuita (não cobra) e sua sugestão entra na fila de moderação.
          </div>
          <button
            type="button"
            onClick={() => setBlockModalOpen(true)}
            className="inline-flex items-center h-9 px-4 rounded-[10px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
            }}
          >
            Entrar / Cadastrar
          </button>
        </div>
      )}

      <PermissionGateModal
        reason={blockModalOpen ? blockReason : null}
        onClose={() => setBlockModalOpen(false)}
      />
    </>
  );
}

function ValidationHint({
  len,
  min,
  max,
}: {
  len: number;
  min: number;
  max: number;
}) {
  if (len === 0) {
    return (
      <span
        className="text-[11px] mt-1 block"
        style={{ color: "var(--text-muted)" }}
      >
        Mínimo {min} caracteres
      </span>
    );
  }
  if (len < min) {
    return (
      <span
        className="text-[11px] mt-1 inline-flex items-center gap-1"
        style={{ color: "var(--warning)" }}
      >
        <AlertCircle className="h-3 w-3" />
        Faltam {min - len} caracteres
      </span>
    );
  }
  if (len > max) {
    return (
      <span
        className="text-[11px] mt-1 inline-flex items-center gap-1"
        style={{ color: "var(--danger)" }}
      >
        <AlertCircle className="h-3 w-3" />
        Passou {len - max} caracteres
      </span>
    );
  }
  return (
    <span
      className="text-[11px] mt-1 block"
      style={{ color: "var(--text-muted)" }}
    >
      {len} / {max}
    </span>
  );
}
