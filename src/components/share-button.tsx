"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Link2,
  Linkedin,
  MessageCircle,
  Share2,
  Twitter,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Botão "Compartilhar" com dropdown de canais (S-C-06).
 *
 * Implementação manual (state local + click-outside + ESC) em vez do
 * shadcn DropdownMenu para manter consistência visual com o resto do
 * projeto (CSS vars + rounded-[10px] container + rounded-[7px] items),
 * já que o shadcn DropdownMenu instalado usa `bg-popover` e `rounded-md`
 * que destoam dos botões existentes na página de feature.
 *
 * Canais:
 *  1. (opcional, mobile) Mais opções — Web Share API nativa do OS.
 *  2. Copiar link  — clipboard.writeText + toast.
 *  3. WhatsApp     — wa.me/?text=... (diferencial brasileiro).
 *  4. X (Twitter)  — twitter.com/intent/tweet.
 *  5. LinkedIn     — linkedin.com/sharing/share-offsite.
 *
 * A11y: trigger aria-label, menu role=menu, items role=menuitem,
 * ESC fecha, click fora fecha, Tab cicla naturalmente os items.
 */
export interface ShareButtonProps {
  /** URL absoluta da feature (ex.: https://roadmap.convertaflow.com/feature/agente-ia). */
  url: string;
  /** Título da feature (usado nos textos de share). */
  title: string;
  /** Resumo opcional (preferido pelo Web Share API quando presente). */
  summary?: string;
  /** Classe extra no wrapper (opcional). */
  className?: string;
}

interface ShareItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  onSelect: () => void | Promise<void>;
}

export function ShareButton({
  url,
  title,
  summary,
  className,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();

  // Detecta Web Share API só no client (evita hydration mismatch).
  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  // Fecha no ESC + click fora.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        // devolve foco para o trigger para não perder navegação por teclado
        triggerRef.current?.focus();
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (wrapperRef.current && target && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const handleCopyLink = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      } else {
        throw new Error("Clipboard API indisponível");
      }
    } catch {
      toast.error("Erro ao copiar");
    } finally {
      setOpen(false);
    }
  }, [url]);

  const openExternal = useCallback(
    (href: string) => {
      if (typeof window !== "undefined") {
        window.open(href, "_blank", "noopener,noreferrer");
      }
      setOpen(false);
    },
    [],
  );

  const handleWhatsApp = useCallback(() => {
    const text = `Olha essa feature do roadmap ConvertaFlow: ${title}\n${url}`;
    openExternal(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }, [openExternal, title, url]);

  const handleTwitter = useCallback(() => {
    const text = `${title} — via @ConvertaFlow`;
    openExternal(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
    );
  }, [openExternal, title, url]);

  const handleLinkedIn = useCallback(() => {
    openExternal(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
    );
  }, [openExternal, url]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      return;
    }
    try {
      await navigator.share({
        title,
        text: summary,
        url,
      });
    } catch {
      // Usuário cancelou o share sheet ou navegador bloqueou — silencioso.
    } finally {
      setOpen(false);
    }
  }, [summary, title, url]);

  const items: ShareItem[] = [
    ...(canNativeShare
      ? [
          {
            key: "native",
            label: "Mais opções",
            icon: Smartphone,
            onSelect: handleNativeShare,
          },
        ]
      : []),
    {
      key: "copy",
      label: "Copiar link",
      icon: Link2,
      onSelect: handleCopyLink,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      onSelect: handleWhatsApp,
    },
    {
      key: "twitter",
      label: "X (Twitter)",
      icon: Twitter,
      onSelect: handleTwitter,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      onSelect: handleLinkedIn,
    },
  ];

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className ?? ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Compartilhar feature"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
          color: "var(--text-primary)",
        }}
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Compartilhar
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Opções de compartilhamento"
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[200px] p-1 rounded-[10px]"
          style={{
            background: "var(--surface-card)",
            border: "1.5px solid var(--border-primary)",
            boxShadow:
              "0 8px 24px rgba(2, 23, 74, 0.10), 0 2px 6px rgba(2, 23, 74, 0.06)",
          }}
        >
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void item.onSelect();
                    }}
                    className="w-full inline-flex items-center gap-2 h-10 px-2.5 text-[13px] text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{
                      borderRadius: "7px",
                      background: "transparent",
                      color: "var(--text-primary)",
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--surface-low)";
                      e.currentTarget.style.borderColor =
                        "var(--border-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "var(--surface-low)";
                      e.currentTarget.style.borderColor =
                        "var(--border-secondary)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
