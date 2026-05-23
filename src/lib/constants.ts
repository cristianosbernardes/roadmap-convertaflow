/**
 * Constantes canônicas do Roadmap ConvertaFlow.
 *
 * IMPORTANTE: estes slugs e cores são FONTE DE VERDADE.
 * O backend Python deve usar os MESMOS slugs ao seedar e retornar dados.
 * Mudança aqui exige mudança simultânea no backend.
 */

import type { LucideIcon } from "lucide-react";
import {
  Inbox,
  Rocket,
  Workflow,
  Sparkles,
  Mail,
  GitBranch,
  Plug,
  Calendar,
  CreditCard,
  BarChart3,
  Puzzle,
  Shield,
  Settings,
  Globe,
} from "lucide-react";

// ─── STATUSES ─────────────────────────────────────────────────────────

export type StatusSlug =
  | "sob_analise"
  | "planejado"
  | "em_desenvolvimento"
  | "beta_privado"
  | "concluido"
  | "pausado"
  | "nao_sera_feito";

export interface StatusConfig {
  slug: StatusSlug;
  label: string;
  emoji: string;
  // Classes Tailwind (mesma paleta do app principal)
  bgClass: string;
  textClass: string;
  borderClass: string;
  sortOrder: number;
}

export const STATUSES: Record<StatusSlug, StatusConfig> = {
  sob_analise: {
    slug: "sob_analise",
    label: "Sob análise",
    emoji: "🔍",
    bgClass: "bg-gray-100 dark:bg-gray-800",
    textClass: "text-gray-700 dark:text-gray-300",
    borderClass: "border-gray-200 dark:border-gray-700",
    sortOrder: 1,
  },
  planejado: {
    slug: "planejado",
    label: "Planejado",
    emoji: "📋",
    bgClass: "bg-sky-100 dark:bg-sky-950",
    textClass: "text-sky-700 dark:text-sky-300",
    borderClass: "border-sky-200 dark:border-sky-800",
    sortOrder: 2,
  },
  em_desenvolvimento: {
    slug: "em_desenvolvimento",
    label: "Em desenvolvimento",
    emoji: "🚧",
    bgClass: "bg-orange-100 dark:bg-orange-950",
    textClass: "text-orange-700 dark:text-orange-300",
    borderClass: "border-orange-200 dark:border-orange-800",
    sortOrder: 3,
  },
  beta_privado: {
    slug: "beta_privado",
    label: "Beta privado",
    emoji: "🧪",
    bgClass: "bg-purple-100 dark:bg-purple-950",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-200 dark:border-purple-800",
    sortOrder: 4,
  },
  concluido: {
    slug: "concluido",
    label: "Concluído",
    emoji: "✅",
    bgClass: "bg-green-100 dark:bg-green-950",
    textClass: "text-green-700 dark:text-green-300",
    borderClass: "border-green-200 dark:border-green-800",
    sortOrder: 5,
  },
  pausado: {
    slug: "pausado",
    label: "Pausado",
    emoji: "⏸️",
    bgClass: "bg-yellow-100 dark:bg-yellow-950",
    textClass: "text-yellow-700 dark:text-yellow-300",
    borderClass: "border-yellow-200 dark:border-yellow-800",
    sortOrder: 6,
  },
  nao_sera_feito: {
    slug: "nao_sera_feito",
    label: "Não será feito",
    emoji: "❌",
    bgClass: "bg-red-100 dark:bg-red-950",
    textClass: "text-red-700 dark:text-red-300",
    borderClass: "border-red-200 dark:border-red-800",
    sortOrder: 7,
  },
};

export const STATUS_LIST = Object.values(STATUSES).sort(
  (a, b) => a.sortOrder - b.sortOrder
);

// ─── CATEGORIAS ───────────────────────────────────────────────────────

export type CategorySlug =
  | "inbox"
  | "campaigns"
  | "automation"
  | "ai"
  | "email_marketing"
  | "crm"
  | "connections"
  | "calendar"
  | "billing"
  | "reports"
  | "integrations"
  | "security"
  | "settings"
  | "platform";

