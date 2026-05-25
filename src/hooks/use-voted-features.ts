"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllLocalVotes, type VoteType } from "@/lib/voter-cookie";
import { MOCK_FEATURES } from "@/lib/mock-data";
import type { Feature } from "@/types/roadmap";

/**
 * Hook que retorna a lista de features votadas pelo user atual (S-D-13).
 *
 * Fonte de dados (mock-first):
 *   - Cookie/localStorage `cf_roadmap_local_votes` (voter-cookie.ts)
 *   - Cruza com MOCK_FEATURES pra hidratar título/categoria/etc
 *
 * Quando backend chegar (Sprint 3):
 *   - User logado: GET `/api/v1/roadmap/me/votes` (cross-device)
 *   - Anônimo: continua via cookie httpOnly (.convertaflow.com)
 *   - Merge: votos do cookie + votos do backend, dedup por slug
 *
 * Atualização reativa:
 *   - Lê no mount + escuta `storage` event (cross-tab) + custom event
 *     `cf-roadmap-votes-changed` (mesma tab, disparado por vote-button-interactive
 *     no futuro — opcional, hoje só refresca em mount/storage).
 */
export interface VotedFeatureEntry {
  feature: Feature;
  voteType: VoteType;
}

export interface UseVotedFeaturesResult {
  /** Features votadas com seu tipo de voto. Inclui APENAS slugs encontrados em MOCK_FEATURES. */
  entries: VotedFeatureEntry[];
  /** Quantidade total (== entries.length). */
  count: number;
  /** Mapa rápido featureId → voteType (útil pra chips). */
  voteByFeatureId: Map<number, VoteType>;
  /** Hidratado (false durante SSR + 1º render). Evita flash do count==0. */
  hydrated: boolean;
  /** Força releitura do localStorage (chamado após "Limpar histórico"). */
  refresh: () => void;
}

const STORAGE_EVENT = "cf-roadmap-votes-changed";

export function useVotedFeatures(): UseVotedFeaturesResult {
  const [hydrated, setHydrated] = useState(false);
  const [votes, setVotes] = useState<Record<string, VoteType>>({});

  const read = useCallback(() => {
    setVotes(getAllLocalVotes());
  }, []);

  useEffect(() => {
    read();
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      // Atualiza se for a mesma key (cross-tab) ou null (clear() global)
      if (e.key === null || e.key === "cf_roadmap_local_votes") {
        read();
      }
    };

    const onCustom = () => read();

    window.addEventListener("storage", onStorage);
    window.addEventListener(STORAGE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STORAGE_EVENT, onCustom);
    };
  }, [read]);

  // Cruza slugs votados com MOCK_FEATURES (entrega data hidratada).
  // Ordenado por slugs que aparecem mais cedo em MOCK_FEATURES = ordem editorial
  // estável; quando backend chegar, deve ordenar por `voted_at DESC`.
  const entries: VotedFeatureEntry[] = [];
  const voteByFeatureId = new Map<number, VoteType>();
  for (const feature of MOCK_FEATURES) {
    const voteType = votes[feature.slug];
    if (voteType) {
      entries.push({ feature, voteType });
      voteByFeatureId.set(feature.id, voteType);
    }
  }

  return {
    entries,
    count: entries.length,
    voteByFeatureId,
    hydrated,
    refresh: read,
  };
}

/**
 * Dispara um evento custom pra avisar `useVotedFeatures` (mesma tab) que houve
 * mudança de votos. Usado quando o user vota/desvota fora do header — opcional,
 * o popover já refaz no próximo mount. Mantido aqui pra Sprint 3 facilitar.
 */
export function notifyVotesChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}
