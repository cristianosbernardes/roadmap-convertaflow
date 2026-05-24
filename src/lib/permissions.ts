/**
 * Modelo de permissoes refinado — ADR-026 + ADR-029 (auth redirect).
 *
 * 4 tiers:
 *   1. Visitante anonimo: vota via cookie (max 20/24h, 5/min)
 *   2. Logado Clerk: + comenta (5/h, min 15 chars) + sugere (3/dia)
 *   3. Assinante ativo: + reportar bug + "minha empresa precisa" + sugere 10/dia
 *   4. Staff: tudo + modera
 *
 * Bloqueios disparam redirect cross-domain pra app.convertaflow.com/login
 * ou /register?from=roadmap (sem modal Clerk inline) — cf. ADR-029 SSO unificado.
 *
 * Detalhes em [[ADRs]] #026 + #029 no Obsidian.
 */

import type { PendingActionType } from "@/lib/auth-redirect";

export type PermissionTier = "anonymous" | "logged" | "subscriber" | "staff";

export interface PermissionContext {
  tier: PermissionTier;
  /** Clerk user_id quando autenticado */
  userId?: string;
  /** Empresa/org id quando assinante */
  orgId?: string;
  /** Slug do plano (starter/business/enterprise) */
  planSlug?: string;
}

export interface LimitInfo {
  canDo: boolean;
  reason?: string;
  retryAfterSeconds?: number;
  remaining?: number;
  total?: number;
}

// ─── LIMITES (ADR-026) ─────────────────────────────────────────────────

export const LIMITS = {
  vote: {
    anonymous: { per24h: 20, perMinBurst: 5 },
    logged: { per24h: 200 },
    perIp: { per24h: 100 },
  },
  comment: {
    minChars: 15,
    maxChars: 2000,
    logged: { perHour: 5 },
    subscriber: { cooldownSeconds: 30 },
  },
  suggestion: {
    titleMinChars: 10,
    titleMaxChars: 200,
    descMinChars: 30,
    descMaxChars: 5000,
    logged: { perDay: 3 },
    subscriber: { perDay: 10 },
  },
  bugReport: {
    subscriber: { perDay: 5 },
  },
} as const;

// ─── CAPABILITIES ──────────────────────────────────────────────────────

export function canVote(_ctx: PermissionContext): boolean {
  // Todos podem votar (anonimo via cookie, autenticado via JWT)
  return true;
}

export function canComment(ctx: PermissionContext): boolean {
  return ctx.tier !== "anonymous";
}

export function canSuggestFeature(ctx: PermissionContext): boolean {
  return ctx.tier !== "anonymous";
}

export function canMarkPriority(ctx: PermissionContext): boolean {
  return ctx.tier === "subscriber" || ctx.tier === "staff";
}

export function canReportBug(ctx: PermissionContext): boolean {
  return ctx.tier === "subscriber" || ctx.tier === "staff";
}

export function canModerate(ctx: PermissionContext): boolean {
  return ctx.tier === "staff";
}

// ─── MENSAGENS DE BLOQUEIO (estilo Productlane — honestidade) ──────────

export interface BlockReason {
  /** Heading curto */
  title: string;
  /** Texto explicativo */
  body: string;
  /** Tipo da acao bloqueada — restaura contexto pos-auth (cf. useDraftRestore + ADR-029) */
  actionType?: PendingActionType;
  /**
   * Benefícios concretos (2-3 bullets) renderizados no modal — microcopy
   * benefit-driven estilo Productlane/Linear. Reduzem fricção mostrando
   * valor antes do CTA. cf. Auditoria UX-UI v2 A.4 + Sprint C/S-C-09.
   */
  benefits?: string[];
  /**
   * Microcopy de reassurance no rodapé (ex: "Sem cartão de crédito").
   * Aparece em text-[12px] muted, centralizado.
   */
  footer?: string;
  /** Acao primaria */
  cta: {
    label: string;
    /** "signin"/"signup" disparam redirect cross-domain; "upgrade" leva pra app */
    action: "signin" | "signup" | "upgrade" | "dismiss";
    href?: string;
  };
  /** Acao secundaria opcional */
  ctaSecondary?: {
    label: string;
    action: "signin" | "signup" | "upgrade" | "dismiss";
    href?: string;
  };
}

