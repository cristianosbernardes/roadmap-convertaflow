import Image from "next/image";
import Link from "next/link";

/**
 * Footer global do roadmap.convertaflow.com.
 *
 * Estrutura espelhada da LP (ADR-024): 4 colunas + bottom bar.
 *
 * Col 1: Logo + tagline + descricao curta
 * Col 2: Produto (app, docs, blog, changelog)
 * Col 3: Roadmap (publicacoes, kanban, sugerir, sobre)
 * Col 4: Legal (privacidade, termos)
 *
 * Detalhes em [[Tokens Herdados do App e LP]] no Obsidian.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: "#faf8ff",
        borderTop: "1px solid var(--surface-high)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Grid 4 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: marca */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <Image
                src="/icon.svg"
                alt="ConvertaFlow"
                width={28}
                height={28}
              />
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
              Plataforma omnichannel + IA para atendimento e conversão pelo
              WhatsApp, Instagram e Facebook.
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

          {/* Col 2: Produto */}
          <FooterColumn title="Produto">
            <FooterLink href="https://app.convertaflow.com" external>
              Acessar app
            </FooterLink>
            <FooterLink href="https://convertaflow.com" external>
              Site oficial
            </FooterLink>
            <FooterLink href="https://convertaflow.com/docs" external>
              Central de ajuda
            </FooterLink>
            <FooterLink href="https://convertaflow.com#pricing" external>
              Planos
            </FooterLink>
          </FooterColumn>

          {/* Col 3: Roadmap */}
          <FooterColumn title="Roadmap">
            <FooterLink href="/">Todas as publicações</FooterLink>
            <FooterLink href="/roadmap">Visão em colunas</FooterLink>
            <FooterLink href="/changelog">Changelog</FooterLink>
            <FooterLink href="/sobre">Sobre este roadmap</FooterLink>
          </FooterColumn>

          {/* Col 4: Legal */}
          <FooterColumn title="Legal">
            <FooterLink
              href="https://convertaflow.com/privacy-policy"
              external
            >
              Política de privacidade
            </FooterLink>
            <FooterLink
              href="https://convertaflow.com/terms-of-service"
              external
            >
              Termos de serviço
            </FooterLink>
            <FooterLink
              href="https://convertaflow.com/terms-of-use"
              external
            >
              Termos de uso
            </FooterLink>
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            borderTop: "1px solid var(--surface-high)",
          }}
        >
          <p
            className="text-[12px]"
            style={{ color: "var(--text-muted)" }}
          >
            © {year} ConvertaFlow. Todos os direitos reservados.
          </p>
          <p
            className="text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span style={{ color: "var(--brand-primary)" }}>●</span> Roadmap
            público — versão{" "}
            <span className="font-mono">0.4.0-lp-layout</span>
          </p>
        </div>
      </div>
    </footer>
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
