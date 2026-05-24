import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SoftwareApplicationLd } from "@/components/json-ld";
import { SearchProvider } from "@/components/search-provider";
import { SearchCommand } from "@/components/search-command";
import "./globals.css";

// Fonte canonica do ecossistema ConvertaFlow (app + LP + roadmap).
// Expomos como --font-geist-sans pra manter sync com o globals.css
// copiado do app principal (legado historico do nome da variavel).
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Roadmap ConvertaFlow — O que estamos construindo",
    template: "%s — Roadmap ConvertaFlow",
  },
  description:
    "Roadmap público da ConvertaFlow — veja, vote e comente as features que estamos construindo. Plataforma omnichannel de atendimento com IA.",
  applicationName: "Roadmap ConvertaFlow",
  authors: [{ name: "ConvertaFlow", url: "https://convertaflow.com" }],
  keywords: [
    "ConvertaFlow",
    "roadmap",
    "WhatsApp",
    "Atendimento omnichannel",
    "IA",
    "Automação",
    "Plataforma SaaS",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://roadmap.convertaflow.com",
    siteName: "Roadmap ConvertaFlow",
    title: "Roadmap ConvertaFlow",
    description:
      "Veja o que estamos construindo. Vote nas features que mais importam pra você.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roadmap ConvertaFlow",
    description:
      "Veja o que estamos construindo. Vote nas features que mais importam pra você.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" suppressHydrationWarning>
        <head>
          <SoftwareApplicationLd />
        </head>
        <body className={`${inter.variable} antialiased`}>
          {/* Skip-to-content link (S-C-07 / Auditoria UX-UI v2 E.1).
              Visualmente escondido (sr-only) ate receber foco via Tab.
              No foco, aparece flutuando top-left com alto contraste,
              permitindo que usuarios de teclado/screen reader pulem o
              header inteiro e cheguem direto ao <main id="main-content">. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-[10px] focus:bg-[var(--brand-primary)] focus:text-white focus:text-[14px] focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2"
          >
            Pular para o conteúdo
          </a>
          {/* NuqsAdapter habilita useQueryState/useQueryStates em todo cliente.
              Necessario pra <SortControl /> e qualquer URL-state futuro. */}
          <NuqsAdapter>
            {/* TooltipProvider habilita <Tooltip> em qualquer descendente
                (vote button, share, etc). delayDuration=200ms para feedback
                rapido sem ser intrusivo (S-D-01 / refinamento ADR-034). */}
            <TooltipProvider delayDuration={200}>
              {/* SearchProvider expoe useSearch() pra qualquer botao abrir
                  o modal Cmd+K. SearchCommand vive aqui pra ser unico em toda
                  arvore (evita duplicidade de listeners de teclado). */}
              <SearchProvider>
                {children}
                <SearchCommand />
                <Toaster position="bottom-right" richColors />
              </SearchProvider>
            </TooltipProvider>
          </NuqsAdapter>
        </body>
      </html>
    </ClerkProvider>
  );
}
