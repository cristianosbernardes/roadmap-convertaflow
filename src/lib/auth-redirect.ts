/**
 * SSO unificado cross-domain (ADR-029).
 *
 * Login e registro vivem centralizados em `app.convertaflow.com`, igual
 * Google centraliza em accounts.google.com. O roadmap NÃO renderiza form
 * de auth próprio — apenas redireciona com `?return_to=` e o cookie
 * compartilhado em `.convertaflow.com` traz a sessão de volta automaticamente.
 *
 * Cenários cobertos:
 *   A — Pessoa já logada no app abre o roadmap: cookie validado pelo
 *       middleware Clerk no server, sem redirect, header já com avatar.
 *   B — Pessoa nunca logou e clica "Comentar": redirect pra
 *       `app.convertaflow.com/login?return_to=<url>`, faz login, volta
 *       no mesmo path e o draft do comentário (salvo via sessionStorage)
 *       é restaurado pelo `useDraftRestore`.
 *   C — Nova aba enquanto já logada: cookie auto-enviado, autenticação
 *       transparente.
 *
 * Detalhes completos em [[ADRs]] #029 e [[Auth e Multi-domain Clerk]].
 */

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.convertaflow.com";

/** Quanto tempo um draft fica esperando o usuário voltar do auth */
const PENDING_TTL_MS = 60 * 60 * 1000; // 1 hora

const PENDING_ACTION_KEY = "convertaflow_pending_action_after_auth";

export type AuthIntent = "login" | "signup";

export type PendingActionType =
  | "comment"
  | "comment-reply"
  | "suggestion"
  | "vote-priority"
  | "bug-report";

export interface PendingAction {
  type: PendingActionType | string;
  /** Texto em rascunho a restaurar (comentário, sugestão, etc) */
  draft?: string;
  /** ID/slug do recurso alvo (ex: feature_slug, parent_comment_id) */
  targetId?: string;
  /** Timestamp do save — usado pra TTL */
  ts: number;
}

export interface RedirectToAuthOptions {
  /** Hash aplicado na URL de retorno (ex: "#comments", "#suggest-form") */
  returnHash?: string;
  /** Action pendente pra hidratar após o usuário voltar autenticado */
  pendingAction?: Omit<PendingAction, "ts">;
  /** Override da URL de retorno (default = window.location.href) */
  returnTo?: string;
}

/**
 * Redireciona o usuário pro fluxo de auth centralizado no app principal.
 *
 * Para signup, anexa `from=roadmap` pra que o app principal:
 *   1. Renderize o lado esquerdo do split-screen com benefits do roadmap
 *   2. Após signup, pule o /onboarding e /billing (return_to direto)
 *   3. Webhook backend leia unsafeMetadata.from e crie voter SEM org/trial
 */
export function redirectToAuth(
  intent: AuthIntent,
  options?: RedirectToAuthOptions
): void {
  if (typeof window === "undefined") return; // no-op em SSR

  const baseReturn = options?.returnTo ?? window.location.href;
  const returnUrl = new URL(baseReturn);
  if (options?.returnHash) {
    returnUrl.hash = options.returnHash;
  }

  if (options?.pendingAction) {
    try {
      sessionStorage.setItem(
        PENDING_ACTION_KEY,
        JSON.stringify({ ...options.pendingAction, ts: Date.now() })
      );
    } catch {
      // sessionStorage indisponível (Safari privado, cookies bloqueados).
      // Sem draft preservation — fluxo segue, só perde a restauração.
    }
  }

  const params = new URLSearchParams();
  params.set("return_to", returnUrl.toString());
  if (intent === "signup") {
    params.set("from", "roadmap");
  }

  window.location.href = `${APP_URL}/${intent}?${params.toString()}`;
}

/** Atalhos com nomes mais legíveis nos componentes */
export function redirectToLogin(options?: RedirectToAuthOptions): void {
  redirectToAuth("login", options);
}

export function redirectToSignup(options?: RedirectToAuthOptions): void {
  redirectToAuth("signup", options);
}

/**
 * Lê e expira a action pendente (chamado pelo useDraftRestore após o
 * usuário voltar autenticado). Retorna null se não houver ou se TTL passou.
 */
export function readPendingAction(): PendingAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAction;
    if (Date.now() - parsed.ts > PENDING_TTL_MS) {
      clearPendingAction();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingAction(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_ACTION_KEY);
  } catch {
    // ignore
  }
}
