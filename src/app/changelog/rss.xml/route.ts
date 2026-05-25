import { NextResponse } from "next/server";
import { MOCK_CHANGELOG, type MockChangelogEntry } from "@/lib/mock-data";

/**
 * /changelog/rss.xml — RSS 2.0 feed do changelog publico.
 *
 * Sprint D — item S-D-10. Inscricao em atualizacoes via leitor RSS
 * (Feedly, Inoreader, NetNewsWire etc) sem precisar de email.
 *
 * Versao mock (ADR-016). Quando backend chegar (Sprint 3), substituir
 * pela leitura de GET /api/v1/roadmap/changelog ordenado por publishedAt
 * desc + cache 1h (Cache-Control + Next revalidate).
 *
 * Validacao: parser RSS 2.0 + atom:link self-reference + escape XML
 * defensivo. Pubdate em RFC822 (formato esperado por todos os
 * leitores).
 */

export const dynamic = "force-static";
export const revalidate = 3600; // 1h — sincroniza com Cache-Control

const SITE_URL = "https://roadmap.convertaflow.com";
const FEED_URL = `${SITE_URL}/changelog/rss.xml`;
const CHANNEL_TITLE = "Changelog — Roadmap ConvertaFlow";
const CHANNEL_DESCRIPTION =
  "Releases recentes da plataforma ConvertaFlow. Atualizado a cada nova entrega.";

/**
 * Escapa caracteres especiais XML em texto livre (titulos, descricoes).
 * Cobre &, <, >, ", ' conforme XML 1.0 spec.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Envolve conteudo em CDATA — usado para `description` que carrega HTML
 * (markdown convertido). CDATA evita necessidade de escape duplo.
 * Se o conteudo contiver `]]>` literal, quebramos em dois blocos CDATA.
 */
function wrapCdata(value: string): string {
  const safe = value.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

/**
 * Converte markdown simples (cabecalhos, listas, bold, italico, links)
 * em HTML basico. Suficiente pra preview em leitores RSS sem importar
 * remark (que e client-side e adiciona ~200KB ao bundle do server).
 *
 * Limitacoes conhecidas: nao processa codigo, tabelas, imagens. Leitores
 * RSS geralmente toleram markdown bruto, entao quando algo nao for
 * convertido, o leitor mostra o texto raw — aceitavel.
 */
function markdownToBasicHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Cabecalhos
    if (line.startsWith("### ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h3>${escapeXml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h2>${escapeXml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h1>${escapeXml(line.slice(2))}</h1>`);
      continue;
    }

    // Listas
    if (line.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
      continue;
    }

    // Linha vazia fecha lista
    if (line === "") {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Paragrafo
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
    out.push(`<p>${inlineFormat(line)}</p>`);
  }

  if (inList) {
    out.push("</ul>");
  }

  return out.join("\n");
}

/**
 * Formatacao inline: bold (**x**), italico (*x*), links [texto](url).
 * Aplicado depois do escape XML do conteudo bruto.
 */
function inlineFormat(text: string): string {
  let result = escapeXml(text);
  // Links: [texto](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>'
  );
  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italico (depois de bold pra nao quebrar **x**)
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return result;
}

/**
 * Formata data ISO em RFC822 — formato exigido por RSS 2.0.
 * Exemplo: "Sat, 24 May 2026 12:00:00 GMT".
 *
 * Forca locale en-US pra meses/dias abreviados em ingles (RFC822 nao
 * permite localizacao).
 */
function toRfc822(isoDate: string): string {
  const date = new Date(isoDate);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[date.getUTCDay()];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

/**
 * Renderiza um <item> RSS pra cada release. Inclui:
 *   - guid permalink (URL ancorada no /changelog#release-{id})
 *   - title escapado
 *   - description em CDATA com HTML basico (markdown convertido)
 *   - pubDate RFC822
 *   - link permalink
 *   - category (versao da release, ex: "v1.8.0")
 */
function renderItem(entry: MockChangelogEntry): string {
  const permalink = `${SITE_URL}/changelog#release-${entry.id}`;
  const htmlBody = markdownToBasicHtml(entry.bodyMarkdown);
  const titleWithVersion = entry.releaseVersion
    ? `${entry.releaseVersion} — ${entry.title}`
    : entry.title;

  return `    <item>
      <guid isPermaLink="true">${escapeXml(permalink)}</guid>
      <title>${escapeXml(titleWithVersion)}</title>
      <link>${escapeXml(permalink)}</link>
      <description>${wrapCdata(htmlBody)}</description>
      <pubDate>${toRfc822(entry.releaseDate)}</pubDate>
      ${
        entry.releaseVersion
          ? `<category>${escapeXml(entry.releaseVersion)}</category>`
          : ""
      }
    </item>`;
}

export async function GET() {
  // Ordena por data desc (mais recente primeiro) — RSS convention.
  const sorted = [...MOCK_CHANGELOG].sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

  const lastBuildDate =
    sorted.length > 0 ? toRfc822(sorted[0].releaseDate) : toRfc822(new Date().toISOString());

  const items = sorted.map(renderItem).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(CHANNEL_TITLE)}</title>
    <link>${escapeXml(`${SITE_URL}/changelog`)}</link>
    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(FEED_URL)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
