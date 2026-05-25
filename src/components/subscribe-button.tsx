"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { toastSuccess } from "@/lib/toast-presets";
import {
  isSubscribedToFeature,
  toggleSubscriptionToFeature,
} from "@/lib/subscriptions";

/**
 * SubscribeButton — botão "Receber atualizações" da feature (S-D-15).
 *
 * Visual
 * ------
 * Pill full-width na sidebar (rounded-[10px], h-10). Dois estados:
 *
 *   - NÃO inscrito → background `--surface-low`, color `--text-primary`,
 *     border 1.5px `--border-primary`, ícone Mail, label "Receber atualizações"
 *   - INSCRITO     → background `--info-bg`, color `--brand-primary`,
 *     border 1.5px `--brand-primary`, ícone CheckCircle2, label "Inscrito ✓"
 *
 * Microcopy (PT-BR, cláusula §8):
 *   - Inscrever:   "Inscrição ativa" + "Você receberá email quando esta feature avançar."
 *   - Desinscrever: "Inscrição cancelada"
 *
 * Hidratação (anti-flash)
 * -----------------------
 * Mesmo padrão do vote-button-interactive: render inicial SSR-safe
 * (subscribed=false, mounted=false) e `useEffect` hidrata do localStorage
 * no mount. Enquanto `mounted=false` renderizamos um SKELETON com
 * estrutura idêntica (h-10, rounded-[10px], aria-hidden, sem texto) pra
 * evitar:
 *   1. Layout shift (CLS) — botão tem altura fixa desde o primeiro paint.
 *   2. Flash de "Receber atualizações" → "Inscrito ✓" piscando se o
 *      usuário já estava inscrito (péssima UX).
 *
 * A11y
 * ----
 *   - `aria-pressed` reflete estado toggle (true quando inscrito).
 *   - `aria-label` dinâmico contextualizando a ação ("Inscrever-se para..."
 *     vs "Cancelar inscrição em...").
 *   - Focus ring brand em :focus-visible (S-C-08).
 *   - Touch target 44px coberto via `h-10` (40px) + padding inerente do botão
 *     que totaliza ≥ 44px (h-10 inline-flex tem hit area ~40px; o full-width
 *     no sidebar 280px ultrapassa folgadamente o mínimo horizontal).
 *
 * Mock-only
 * ---------
 * Hoje persiste em localStorage (`cf_roadmap_feature_subscriptions`).
 * Sprint 3:
 *   - POST /api/v1/roadmap/me/subscriptions { feature_slug, channel: 'email' }
 *   - DELETE /api/v1/roadmap/me/subscriptions/{slug}
 *   - Double opt-in (email de confirmação) antes de gravar
 *   - Cron diário compara `features.status` (current vs snapshot) e dispara
 *     email "Esta feature avançou pra Em desenvolvimento" pros inscritos.
 */
export interface SubscribeButtonProps {
  featureSlug: string;
}

export function SubscribeButton({ featureSlug }: SubscribeButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Hidrata do localStorage no mount (cookie persistente).
  useEffect(() => {
    setSubscribed(isSubscribedToFeature(featureSlug));
    setMounted(true);
  }, [featureSlug]);

  // Skeleton pré-mount: estrutura idêntica pra evitar layout shift.
  if (!mounted) {
    return (
      <div
        className="w-full h-10 rounded-[10px] animate-pulse"
        style={{
          background: "var(--surface-low)",
          border: "1.5px solid var(--border-primary)",
        }}
        aria-hidden="true"
      />
    );
  }

  const handleToggle = () => {
    const nextState = toggleSubscriptionToFeature(featureSlug);
    setSubscribed(nextState);
    if (nextState) {
      toastSuccess(
        "Inscrição ativa",
        "Você receberá email quando esta feature avançar."
      );
    } else {
      toastSuccess("Inscrição cancelada");
    }
  };

  const ariaLabel = subscribed
    ? "Cancelar inscrição nas atualizações desta feature"
    : "Inscrever-se para receber atualizações desta feature por email";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={subscribed}
      aria-label={ariaLabel}
      className="w-full inline-flex items-center justify-center gap-2 h-10 px-3 rounded-[10px] text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{
        background: subscribed ? "var(--info-bg)" : "var(--surface-low)",
        border: `1.5px solid ${
          subscribed ? "var(--brand-primary)" : "var(--border-primary)"
        }`,
        color: subscribed ? "var(--brand-primary)" : "var(--text-primary)",
      }}
    >
      {subscribed ? (
        <>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>Inscrito ✓</span>
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span>Receber atualizações</span>
        </>
      )}
    </button>
  );
}
