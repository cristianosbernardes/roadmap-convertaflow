import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
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
          {/* NuqsAdapter habilita useQueryState/useQueryStates em todo cliente.
              Necessario pra <SortControl /> e qualquer URL-state futuro. */}
          <NuqsAdapter>
            {/* SearchProvider expoe useSearch() pra qualquer botao abrir
                o modal Cmd+K. SearchCommand vive aqui pra ser unico em toda
                arvore (evita duplicidade de listeners de teclado). */}
            <SearchProvider>
              {children}
              <SearchCommand />
              <Toaster position="bottom-right" richColors />
            </SearchProvider>
          </NuqsAdapter>
        </body>
      </html>
    </ClerkProvider>
  );
}
