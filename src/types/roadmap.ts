/**
 * Tipos canônicos do domínio Roadmap.
 *
 * **CONTRATO BACKEND ↔ FRONTEND** — espelhar EXATAMENTE no Pydantic
 * do `app-converta-flow/backend-python/app/api/v1/roadmap/`.
 *
 * Convenção: backend retorna camelCase (Pydantic aliases já configurado
 * no app principal). Datas como strings ISO 8601.
 *
 * Última atualização: 2026-05-23 (Sessão 4 + 5 do Dia 1)
 * — 14 ajustes aplicados conforme descobertas durante UI mock-first.
 * Detalhes em Obsidian: [[2026-05-23 - Dia 1...]] § Sessão 4.
 */

import type { StatusSlug, CategorySlug } from "@/lib/constants";

// ─── TAGS (hashtags livres, ADR-012) ──────────────────────────────────

export interface Tag {
  /** Slug ASCII sem acento: 'whatsapp', 'api', 'mobile' */
  slug: string;
  /** Emoji decorativo opcional: '💚', '🔌', '📱' */
  emoji?: string;
  /** Quantas features usam essa tag (denormalizado) */
  usageCount: number;
}

// ─── FEATURE ──────────────────────────────────────────────────────────

export interface Feature {
  id: number;
  slug: string;
  title: string;
  /** Markdown completo. Renderizado via react-markdown na pagina de feature. */
  description: string;
  /**
   * Preview curto para card (max 200 chars).
   * Auto-gerado pelo backend no INSERT/UPDATE a partir da primeira frase
   * da `description` (sem markdown).
   */
  descriptionShort: string;
  category: CategorySlug;
  status: StatusSlug;
  /** Motivo público obrigatório quando status ∈ {pausado, nao_sera_feito}. Trigger SQL valida (min 20 chars). */
  statusReason?: string | null;

  /** Denormalizado, mantido por trigger em INSERT/DELETE de votes */
  voteCount: number;
  commentCount: number;
  /** Quantas empresas marcaram "Minha empresa precisa" (denormalizado) */
  prioritySignalCount: number;

  /** Hashtags livres atribuidas por staff (max 3 por feature) */
  tags: Tag[];

  /** Pin pelo staff no topo da home (destaque manual) */
  isFeatured: boolean;
  /** "Nao publicar competitivamente" — quando true, feature so visivel a staff */
  isSensitive: boolean;

  /** TRUE se o user autenticado atual votou. Omitido se sem auth. */
  hasVoted?: boolean;
  /** TRUE se a org do user autenticado marcou prioridade. Omitido se sem auth ou sem org. */
  hasPrioritySignal?: boolean;

  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  /**
   * Quando staff moderou e aprovou pra exibicao publica.
   * NULL = ainda em moderacao (so visivel pra staff no /admin).
   */
  publishedAt?: string | null;

  /** Slug do staff que criou (sem PII publica). NULL se criado por usuario via /nova. */
  createdByStaffSlug?: string | null;
}

export interface FeatureDetail extends Feature {
  /** Markdown rico, renderizado no frontend via react-markdown + remark-gfm */
  bodyMarkdown: string;

  /** Top 12 votantes pra grid de avatares no side panel (mais recentes) */
  topVoters: VoterPreview[];

  /** Features relacionadas (mesma categoria, top 3 por voto, exclui a propria) */
  relatedFeatures?: Feature[];

  /** Historico de mudancas de status (pra timeline publica, fase 0.8) */
  statusHistory?: StatusChange[];
}

export interface VoterPreview {
  /** clerk user_id (nao mostrar publicamente, usar pra avatar URL) */
  userId: string;
  /** Nome curto pra exibir */
  name: string;
  /** URL completa do avatar (clerk img.clerk.com); null fallback usa iniciais */
  avatarUrl?: string | null;
}

export interface StatusChange {
  fromStatus: StatusSlug | null;
  toStatus: StatusSlug;
  reason?: string | null;
  changedAt: string;
  changedByStaffSlug?: string;
}

// ─── VOTOS ────────────────────────────────────────────────────────────

export interface VoteResponse {
  /** Estado final apos operacao (idempotente) */
  hasVoted: boolean;
  voteCount: number;
  /** Peso aplicado ao voto (1=Starter default, 2=Business, 3=Enterprise — fase 2) */
  weight: number;
}

// ─── COMENTÁRIOS ──────────────────────────────────────────────────────

export interface Comment {
  id: number;
  featureId: number;
  /** Markdown renderizado via react-markdown + remark-gfm */
  body: string;
  /** TRUE quando staff respondeu oficialmente (border-left brand + badge "Oficial ConvertaFlow") */
  isOfficial: boolean;
  /** Sticky no topo da thread */
  isPinned: boolean;
  /** Visivel APENAS pra staff (anotacao interna, nao aparece em GET publico) */
  isInternal: boolean;
  /** Threading 1 nivel — NULL = top-level, BIGINT = reply de */
  parentCommentId?: number | null;

  author: {
    userId: string;
    name: string;
    avatarUrl?: string | null;
    /** Badge mostrado ao lado do nome */
    badge?: "staff" | "subscriber" | "guest";
  };

  /** Emoji reactions agregadas (👍 ❤️ 🎉) */
  reactions: ReactionCount[];

  /** Replicas aninhadas (1 nivel so, threading shallow) */
  replies?: Comment[];

  createdAt: string;
  updatedAt: string;
  /** Setado quando autor edita */
  editedAt?: string | null;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  /** TRUE se o user autenticado atual ja reagiu com esse emoji. Omitido se sem auth. */
  hasReacted?: boolean;
}