export interface CategoryConfig {
  slug: CategorySlug;
  label: string;
  description: string;
  icon: LucideIcon;
  /**
   * Cor hex usada em badges, ícones e accent bars.
   * IA usa gradient especial — `iconGradient` ao invés de cor sólida.
   */
  color: string;
  iconGradient?: string;
  sortOrder: number;
}

export const CATEGORIES: Record<CategorySlug, CategoryConfig> = {
  inbox: {
    slug: "inbox",
    label: "Atendimento Omnichannel",
    description:
      "Chat unificado de WhatsApp, Instagram e Facebook em uma tela.",
    icon: Inbox,
    color: "#0369a1",
    sortOrder: 1,
  },
  campaigns: {
    slug: "campaigns",
    label: "Campanhas e Disparos",
    description: "Envios em massa com anti-spam e segmentação.",
    icon: Rocket,
    color: "#7c3aed",
    sortOrder: 2,
  },
  automation: {
    slug: "automation",
    label: "Automação e Flows",
    description: "FlowBuilder visual para criar automações sem código.",
    icon: Workflow,
    color: "#ea580c",
    sortOrder: 3,
  },
  ai: {
    slug: "ai",
    label: "IA e Agentes",
    description: "Agente IA com memória persistente e procedimentos.",
    icon: Sparkles,
    color: "#1e7fd4",
    iconGradient: "linear-gradient(135deg, #1e7fd4 0%, #1a3a6e 100%)",
    sortOrder: 4,
  },
  email_marketing: {
    slug: "email_marketing",
    label: "Email Marketing",
    description: "Campanhas, sequências e templates via AWS SES.",
    icon: Mail,
    color: "#0d9488",
    sortOrder: 5,
  },
  crm: {
    slug: "crm",
    label: "CRM e Pipeline",
    description: "Pipeline visual de vendas + Kanban + Tags.",
    icon: GitBranch,
    color: "#9333ea",
    sortOrder: 6,
  },
  connections: {
    slug: "connections",
    label: "Conexões WhatsApp",
    description: "Baileys, Evolution API e Meta Cloud (WhatsApp oficial).",
    icon: Plug,
    color: "#16a34a",
    sortOrder: 7,
  },
  calendar: {
    slug: "calendar",
    label: "Agenda e Reuniões",
    description: "Agendamentos, lembretes e reuniões online via Jitsi/LiveKit.",
    icon: Calendar,
    color: "#0891b2",
    sortOrder: 8,
  },
  billing: {
    slug: "billing",
    label: "Financeiro e Planos",
    description: "Asaas (BR) + Stripe (intl), cupons, afiliados.",
    icon: CreditCard,
    color: "#ca8a04",
    sortOrder: 9,
  },
  reports: {
    slug: "reports",
    label: "Relatórios e Analytics",
    description: "Dashboards, métricas de atendimento e funil de vendas.",
    icon: BarChart3,
    color: "#dc2626",
    sortOrder: 10,
  },
  integrations: {
    slug: "integrations",
    label: "Integrações",
    description: "Webhooks, e-commerce, pagamentos e plataformas externas.",
    icon: Puzzle,
    color: "#525252",
    sortOrder: 11,
  },
  security: {
    slug: "security",
    label: "Segurança e LGPD",
    description: "Multi-tenant, auditoria, consentimentos e privacidade.",
    icon: Shield,
    color: "#1e40af",
    sortOrder: 12,
  },
  settings: {
    slug: "settings",
    label: "Configurações e Admin",
    description: "Configurações da empresa, usuários, cargos e permissões.",
    icon: Settings,
    color: "#64748b",
    sortOrder: 13,
  },
  platform: {
    slug: "platform",
    label: "Plataforma e Mobile",
    description: "App mobile, performance, internacionalização.",
    icon: Globe,
    color: "#0f172a",
    sortOrder: 14,
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES).sort(
  (a, b) => a.sortOrder - b.sortOrder
);
