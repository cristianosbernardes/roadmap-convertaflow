/**
 * Mock data temporario pra prototipar UI antes do backend.
 *
 * Quando backend estiver pronto, este arquivo sera removido e os componentes
 * passarao a consumir api.ts diretamente.
 *
 * Conforme ADR-016 — mock-first decision.
 */

import type { Feature } from "@/types/roadmap";

/**
 * Campos opcionais ao escrever a feature mock — sao preenchidos com defaults
 * via enrichMockFeature() pra reduzir verbosidade. Quando backend chegar,
 * esse helper soluvel desaparece junto do mock-data.
 */
type FeatureMockInput = Omit<
  Feature,
  "descriptionShort" | "prioritySignalCount" | "tags" | "isFeatured" | "isSensitive"
> &
  Partial<
    Pick<
      Feature,
      "descriptionShort" | "prioritySignalCount" | "tags" | "isFeatured" | "isSensitive"
    >
  >;

function enrichMockFeature(input: FeatureMockInput): Feature {
  // descriptionShort auto-gerado da 1a frase (replica logica do backend)
  const firstSentence =
    input.description.split(/[.!?](\s|$)/)[0]?.slice(0, 200) ?? input.description.slice(0, 200);

  return {
    descriptionShort: input.descriptionShort ?? firstSentence,
    prioritySignalCount: input.prioritySignalCount ?? 0,
    tags: input.tags ?? [],
    isFeatured: input.isFeatured ?? false,
    isSensitive: input.isSensitive ?? false,
    ...input,
  };
}

