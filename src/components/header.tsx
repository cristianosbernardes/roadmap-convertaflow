"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderAuth } from "@/components/header-auth";
import { MobileNav } from "@/components/mobile-nav";
import { SearchTrigger } from "@/components/search-trigger";
import { VotedFeaturesPopover } from "@/components/voted-features-popover";
import {
  getActivePathFromPath,
  type ActivePath,
} from "@/lib/active-path";

/**
 * Header global do roadmap.convertaflow.com.
 *
 * Estrutura espelhada da LP (ADR-024): logo + nav centro + dois CTAs direita.
 * Inter 800 -0.02em pra wordmark. Background branco translucido + backdrop-blur.
 *
 * Auth UI (ADR-026): UserButton quando logado, SignIn modal quando anonimo.
 *
 * Detecção de rota ativa (Sprint D — S-D-03): usa `usePathname()` +
 * `getActivePathFromPath` (helper isomorf em src/lib/active-path.ts).
 * Rotas derivadas como /categoria/inbox e /feature/X destacam "Publicações"
 * porque são views filtradas/detalhe do feed principal. Rotas transversais
 * (/buscar) não destacam nada.
 *
 * Pages NÃO precisam mais passar `activePath` manualmente — o Header resolve
 * sozinho via pathname. A prop opcional `activePathOverride` continua
 * disponível pra casos especiais (ex: testes).
 *
 * Detalhes em [[Tokens Herdados do App e LP]] no Obsidian.
 */
export function Header({
  activePathOverride,
}: {
  activePathOverride?: ActivePath | null;
} = {}) {
  const pathname = usePathname() ?? "/";
  const active =
    activePathOverride !== undefined
      ? activePathOverride
      : getActivePathFromPath(pathname);

  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--surface-high)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo + wordmark (estilo LP) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <Image
            src="/icon.svg"
            alt="ConvertaFlow"
            width={32}
            height={32}
            priority
          />
          <div className="hidden sm:flex flex-col leading-none">
            <span
              className="text-[17px] font-extrabold"
              style={{
                color: "var(--brand-navy)",
                letterSpacing: "-0.02em",
              }}
            >
              ConvertaFlow
            </span>
            <span
              className="text-[10px] mt-0.5 uppercase font-semibold"
              style={{
                color: "var(--text-muted)",
                letterSpacing: "0.07em",
              }}
            >
              Roadmap
            </span>
          </div>
        </Link>

        {/* Nav centro */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            href="/"
            label="Publicações"
            active={active === "publicacoes"}
          />
          <NavLink
            href="/roadmap"
            label="Roadmap"
            active={active === "roadmap"}
          />
          <NavLink
            href="/changelog"
            label="Changelog"
            active={active === "changelog"}
          />
          <NavLink
            href="/nova"
            label="Sugerir"
            active={active === "sugerir"}
          />
        </nav>

        {/* Direita: search compacta + CTAs + hambúrguer mobile */}
        <div className="flex items-center gap-2">
          {/* Trigger client-side do modal Cmd+K (S-C-05). */}
          <SearchTrigger />

          {/* Histórico "Você votou em" (S-D-13). Esconde se count===0. */}
          <VotedFeaturesPopover />

          {/* Auth: SignIn modal quando anonimo, UserButton + Ir pro app quando logado */}
          <HeaderAuth />

          {/* Hambúrguer mobile (< md) — drawer com nav + categorias + auth (S-C-01) */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="flex items-center h-10 px-4 rounded-[10px] text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
      style={{
        background: active ? "rgba(30, 127, 212, 0.08)" : "transparent",
        color: active ? "var(--brand-primary)" : "var(--text-secondary)",
      }}
    >
      {label}
    </Link>
  );
}
