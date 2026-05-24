import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { HeaderAuth } from "@/components/header-auth";
import { MobileNav } from "@/components/mobile-nav";

/**
 * Header global do roadmap.convertaflow.com.
 *
 * Estrutura espelhada da LP (ADR-024): logo + nav centro + dois CTAs direita.
 * Inter 800 -0.02em pra wordmark. Background branco translucido + backdrop-blur.
 *
 * Auth UI (ADR-026): UserButton quando logado, SignIn modal quando anonimo.
 *
 * Detalhes em [[Tokens Herdados do App e LP]] no Obsidian.
 */
export function Header({
  activePath = "/",
}: {
  activePath?: "/" | "/roadmap" | "/changelog";
}) {
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
            active={activePath === "/"}
          />
          <NavLink
            href="/roadmap"
            label="Roadmap"
            active={activePath === "/roadmap"}
          />
          <NavLink
            href="/changelog"
            label="Changelog"
            active={activePath === "/changelog"}
          />
          <NavLink href="/nova" label="Sugerir" />
        </nav>

        {/* Direita: search compacta + CTAs + hambúrguer mobile */}
        <div className="flex items-center gap-2">
          <button
            className="hidden lg:flex items-center gap-2 h-10 px-3 rounded-[10px] text-[13px] transition-colors"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--surface-high)",
              color: "var(--text-muted)",
              minWidth: "200px",
            }}
            aria-label="Pesquisar"
          >
            <Search className="h-4 w-4" />
            <span>Pesquisar...</span>
            <kbd
              className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-muted)",
              }}
            >
              {"⌘"}K
            </kbd>
          </button>

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
      className="flex items-center h-10 px-4 rounded-[10px] text-[14px] font-semibold transition-colors"
      style={{
        background: active ? "rgba(30, 127, 212, 0.08)" : "transparent",
        color: active ? "var(--brand-primary)" : "var(--text-secondary)",
      }}
    >
      {label}
    </Link>
  );
}
