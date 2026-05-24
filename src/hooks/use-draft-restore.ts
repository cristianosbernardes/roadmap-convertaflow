"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  readPendingAction,
  clearPendingAction,
  type PendingActionType,
} from "@/lib/auth-redirect";

interface DraftRestoreState {
  /** Texto em rascunho recuperado (quando aplicável) */
  draft?: string;
  /** ID/slug do recurso alvo (ex: feature_slug) */
  targetId?: string;
  /** True na primeira render em que o draft foi recuperado */
  restored: boolean;
}

/**
 * Hook que detecta a volta do usuário após auth (cenário B do ADR-029) e
 * recupera a action pendente que estava em rascunho antes do redirect.
 *
 * Uso típico em CommentEditor:
 *   const { draft, restored } = useDraftRestore("comment");
 *   useEffect(() => {
 *     if (restored && draft) setBody(draft);
 *   }, [restored, draft]);
 *
 * O hook limpa o pending action automaticamente após a primeira leitura,
 * evitando que o draft "ressuscite" em navegações futuras.
 *
 * @param actionType Filtra por tipo de ação. Se omitido, captura qualquer.
 */
export function useDraftRestore(
  actionType?: PendingActionType | string
): DraftRestoreState {
  const { isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<DraftRestoreState>({ restored: false });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const pending = readPendingAction();
    if (!pending) return;
    if (actionType && pending.type !== actionType) return;

    setState({
      draft: pending.draft,
      targetId: pending.targetId,
      restored: true,
    });
    clearPendingAction();
  }, [isLoaded, isSignedIn, actionType]);

  return state;
}