export function getCommentBlockReason(
  ctx: PermissionContext
): BlockReason | null {
  if (canComment(ctx)) return null;
  return {
    title: "Junte-se à conversa",
    body: "Quem comenta ajuda a moldar como cada feature vai funcionar. Sua perspectiva conta.",
    actionType: "comment",
    benefits: [
      "Responda outras pessoas e construa o debate",
      "Receba notificação quando o time ConvertaFlow responder",
      "Histórico das suas conversas em um só lugar",
    ],
    footer: "Sem cartão de crédito · Cancele quando quiser",
    cta: { label: "Criar conta grátis", action: "signup" },
    ctaSecondary: { label: "Já tenho conta", action: "signin" },
  };
}

export function getSuggestionBlockReason(
  ctx: PermissionContext
): BlockReason | null {
  if (canSuggestFeature(ctx)) return null;
  return {
    title: "Sua ideia pode ser a próxima feature",
    body: "Nossas melhores features começaram como sugestão de cliente. A sua entra em moderação e aparece no roadmap quando aprovada.",
    actionType: "suggestion",
    benefits: [
      "Aprovação em até 48h úteis",
      "Receba email quando virar feature pública",
      "Veja outras pessoas votando na sua ideia",
    ],
    footer: "Sem cartão de crédito · Cancele quando quiser",
    cta: { label: "Criar conta grátis", action: "signup" },
    ctaSecondary: { label: "Já tenho conta", action: "signin" },
  };
}

export function getPriorityBlockReason(
  ctx: PermissionContext
): BlockReason | null {
  if (canMarkPriority(ctx)) return null;
  if (ctx.tier === "anonymous") {
    return {
      title: "Marque o que sua empresa precisa",
      body: "Empresas pagantes pesam 3x na priorização. Conta nova ganha 14 dias grátis pra explorar tudo.",
      actionType: "vote-priority",
      benefits: [
        "Seu voto pesa 3x mais (assinante vs anônimo)",
        "Acesso ao Beta de features em desenvolvimento",
        "Histórico do que sua empresa já pediu",
      ],
      footer: "Conta nova ganha 14 dias grátis",
      cta: {
        label: "Conhecer planos",
        action: "upgrade",
        href: "https://convertaflow.com#pricing",
      },
      ctaSecondary: { label: "Já tenho conta", action: "signin" },
    };
  }
  return {
    title: "Marque o que sua empresa precisa",
    body: "Ative seu plano e sinalize quais features são críticas. Empresas pagantes pesam 3x na priorização.",
    actionType: "vote-priority",
    benefits: [
      "Seu voto pesa 3x mais que um voto anônimo",
      "Acesso ao Beta de features em desenvolvimento",
      "Histórico do que sua empresa já pediu",
    ],
    footer: "Mude ou cancele o plano quando quiser",
    cta: {
      label: "Ver planos",
      action: "upgrade",
      href: "https://app.convertaflow.com/billing",
    },
  };
}

export function getBugReportBlockReason(
  ctx: PermissionContext
): BlockReason | null {
  if (canReportBug(ctx)) return null;
  if (ctx.tier === "anonymous") {
    return {
      title: "Bug reports têm fluxo dedicado",
      body: "Bugs em produção vão direto pro time de suporte com prioridade. Disponível pra clientes ativos.",
      actionType: "bug-report",
      benefits: [
        "Resposta com SLA garantido (8h úteis)",
        "Status visível em tempo real",
        "Reabertura automática se o bug voltar",
      ],
      footer: "Conta nova ganha 14 dias grátis",
      cta: {
        label: "Conhecer planos",
        action: "upgrade",
        href: "https://convertaflow.com#pricing",
      },
      ctaSecondary: { label: "Já tenho conta", action: "signin" },
    };
  }
  return {
    title: "Bug reports têm fluxo dedicado",
    body: "Bugs em produção vão direto pro time de suporte com prioridade. Ative seu plano pra abrir tickets.",
    actionType: "bug-report",
    benefits: [
      "Resposta com SLA garantido (8h úteis)",
      "Status visível em tempo real",
      "Reabertura automática se o bug voltar",
    ],
    footer: "Mude ou cancele o plano quando quiser",
    cta: {
      label: "Ver planos",
      action: "upgrade",
      href: "https://app.convertaflow.com/billing",
    },
  };
}
