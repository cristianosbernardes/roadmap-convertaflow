"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { CATEGORY_LIST } from "@/lib/constants";
import { redirectToLogin, redirectToSignup } from "@/lib/auth-redirect";

/**
 * Mobile navigation drawer (Sprint C — S-C-01).
 *
 * Drawer slide-in da direita ativado pelo botão hambúrguer.
 * Visível apenas em telas < md (768px). Desktop usa nav inline no Header.
 *
 * UX:
 *   - Backdrop blur + ESC + click backdrop + auto-close em link = fecha
 *   - Trap de foco básico (foco vai pro botão de fechar ao abrir, volta
 *     pro botão hambúrguer ao fechar)
 *   - Touch targets h-12 (48px), >= 44px iOS HIG mínimo
 *   - Scroll interno se conteúdo ultrapassa viewport
 *   - body overflow=hidden enquanto aberto pra evitar duplo-scroll
 *
 * Estrutura interna (top -> bottom):
 *   1. Header do drawer: logo + wordmark + botão X
 *   2. Nav principal (Roadmap, Visão Kanban, Changelog, Sugerir, Sobre)
 *   3. Categorias (14 itens com ícone Lucide + label + cor)
 *   4. Auth: anônimo = Entrar/Criar conta; logado = UserButton + Ir pro app
 *
 * Implementação manual (sem shadcn Sheet ainda não instalado).
 * Animação CSS transition 250ms ease.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Portal precisa de window; só monta depois de hidratado.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha o drawer ao trocar de rota (back/forward do browser, etc).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC fecha + trava scroll do body enquanto aberto
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    // Foco vai pro botão de fechar ao abrir (a11y)
    const t = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(t);
    };
  }, [open]);

  // Devolve foco pro botão hambúrguer ao fechar
  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Função padrão pra fechar o drawer (usada por todos os links e CTAs).
  const close = () => setOpen(false);

  return (
    <>
      {/* Botão hambúrguer — visível apenas < md */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-[10px] transition-colors"
        style={{
          background: "transparent",
          border: "1px solid var(--border-secondary)",
          color: "var(--text-primary)",
        }}
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop + Drawer — portal pra escapar do containing-block criado
          pelo backdrop-filter do <header>. CSS `fixed` só funciona corretamente
          quando não há ancestral com transform/filter/backdrop-filter. */}
      {mounted &&
        createPortal(
          <DrawerOverlay
            open={open}
            close={close}
            pathname={pathname}
            isLoaded={isLoaded}
            isSignedIn={isSignedIn}
            closeBtnRef={closeBtnRef}
          />,
          document.body
        )}
    </>
  );
}

function DrawerOverlay({
  open,
  close,
  pathname,
  isLoaded,
  isSignedIn,
  closeBtnRef,
}: {
  open: boolean;
  close: () => void;
  pathname: string;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  closeBtnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div
      className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
        {/* Backdrop blur */}
        <button
          type="button"
          onClick={close}
          aria-label="Fechar menu"
          className="absolute inset-0 w-full h-full cursor-default"
          style={{
            background: "rgba(2, 23, 74, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          tabIndex={-1}
        />

        {/* Drawer */}
        <aside
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className={`absolute top-0 right-0 h-full w-[88%] max-w-[360px] flex flex-col transition-transform duration-[250ms] ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            background: "var(--surface-card)",
            borderLeft: "1.5px solid var(--border-primary)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Header do drawer */}
          <div
            className="flex items-center justify-between px-4 h-16 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-secondary)" }}
          >
            <Link
              href="/"
              onClick={close}
              className="flex items-center gap-2.5"
            >
              <Image
                src="/icon.svg"
                alt="ConvertaFlow"
                width={32}
                height={32}
              />
              <div className="flex flex-col leading-none">
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

            <button
              ref={closeBtnRef}
              type="button"
              onClick={close}
              className="inline-flex items-center justify-center h-10 w-10 rounded-[10px] transition-colors"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-primary)",
              }}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conteúdo com scroll interno */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {/* Nav principal */}
            <nav className="flex flex-col gap-1" aria-label="Navegação principal">
              <MobileNavItem
                href="/"
                label="Roadmap"
                active={pathname === "/"}
                onNavigate={close}
              />
              <MobileNavItem
                href="/roadmap"
                label="Visão Kanban"
                active={pathname === "/roadmap"}
                onNavigate={close}
              />
              <MobileNavItem
                href="/changelog"
                label="Changelog"
                active={pathname === "/changelog"}
                onNavigate={close}
              />
              <MobileNavItem
                href="/nova"
                label="Sugerir"
                active={pathname === "/nova"}
                onNavigate={close}
              />
              <MobileNavItem
                href="/sobre"
                label="Sobre"
                active={pathname === "/sobre"}
                onNavigate={close}
              />
            </nav>

            {/* Separador */}
            <div
              className="my-4 h-px w-full"
              style={{ background: "var(--border-secondary)" }}
              role="separator"
            />

            {/* Categorias */}
            <div className="flex flex-col gap-1">
              <p
                className="px-3 mb-1 text-[11px] uppercase font-semibold"
                style={{
                  color: "var(--text-muted)",
                  letterSpacing: "0.07em",
                }}
              >
                Categorias
              </p>
              {CATEGORY_LIST.map((cat) => {
                const Icon = cat.icon;
                const isActive = pathname === `/categoria/${cat.slug}`;
                const isGradient = !!cat.iconGradient;

                return (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 h-12 px-3 rounded-[7px] text-[14px] font-medium transition-colors"
                    style={{
                      background: isActive
                        ? "rgba(30, 127, 212, 0.08)"
                        : "transparent",
                      color: isActive
                        ? "var(--brand-primary)"
                        : "var(--text-secondary)",
                      border: "1px solid transparent",
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center h-8 w-8 rounded-[8px] flex-shrink-0"
                      style={
                        isGradient
                          ? {
                              background: cat.iconGradient,
                              color: "#ffffff",
                            }
                          : {
                              background: `${cat.color}15`,
                              color: cat.color,
                            }
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Rodapé com auth */}
          <div
            className="px-4 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid var(--border-secondary)" }}
          >
            {!isLoaded ? (
              <div
                className="h-12 w-full rounded-[10px] animate-pulse"
                style={{ background: "var(--surface-low)" }}
              />
            ) : isSignedIn ? (
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-12 w-12",
                    },
                  }}
                  userProfileMode="modal"
                />
                <a
                  href="https://app.convertaflow.com"
                  onClick={close}
                  className="flex-1 inline-flex items-center justify-center h-12 px-4 rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  Ir pro app
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    redirectToLogin();
                  }}
                  className="inline-flex items-center justify-center h-12 px-4 rounded-[10px] text-[14px] font-semibold transition-opacity hover:opacity-80"
                  style={{
                    background: "var(--surface-low)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-secondary)",
                  }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    redirectToSignup();
                  }}
                  className="inline-flex items-center justify-center h-12 px-4 rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-dark) 100%)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  Criar conta
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
  );
}

function MobileNavItem({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center h-12 px-3 rounded-[7px] text-[15px] font-semibold transition-colors"
      style={{
        background: active ? "rgba(30, 127, 212, 0.08)" : "transparent",
        color: active ? "var(--brand-primary)" : "var(--text-primary)",
      }}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