const FEATURES_RAW: FeatureMockInput[] = [
  // ─── EM DESENVOLVIMENTO ────────────────────────────────────────────────
  {
    id: 1,
    slug: "agente-ia-com-memoria-persistente",
    title: "Agente IA com memória persistente entre conversas",
    description:
      "O agente IA do ConvertaFlow vai lembrar de tudo que conversou com cada cliente — preferências, histórico de compras, contexto. Funciona em todas as conexões WhatsApp ao mesmo tempo. Construído sobre nossa engine de memória vetorial.",
    category: "ai",
    status: "em_desenvolvimento",
    voteCount: 287,
    commentCount: 34,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-05-20T14:30:00Z",
    createdByStaffSlug: "cristiano",
  },
  {
    id: 2,
    slug: "campanhas-segmentadas-por-tag-de-comportamento",
    title: "Campanhas segmentadas por tag de comportamento do contato",
    description:
      "Disparar campanhas só para contatos que demonstraram interesse específico (clicaram em link X, responderam pesquisa Y, abriram sequência Z). Segmentação dinâmica baseada em ações reais, não só dados cadastrais.",
    category: "campaigns",
    status: "em_desenvolvimento",
    voteCount: 213,
    commentCount: 28,
    hasVoted: true,
    hasPrioritySignal: false,
    createdAt: "2026-04-02T15:20:00Z",
    updatedAt: "2026-05-19T09:00:00Z",
  },
  {
    id: 3,
    slug: "flow-builder-condicionais-avancadas",
    title: "Condicionais avançadas no FlowBuilder (if-else aninhados)",
    description:
      "Hoje o FlowBuilder permite condicionais simples. Estamos adicionando suporte a if-else aninhados, switch-case e expressões complexas com operadores AND/OR. Permite construir fluxos muito mais inteligentes sem código.",
    category: "automation",
    status: "em_desenvolvimento",
    voteCount: 167,
    commentCount: 19,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-03-28T11:00:00Z",
    updatedAt: "2026-05-18T16:45:00Z",
  },

  // ─── BETA PRIVADO ──────────────────────────────────────────────────────
  {
    id: 4,
    slug: "transcricao-de-audios-tempo-real",
    title: "Transcrição de áudios em tempo real (Whisper local)",
    description:
      "Áudios recebidos em conversas são transcritos automaticamente em PT-BR, sem custo de API externa. Aparece como texto abaixo do áudio. Funciona offline com modelo Whisper rodando no seu próprio servidor.",
    category: "inbox",
    status: "beta_privado",
    voteCount: 142,
    commentCount: 22,
    hasVoted: true,
    hasPrioritySignal: false,
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-05-15T11:20:00Z",
  },

  // ─── PLANEJADO ─────────────────────────────────────────────────────────
  {
    id: 5,
    slug: "pipeline-kanban-arrastar-e-soltar",
    title: "Pipeline Kanban com arrastar e soltar para mover oportunidades",
    description:
      "Visualizar todo o funil de vendas em quadro Kanban, arrastar leads entre etapas, ver métricas de tempo médio em cada etapa. Integrado com tags do CRM atual.",
    category: "crm",
    status: "planejado",
    voteCount: 198,
    commentCount: 31,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-04-18T14:00:00Z",
    updatedAt: "2026-05-10T10:00:00Z",
  },
  {
    id: 6,
    slug: "app-mobile-android-ios",
    title: "App mobile nativo para Android e iOS",
    description:
      "App nativo pra atender conversas no celular. Notificações push, modo offline pra rascunhos, suporte completo aos canais (WhatsApp, Instagram, Facebook). Lançamento simultâneo nas duas lojas.",
    category: "platform",
    status: "planejado",
    voteCount: 312,
    commentCount: 47,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-01-20T12:00:00Z",
    updatedAt: "2026-05-05T09:30:00Z",
  },
  {
    id: 7,
    slug: "relatorio-sla-de-atendimento",
    title: "Relatório de SLA de atendimento por equipe e canal",
    description:
      "Dashboard mostrando tempo médio de primeira resposta, tempo de resolução, % dentro do SLA configurado, por equipe e por canal. Exportável CSV/PDF. Alertas quando SLA está prestes a estourar.",
    category: "reports",
    status: "planejado",
    voteCount: 156,
    commentCount: 18,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-04-25T16:00:00Z",
    updatedAt: "2026-05-12T14:00:00Z",
  },
  {
    id: 8,
    slug: "integracao-com-hubspot",
    title: "Integração nativa com HubSpot (sincronização bidirecional de contatos)",
    description:
      "Conectar sua conta HubSpot ao ConvertaFlow. Contatos sincronizam automaticamente nos dois sentidos. Conversas ConvertaFlow aparecem como timeline no HubSpot CRM.",
    category: "integrations",
    status: "planejado",
    voteCount: 89,
    commentCount: 12,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-05-01T11:00:00Z",
    updatedAt: "2026-05-08T15:30:00Z",
  },

  // ─── SOB ANÁLISE ───────────────────────────────────────────────────────
  {
    id: 9,
    slug: "videochamada-direto-do-chat",
    title: "Videochamada direto do chat (Jitsi/LiveKit)",
    description:
      "Atendente clica em botão no chat e inicia videochamada com cliente — funciona via link gerado dinamicamente, sem cliente instalar nada. Gravação opcional. Útil pra demos, onboarding, suporte técnico.",
    category: "calendar",
    status: "sob_analise",
    voteCount: 73,
    commentCount: 14,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-05-10T09:00:00Z",
    updatedAt: "2026-05-10T09:00:00Z",
  },
  {
    id: 10,
    slug: "modelo-de-email-com-ia",
    title: "Geração de email marketing com IA a partir de briefing curto",
    description:
      "Escreva um briefing de 2 linhas (\"convidar leads frios pra webinar sobre X\") e a IA gera assunto + corpo HTML + variações A/B. Edita antes de enviar. Estilo personalizado com base nos emails anteriores da sua marca.",
    category: "email_marketing",
    status: "sob_analise",
    voteCount: 64,
    commentCount: 9,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-05-14T13:00:00Z",
    updatedAt: "2026-05-14T13:00:00Z",
  },
  {
    id: 11,
    slug: "permissoes-granulares-por-conexao",
    title: "Permissões granulares por conexão WhatsApp",
    description:
      "Dar acesso a atendentes só a conexões específicas (ex: time A vê só conexões SP, time B só RJ). Hoje só dá pra dar acesso a tudo ou nada. Resolve problema de empresas multi-filial.",
    category: "settings",
    status: "sob_analise",
    voteCount: 41,
    commentCount: 7,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-05-18T10:00:00Z",
    updatedAt: "2026-05-18T10:00:00Z",
  },

  // ─── CONCLUÍDO ─────────────────────────────────────────────────────────
  {
    id: 12,
    slug: "login-com-google-sso",
    title: "Login com Google (SSO via Clerk)",
    description:
      "Acesse o ConvertaFlow com sua conta Google em 1 clique. Funciona em qualquer subdomínio (app, roadmap, futuras ferramentas).",
    category: "security",
    status: "concluido",
    voteCount: 245,
    commentCount: 26,
    hasVoted: true,
    hasPrioritySignal: false,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-04-20T16:00:00Z",
  },
  {
    id: 13,
    slug: "evolution-api-multi-conexao",
    title: "Evolution API: suporte a múltiplas conexões WhatsApp simultâneas",
    description:
      "Anteriormente, cada conta podia ter 1 conexão Evolution. Agora suporta N conexões na mesma conta, com balanceamento automático de mensagens enviadas.",
    category: "connections",
    status: "concluido",
    voteCount: 178,
    commentCount: 22,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2025-12-05T14:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },

  // ─── PAUSADO ───────────────────────────────────────────────────────────
  {
    id: 14,
    slug: "integracao-com-instagram-direct",
    title: "Integração com Instagram Direct (mensagens privadas)",
    description:
      "Atender mensagens diretas do Instagram dentro do ConvertaFlow, na mesma caixa unificada do WhatsApp.",
    category: "inbox",
    status: "pausado",
    statusReason:
      "Aguardando atualização da Meta Graph API que afeta como integrações terceiras acessam DMs. Sem previsão da Meta — assim que estabilizarem, retomamos.",
    voteCount: 134,
    commentCount: 19,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-02-20T11:00:00Z",
    updatedAt: "2026-04-30T15:00:00Z",
  },

  // ─── NÃO SERÁ FEITO ────────────────────────────────────────────────────
  {
    id: 15,
    slug: "chatbot-com-telegram",
    title: "Suporte a Telegram como canal de atendimento",
    description:
      "Conectar bots Telegram à caixa unificada de atendimento.",
    category: "connections",
    status: "nao_sera_feito",
    statusReason:
      "Telegram tem adoção muito baixa no Brasil (nosso mercado principal) e a API deles tem restrições de uso comercial que tornam inviável oferecer com a mesma qualidade que WhatsApp/Instagram. Caso a base de clientes brasileiros pedindo cresça muito, reavaliamos.",
    voteCount: 28,
    commentCount: 11,
    hasVoted: false,
    hasPrioritySignal: false,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-04-10T14:00:00Z",
  },
];