export interface CommentCreateRequest {
  body: string;
  parentCommentId?: number | null;
}

export interface ReactionRequest {
  emoji: string;
}

// ─── BUG REPORTS (assinante apenas) ───────────────────────────────────

export type BugSeverity = "critical" | "high" | "medium" | "low";
export type BugStatus = "open" | "investigating" | "resolved" | "wont_fix";

export interface BugReport {
  id: number;
  featureId?: number | null;
  title: string;
  body: string;
  severity: BugSeverity;
  status: BugStatus;
  /** ID interno do reporter (nao exibido publicamente) */
  reporterUserId: string;
  /** Empresa do reporter (Companies.id) — sinal de peso comercial */
  reporterOrgId: string;
  /** Staff decide se o report fica publico */
  isPublic: boolean;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface BugReportCreateRequest {
  title: string;
  body: string;
  severity: BugSeverity;
  featureId?: number | null;
  wantPublic?: boolean;
}

// ─── PRIORITY SIGNAL ("Minha empresa precisa") ────────────────────────

export interface PrioritySignalResponse {
  hasPrioritySignal: boolean;
  /** Total publico de empresas que marcaram */
  priorityCount: number;
}

// ─── BETA ACCESS REQUEST (waitlist do status beta_privado) ────────────

export type BetaAccessStatus = "pending" | "approved" | "denied";

export interface BetaAccessRequest {
  id: number;
  featureId: number;
  userId: string;
  orgId?: string | null;
  status: BetaAccessStatus;
  /** Mensagem opcional escrita pelo usuario explicando por que quer */
  message?: string | null;
  approvedByStaffSlug?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

export interface BetaAccessRequestCreate {
  message?: string;
}

export interface BetaAccessResponse {
  status: BetaAccessStatus;
  /** Posicao na fila se ainda pending */
  queuePosition?: number;
}

// ─── CHANGELOG ────────────────────────────────────────────────────────

export interface ChangelogEntry {
  id: number;
  /** SemVer opcional: 'v1.4.0', 'v1.5.0' */
  releaseVersion?: string | null;
  releaseDate: string; // ISO 8601 (date)
  title: string;
  /** Markdown rico, renderizado com react-markdown + remark-gfm */
  bodyMarkdown: string;
  heroImageUrl?: string | null;
  /** Slugs das features incluidas nessa release */
  relatedFeatureSlugs: string[];
  /** Reactions agregadas (🎉 🔥 💪 ❤️ etc) */
  reactions: ReactionCount[];
  isPublished: boolean;
  publishedAt?: string | null;
  createdByStaffSlug: string;
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  /** Pontos = votos dados + comentarios * 2 + features criadas aceitas * 5 */
  score: number;
}

// ─── LISTAGENS (paginadas) ────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type FeatureSortBy =
  | "votes"
  | "recent"
  | "oldest"
  | "least_votes"
  | "random"
  | "trending";

export interface FeatureListFilters {
  status?: StatusSlug | StatusSlug[];
  category?: CategorySlug | CategorySlug[];
  tag?: string;
  sortBy?: FeatureSortBy;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── CRIAÇÃO DE FEATURE (com dedup AI) ────────────────────────────────

export interface FeatureCreateRequest {
  title: string;
  category: CategorySlug;
  description: string;
  /** Tags opcionais (staff pode adicionar depois) */
  tags?: string[];
}

/**
 * Resposta de POST /features quando dedup AI detecta similar (HTTP 409).
 * Backend nao cria a feature — sugere votar em vez.
 */
export interface DuplicateDetectedResponse {
  detail: "Feature similar ja existe";
  reason: "duplicate_detected";
  similar: Array<{ feature: Feature; similarity: number }>;
}

// ─── BUSCA SEMÂNTICA (pgvector) ───────────────────────────────────────

export interface SearchResult {
  feature: Feature;
  similarity: number; // 0-1 (cosine)
}

export interface SearchResponse {
  items: SearchResult[];
  query: string;
  total: number;
}

// ─── USER CONTEXT ─────────────────────────────────────────────────────

export interface UserContext {
  isAuthenticated: boolean;
  /** TRUE se org_id resolvido + plano pago ativo */
  isSubscriber: boolean;
  /** TRUE se email em public.staff_users */
  isStaff: boolean;
  /** Peso do voto (1 default, 2 Business, 3 Enterprise futuramente) */
  voteWeight: number;
}

// ─── CATEGORIA & STATUS (espelho do constants.ts, retornado pelos endpoints públicos) ───

export interface CategoryAPI {
  slug: CategorySlug;
  label: string;
  description: string;
  /** Nome do icone Lucide React */
  iconName: string;
  /** Hex sem # */
  colorHex: string;
  /** Gradiente CSS opcional (so 'ai' tem) */
  iconGradient?: string | null;
  sortOrder: number;
  /** Quantas features ativas nessa categoria */
  featureCount: number;
}

export interface StatusAPI {
  slug: StatusSlug;
  label: string;
  emoji: string;
  /** Hex sem # */
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  sortOrder: number;
  /** TRUE se status_reason e obrigatorio (pausado, nao_sera_feito) */
  requiresReason: boolean;
  /** Quantas features ativas nesse status */
  featureCount: number;
}

// ─── DASHBOARD STAFF (somente admin) ──────────────────────────────────

export interface AdminDashboard {
  votesLast30d: number;
  commentsLast30d: number;
  featuresLast30d: number;
  /** Top features por MRR esperando (somente staff ve) */
  topFeaturesByMrr: Array<{
    feature: Feature;
    mrrTotal: number;
    orgCount: number;
  }>;
  betaWaitlistPending: number;
  /** Features com status sob_analise sem published_at */
  moderationQueue: number;
}
