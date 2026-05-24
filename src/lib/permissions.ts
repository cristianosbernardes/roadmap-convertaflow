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
    title: "Comentários são só pra cadastrados",
    body: "Faça login ou crie sua conta gratuitamente para participar da conversa.",
    actionType: "comment",
    cta: { label: "Entrar", action: "signin" },
    ctaSecondary: { label: "Criar conta", action: "signup" },
  };
}

export function getSuggestionBlockReason(
  ctx: PermissionContext
): BlockReason | null {
  if (canSuggestFeature(ctx)) return null;
  return {
    title: "Sugerir feature precisa cadastro",
    body: "Faça login ou crie sua conta gratuitamente. Sua sugestão entra em moderação e aparece no roadmap quando aprovada.",
    actionType: "suggestion",
    cta: { label: "Entrar", action: "signin" },
    ctaSecondary: { label: "Criar conta", action: "signup" },
  };
}

export function getPriorityBlockReason(
  ctx: PermissionContext
): BlockReason | null {
  if (canMarkPriority(ctx)) return null;
  if (ctx.tier === "anonymous") {
    return {
      title: "Marcar prioridade é só pra clientes ativos",
      body: "Crie conta e ative seu plano para sinalizar que esta feature é crítica pra sua empresa. Esse sinal pesa muito na nossa priorização.",
      actionType: "vote-priority",
      cta: {
        label: "Conhecer planos",
        action: "upgrade",
        href: "https://convertaflow.com#pricing",
      },
      ctaSecondary: { label: "Entrar", action: "signin" },
    };
  }
  return {
    title: "Marcar prioridade é só pra clientes ativos",
    body: "Ative seu plano para sinalizar que esta feature é crítica pra sua empresa. Conta de empresas pagantes pesa muito na nossa priorização.",
    actionType: "vote-priority",
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
      title: "Bug reports são pra clientes ativos",
      body: "Bug reports tem fluxo dedicado de suporte. Crie conta e ative seu plano para abrir tickets.",
      actionType: "bug-report",
      cta: {
        label: "Conhecer planos",
        action: "upgrade",
        href: "https://convertaflow.com#pricing",
      },
      ctaSecondary: { label: "Entrar", action: "signin" },
    };
  }
  return {
    title: "Bug reports são pra clientes ativos",
    body: "Bugs em produção tem fluxo dedicado pra clientes pagantes. Ative seu plano pra abrir tickets.",
    actionType: "bug-report",
    cta: {
      label: "Ver planos",
      action: "upgrade",
      href: "https://app.convertaflow.com/billing",
    },
  };
}
