import { ImageResponse } from "next/og";
import { getMockFeatureBySlug } from "@/lib/mock-data";
import { STATUSES, CATEGORIES } from "@/lib/constants";

/**
 * OG image dinamica pra cada feature.
 * Mostra: titulo + status + voteCount + brand.
 *
 * Quando compartilhar link no WhatsApp/Twitter/LinkedIn, aparece preview
 * personalizado. Vercel OG renderiza via @vercel/og (Edge runtime).
 *
 * PRD §4.2 + Sprint A.6.
 */

export const runtime = "edge";
export const alt = "Roadmap ConvertaFlow";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const STATUS_COLORS: Record<string, string> = {
  sob_analise: "#6b7280",
  planejado: "#0284c7",
  em_desenvolvimento: "#ea580c",
  beta_privado: "#9333ea",
  concluido: "#16a34a",
  pausado: "#ca8a04",
  nao_sera_feito: "#dc2626",
};

export default async function Image({ params }: { params: { slug: string } }) {
  const feature = getMockFeatureBySlug(params.slug);

  // Fallback se feature nao encontrada
  if (!feature) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1e7fd4 0%, #1a3a6e 100%)",
            color: "#ffffff",
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Roadmap ConvertaFlow
        </div>
      ),
      { ...size }
    );
  }

  const status = STATUSES[feature.status];
  const category = CATEGORIES[feature.category];
  const statusColor = STATUS_COLORS[feature.status] ?? "#6b7280";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#faf8ff",
          padding: 60,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top bar: logo + status badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                background:
                  "linear-gradient(150deg, #1e7fd4 0%, #1a3a6e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              C
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0d1b3e",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                ConvertaFlow
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#727782",
                  letterSpacing: "0.1em",
                  marginTop: 4,
                  textTransform: "uppercase",
                }}
              >
                Roadmap
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 9999,
              background: `${statusColor}15`,
              border: `1.5px solid ${statusColor}40`,
              color: statusColor,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 20 }}>{status.emoji}</span>
            {status.label}
          </div>
        </div>

        {/* Main: categoria + titulo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: 40,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: category.color,
              marginBottom: 16,
            }}
          >
            {category.label}
          </span>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#02174a",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: 0,
              maxWidth: 1000,
            }}
          >
            {feature.title.length > 90
              ? feature.title.slice(0, 87) + "..."
              : feature.title}
          </h1>
        </div>

        {/* Footer: vote count + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1.5px solid #d1d5db",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 24px",
              borderRadius: 10,
              background: "#ffffff",
              border: "1.5px solid #d1d5db",
            }}
          >
            <span style={{ fontSize: 22, color: "#1e7fd4" }}>▲</span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#02174a",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {feature.voteCount.toLocaleString("pt-BR")}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#727782",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              votos
            </span>
          </div>

          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#727782",
            }}
          >
            roadmap.convertaflow.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