export const MOCK_FEATURES: Feature[] = FEATURES_RAW.map(enrichMockFeature);

/**
 * Top 5 votantes mock pra leaderboard "Classificação".
 */
export const MOCK_LEADERBOARD = [
  { rank: 1, name: "Adamires Rafael", avatarUrl: null, score: 1819 },
  { rank: 2, name: "Will Carvalho", avatarUrl: null, score: 1187 },
  { rank: 3, name: "Alex Pessoal", avatarUrl: null, score: 839 },
  { rank: 4, name: "Marina Costa", avatarUrl: null, score: 612 },
  { rank: 5, name: "Roberto Lima", avatarUrl: null, score: 487 },
];

/**
 * Helper: filtra mock por status (pra agrupar na home).
 */
export function getMockFeaturesByStatus(status: Feature["status"]): Feature[] {
  return MOCK_FEATURES.filter((f) => f.status === status).sort(
    (a, b) => b.voteCount - a.voteCount
  );
}

/**
 * Helper: features ordenadas (para lista geral).
 */
export function getMockFeaturesSorted(
  sortBy: "votes" | "recent" = "votes"
): Feature[] {
  const sorted = [...MOCK_FEATURES];
  if (sortBy === "votes") {
    return sorted.sort((a, b) => b.voteCount - a.voteCount);
  }
  return sorted.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Helper: features de uma categoria especifica, ordenadas por voto.
 */
export function getMockFeaturesByCategory(
  categorySlug: string
): Feature[] {
  return MOCK_FEATURES.filter((f) => f.category === categorySlug).sort(
    (a, b) => b.voteCount - a.voteCount
  );
}

/**
 * Helper: busca feature por slug (retorna undefined se nao achar).
 */
export function getMockFeatureBySlug(slug: string): Feature | undefined {
  return MOCK_FEATURES.find((f) => f.slug === slug);
}

/**
 * Helper: features relacionadas (mesma categoria, exclui a propria).
 */
export function getRelatedMockFeatures(
  feature: Feature,
  limit = 3
): Feature[] {
  return MOCK_FEATURES.filter(
    (f) => f.category === feature.category && f.id !== feature.id
  )
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}

// ─── COMENTÁRIOS MOCK ────────────────────────────────────────────────────

export interface MockComment {
  id: number;
  featureId: number;
  body: string;
  authorName: string;
  authorInitial: string;
  badge: "staff" | "subscriber" | "guest";
  isOfficial: boolean;
  isPinned: boolean;
  createdAt: string;
  reactions: { emoji: string; count: number }[];
  /** Threading 1 nivel — null = top-level, number = reply de */
  parentCommentId?: number | null;
  /**
   * Denormalizado: nome do autor a quem se responde (mostrado como "Em resposta a @X").
   * Quando alguem responde a uma reply, esse campo permite mostrar @X (autor da reply)
   * mesmo que o parentCommentId continue apontando pro top-level (threading shallow).
   */
  repliedToAuthor?: string | null;
}

export const MOCK_COMMENTS: MockComment[] = [
  {
    id: 1,
    featureId: 1,
    body:
      "Resposta oficial: começamos o desenvolvimento essa semana! A memória persistente vai funcionar via embeddings no nosso pgvector, com retenção configurável por conversa. Em breve teremos uma versão beta privada — quem quiser participar, comenta aqui que adiciono na waitlist.",
    authorName: "Cristiano (ConvertaFlow)",
    authorInitial: "CB",
    badge: "staff",
    isOfficial: true,
    isPinned: true,
    createdAt: "2026-05-20T14:30:00Z",
    reactions: [
      { emoji: "🎉", count: 23 },
      { emoji: "❤️", count: 14 },
    ],
  },
  {
    id: 2,
    featureId: 1,
    body:
      "Caraca, isso vai ser game changer! Hoje a gente perde muito contexto quando atendente troca, principalmente quando cliente entra em contato dias depois.",
    authorName: "Marina Costa",
    authorInitial: "MC",
    badge: "subscriber",
    isOfficial: false,
    isPinned: false,
    createdAt: "2026-05-21T09:15:00Z",
    reactions: [{ emoji: "👍", count: 8 }],
  },
  {
    id: 3,
    featureId: 1,
    body:
      "Importante: a memória vai respeitar LGPD né? Cliente vai poder pedir pra apagar histórico dele?",
    authorName: "Roberto Lima",
    authorInitial: "RL",
    badge: "subscriber",
    isOfficial: false,
    isPinned: false,
    createdAt: "2026-05-21T16:42:00Z",
    reactions: [{ emoji: "👍", count: 12 }],
  },
  // ── Replies a Cristiano (id 1) — feature "Agente IA com memoria"
  {
    id: 4,
    featureId: 1,
    parentCommentId: 1,
    repliedToAuthor: "Cristiano (ConvertaFlow)",
    body: "Top demais! Quero entrar na waitlist do beta — agência com 18 clientes ativos no WhatsApp Business.",
    authorName: "Will Carvalho",
    authorInitial: "WC",
    badge: "subscriber",
    isOfficial: false,
    isPinned: false,
    createdAt: "2026-05-20T18:05:00Z",
    reactions: [{ emoji: "👍", count: 5 }],
  },
  {
    id: 5,
    featureId: 1,
    parentCommentId: 1,
    repliedToAuthor: "Cristiano (ConvertaFlow)",
    body: "Confirma se a retenção configurável vai ser por conversa ou por contato? Faz diferença grande pro nosso caso.",
    authorName: "Alex Pessoal",
    authorInitial: "AP",
    badge: "subscriber",
    isOfficial: false,
    isPinned: false,
    createdAt: "2026-05-21T10:30:00Z",
    reactions: [{ emoji: "👍", count: 3 }],
  },
  {
    id: 6,
    featureId: 1,
    parentCommentId: 1,
    // Resposta a outra reply (Will, id 4), mas threading shallow:
    // parentCommentId aponta pro topo (Cristiano, id 1)
    repliedToAuthor: "Will Carvalho",
    body: "Boa Will! A waitlist abre semana que vem aqui mesmo nessa thread, fica de olho.",
    authorName: "Cristiano (ConvertaFlow)",
    authorInitial: "CB",
    badge: "staff",
    isOfficial: true,
    isPinned: false,
    createdAt: "2026-05-22T08:15:00Z",
    reactions: [{ emoji: "❤️", count: 4 }],
  },
  // ── Reply ao Roberto sobre LGPD (id 3)
  {
    id: 7,
    featureId: 1,
    parentCommentId: 3,
    repliedToAuthor: "Roberto Lima",
    body: "Pergunta importante. Vamos respeitar sim — exclusão sob demanda via API e UI no painel do contato. LGPD-compliant por design.",
    authorName: "Cristiano (ConvertaFlow)",
    authorInitial: "CB",
    badge: "staff",
    isOfficial: true,
    isPinned: false,
    createdAt: "2026-05-22T09:00:00Z",
    reactions: [
      { emoji: "❤️", count: 7 },
      { emoji: "👍", count: 5 },
    ],
  },
];

export function getMockCommentsForFeature(featureId: number): MockComment[] {
  // Retorna a lista plana (parents + replies misturados).
  // O CommentThread monta a arvore agrupando por parentCommentId.
  return MOCK_COMMENTS.filter((c) => c.featureId === featureId).sort(
    (a, b) => {
      // Pinned primeiro (apenas considera entre top-level)
      const aTop = a.parentCommentId == null;
      const bTop = b.parentCommentId == null;
      if (aTop && bTop) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  );
}

// ─── CHANGELOG MOCK ──────────────────────────────────────────────────────

export interface MockChangelogEntry {
  id: number;
  releaseVersion: string;
  releaseDate: string; // ISO
  title: string;
  bodyMarkdown: string;
  reactions: { emoji: string; count: number }[];
  relatedFeatureSlugs: string[];
}

export const MOCK_CHANGELOG: MockChangelogEntry[] = [
  {
    id: 1,
    releaseVersion: "v1.8.0",
    releaseDate: "2026-05-15T10:00:00Z",
    title: "Login com Google e SSO unificado em todos os domínios",
    bodyMarkdown: `## O que mudou

- Login com Google funcionando em **app, roadmap e Central de Ajuda**
- Sessão única — você loga uma vez e está autenticado em todos os subdomínios
- Suporte a múltiplas contas Google na mesma sessão

## Por que isso importa

A maior dor que ouvimos foi precisar logar de novo em cada ferramenta. Agora não precisa mais.

## Como usar

Vá em **Configurações → Login** e conecte sua conta Google. Pronto.`,
    reactions: [
      { emoji: "🎉", count: 47 },
      { emoji: "🔥", count: 23 },
      { emoji: "💪", count: 8 },
    ],
    relatedFeatureSlugs: ["login-com-google-sso"],
  },
  {
    id: 2,
    releaseVersion: "v1.7.0",
    releaseDate: "2026-03-15T10:00:00Z",
    title: "Múltiplas conexões WhatsApp na mesma conta (Evolution API)",
    bodyMarkdown: `## Liberado

Agora você pode conectar **quantas instâncias Evolution quiser** na mesma conta ConvertaFlow.

### Melhorias

- Balanceamento automático de envios entre conexões
- Painel unificado de saúde das instâncias
- Failover automático quando uma conexão cai

### Antes vs agora

Antes você precisava ter contas separadas pra cada conexão. Agora não.`,
    reactions: [
      { emoji: "🎉", count: 31 },
      { emoji: "🔥", count: 28 },
    ],
    relatedFeatureSlugs: ["evolution-api-multi-conexao"],
  },
  {
    id: 3,
    releaseVersion: "v1.6.0",
    releaseDate: "2026-02-10T10:00:00Z",
    title: "Modo escuro nativo em todo o aplicativo",
    bodyMarkdown: `Modo escuro chegou! Toggle no canto superior direito.

- Contraste WCAG AA validado
- Tons GitHub Dark inspirados
- Sincroniza com preferência do sistema operacional`,
    reactions: [
      { emoji: "🎉", count: 18 },
      { emoji: "❤️", count: 22 },
    ],
    relatedFeatureSlugs: [],
  },
];
