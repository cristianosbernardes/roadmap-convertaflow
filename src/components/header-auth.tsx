"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

/**
 * Bloco de auth do header.
 * Logica condicional (ADR-026):
 *   - Anonimo: botões "Entrar" (modal) + "Criar conta" (modal)
 *   - Logado: UserButton (avatar com menu) + link "Ir pro app"
 *
 * Clerk v7+ — uso useUser() em vez de SignedIn/SignedOut (removidos).
 */
export function HeaderAuth() {
  const { isLoaded, isSignedIn } = useUser();

  // Durante hidratação, renderiza placeholder neutro pra evitar layout shift
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 rounded-full"
          style={{ background: "var(--surface-low)" }}
        />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <>
        <SignInButton mode="modal">
          <button
            type="button"
            className="hidden sm:inline-flex items-center h-10 px-4 rounded-[10px] text-[13px] font-semibold transition-opacity hover:opacity-80"
            style={{
              background: "var(--surface-low)",
              color: "var(--text-primary)",
            }}
          >
            Entrar
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="inline-flex items-center h-10 px-4 rounded-[10px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            Criar conta
          </button>
        </SignUpButton>
      </>
    );
  }

  return (
    <>
      <a
        href="https://app.convertaflow.com"
        className="hidden sm:inline-flex items-center h-10 px-4 rounded-[10px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{
          background:
            "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        Ir pro app
      </a>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-10 w-10",
          },
        }}
        userProfileMode="modal"
      />
    </>
  );
}
