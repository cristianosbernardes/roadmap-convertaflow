"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import type { PermissionContext, PermissionTier } from "@/lib/permissions";

/**
 * Hook canonical pra determinar o tier de permissao do usuario atual.
 *
 * Tier escalonado (ADR-026):
 *   - anonymous: sem Clerk, vota via cookie
 *   - logged: tem Clerk
 *   - subscriber: Clerk + plano pago ativo (mock: simula via query param ?mockTier=)
 *   - staff: Clerk + email em staff_users (mock: simula via query param ?mockTier=staff)
 *
 * Estado MOCK ate Sprint 4 (migracao API):
 *   - Sem JWT: anonymous
 *   - Com JWT: logged (default)
 *   - ?mockTier=subscriber na URL → simula assinante (pra testar gates)
 *   - ?mockTier=staff na URL → simula staff
 *
 * Quando backend chegar (Sprint 4):
 *   - GET /roadmap/me retorna { isSubscriber, isStaff }, substitui mockTier
 */
export function useUserPermissions(): PermissionContext {
  const { isSignedIn, user } = useUser();
  const [mockTier, setMockTier] = useState<PermissionTier | null>(null);

  useEffect(() => {
    // Mock-only: permite forcar tier via query param pra QA dos gates
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("mockTier");
    if (t === "subscriber" || t === "staff" || t === "logged") {
      setMockTier(t);
    } else if (t === "anonymous") {
      setMockTier("anonymous");
    } else {
      setMockTier(null);
    }
  }, []);

  // Mock override (apenas dev/QA)
  if (mockTier) {
    return {
      tier: mockTier,
      userId: mockTier === "anonymous" ? undefined : "mock-user-id",
      orgId: mockTier === "subscriber" || mockTier === "staff" ? "mock-org-id" : undefined,
      planSlug: mockTier === "subscriber" ? "business" : undefined,
    };
  }

  // Producao: anonimo OU logado (subscriber/staff resolvido pelo backend depois)
  if (!isSignedIn || !user) {
    return { tier: "anonymous" };
  }

  // TODO Sprint 4: trocar por fetch de GET /roadmap/me pra resolver subscriber/staff
  return {
    tier: "logged",
    userId: user.id,
  };
}
