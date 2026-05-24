"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Footer global do roadmap.convertaflow.com.
 *
 * Estrutura espelhada da LP (ADR-024): 4 colunas + bottom bar em desktop.
 *
 * Mobile (< md): bloco de marca + 3 accordions colapsados (Produto, Roadmap, Legal).
 * Reduz footer mobile de ~1200px para ~400px (Productlane/Linear pattern).
 *
 * Col 1: Logo + tagline + descricao curta (sempre visivel)
 * Col 2: Produto (app, docs, blog, changelog)
 * Col 3: Roadmap (publicacoes, kanban, sugerir, sobre)
 * Col 4: Legal (privacidade, termos)
 *
 * Detalhes em [[Tokens Herdados do App e LP]] no Obsidian.
 */

type ColumnKey = "produto" | "roadmap" | "legal";

type ColumnLink = {
  href: string;
  label: string;
  external?: boolean;
};

const COLUMNS: Record<ColumnKey, { title: string; links: ColumnLink[] }> = {
  produto: {
    title: "Produto",
    links: [
      { href: "https://app.convertaflow.com", label: "Acessar app", external: true },
      { href: "https://convertaflow.com", label: "Site oficial", external: true },
      { href: "https://convertaflow.com/docs", label: "Central de ajuda", external: true },
      { href: "https://convertaflow.com#pricing", label: "Planos", external: true },
    ],
  },
  roadmap: {
    title: "Roadmap",
    links: [
      { href: "/", label: "Todas as publicações" },
      { href: "/roadmap", label: "Visão em colunas" },
      { href: "/changelog", label: "Changelog" },
      { href: "/sobre", label: "Sobre este roadmap" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { href: "https://convertaflow.com/privacy-policy", label: "Política de privacidade", external: true },
      { href: "https://convertaflow.com/terms-of-service", label: "Termos de serviço", external: true },
      { href: "https://convertaflow.com/terms-of-use", label: "Termos de uso", external: true },
    ],
  },
};

export function Footer() {
  const year = new Date().getFullYear();
  const [openColumn, setOpenColumn] = useState<ColumnKey | null>(null);

  function toggle(key: ColumnKey) {
    setOpenColumn((current) => (current === key ? null : key));
  }

  return (
    <footer
      style={{
        background: "#faf8ff",
        borderTop: "1px solid var(--surface-high)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* MOBILE (< md): marca sempre visivel + accordions */}
        <div className="md:hidden mb-8">
          <BrandBlock />

          <div className="mt-8 flex flex-col gap-2">
            {(Object.keys(COLUMNS) as ColumnKey[]).map((key) => (
              <FooterAccordion
                key={key}
                columnKey={key}
                title={COLUMNS[key].title}
                links={COLUMNS[key].links}
                isOpen={openColumn === key}
                onToggle={() => toggle(key)}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP (>= md): grid 4 colunas inalterado */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <BrandBlock />

          <FooterColumn title={COLUMNS.produto.title}>
            {COLUMNS.produto.links.map((link) => (
              <FooterLink key={link.href} href={link.href} external={link.external}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={COLUMNS.roadmap.title}>
            {COLUMNS.roadmap.links.map((link) => (
              <FooterLink key={link.href} href={link.href} external={link.external}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={COLUMNS.legal.title}>
            {COLUMNS.legal.links.map((link) => (
              <FooterLink key={link.href} href={link.href} external={link.external}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        {/* Bottom bar (sempre visivel) */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            borderTop: "1px solid var(--surface-high)",
          }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            © {year} ConvertaFlow. Todos os direitos reservados.
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span style={{ color: "var(--brand-primary)" }}>●</span> Roadmap
            público — versão <span className="font-mono">0.7.5</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function BrandBlock() {
  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-2 mb-3">
        <Image src="/icon.svg" alt="ConvertaFlow" width={28} height={28} />
        <span
          className="text-[16px] font-extrabold"
          style={{
            color: "var(--brand-navy)",
            letterSpacing: "-0.02em",
          }}
        >
          ConvertaFlow
        </span>
      </Link>
      <p
        className="text-[13px] leading-relaxed mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Plataforma omnichannel + IA para atendimento e conversão pelo WhatsApp,
        Instagram e Facebook.
      </p>
      <p
        className="text-[11px] uppercase font-semibold"
        style={{
          color: "var(--text-muted)",
          letterSpacing: "0.07em",
        }}
      >
        Made in Brasil 🇧🇷
      </p>
    </div>
  );
}

function FooterAccordion({
  columnKey,
  title,
  links,
  isOpen,
  onToggle,
}: {
  columnKey: ColumnKey;
  title: string;
  links: ColumnLink[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reactId = useId();
  const panelId = `footer-accordion-${columnKey}-${reactId}`;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--surface-high)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 px-2 py-3 rounded-[7px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors"
        style={{
          color: "var(--text-primary)",
        }}
      >
        <span className="text-[13px] font-semibold">{title}</span>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200 ease-out"
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-hidden={!isOpen}
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{
          maxHeight: isOpen ? `${links.length * 40 + 16}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <ul className="flex flex-col gap-2 px-2 pb-4 pt-1">
          {links.map((link) => (
            <FooterLink
              key={link.href}
              href={link.href}
              external={link.external}
            >
              {link.label}
            </FooterLink>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className="text-[13px] font-semibold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "text-[13px] transition-colors hover:underline underline-offset-2";
  const style = { color: "var(--text-secondary)" };

  if (external) {
    return (
      <li>
        <a
          href={href}
          className={className}
          style={style}
          target="_blank"
          rel="noopener"
        >
          {children}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    </li>
  );
}
