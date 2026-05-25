import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Feature } from "@/types/roadmap";
import { CategoryIcon } from "@/components/category-icon";
import { StatusBadge } from "@/components/status-badge";
import { SubscribeButton } from "@/components/subscribe-button";
import { CATEGORIES } from "@/lib/constants";

/**
 * Side panel direito da pagina de feature individual.
 * Inspirado [[01 - ZDG (Upvoty white-label)]] §7 — Autor / Criado / Categoria / Estado / Votantes.
 */
export function FeatureSidePanel({ feature }: { feature: Feature }) {
  const category = CATEGORIES[feature.category];
  const createdAt = formatDistanceToNow(new Date(feature.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  // Mock: gera 12 iniciais aleatorias pra grid de votantes
  const mockVoterInitials = generateMockVoterInitials(
    Math.min(feature.voteCount, 12)
  );

  return (
    <div className="flex flex-col gap-4 w-full lg:w-[280px] flex-shrink-0">
      {/* CTA "Receber atualizações" (S-D-15) — topo da sidebar pra primazia
          visual; ação primária de captação antes dos metadados.
          Mock-only no momento (localStorage); Sprint 3 vai pra
          POST /api/v1/roadmap/me/subscriptions com double opt-in. */}
      <SubscribeButton featureSlug={feature.slug} />

      {/* Metadata card */}
      <div
        className="rounded-[10px] p-4 flex flex-col gap-3.5"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-primary)",
        }}
      >
        <SidePanelRow label="Autor">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-secondary)",
              }}
            >
              CB
            </div>
            <span
              className="text-[13px] truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {feature.createdByStaffSlug
                ? "Cristiano (Equipe)"
                : "Cliente ConvertaFlow"}
            </span>
          </div>
        </SidePanelRow>

        <SidePanelRow label="Criado">
          <span
            className="text-[13px]"
            style={{ color: "var(--text-primary)" }}
          >
            {createdAt}
          </span>
        </SidePanelRow>

        <SidePanelRow label="Categoria">
          <div className="flex items-center gap-2">
            <CategoryIcon category={feature.category} size="sm" />
            <span
              className="text-[13px] truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {category.label}
            </span>
          </div>
        </SidePanelRow>

        <SidePanelRow label="Estado">
          <StatusBadge status={feature.status} size="md" />
        </SidePanelRow>

        <SidePanelRow label={`Votantes (${feature.voteCount})`}>
          <div className="flex flex-wrap gap-1.5">
            {mockVoterInitials.map((initial, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
                style={{
                  background: "var(--surface-low)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-secondary)",
                }}
                title="Votante"
              >
                {initial}
              </div>
            ))}
            {feature.voteCount > 12 && (
              <div
                className="h-8 px-2 rounded-full flex items-center justify-center text-[11px] font-semibold"
                style={{
                  background: "var(--surface-low)",
                  color: "var(--text-muted)",
                }}
              >
                +{feature.voteCount - 12}
              </div>
            )}
          </div>
        </SidePanelRow>
      </div>

      {/* Motivo publico (se aplicavel) */}
      {feature.statusReason && (
        <div
          className="rounded-[10px] p-4 text-[13px]"
          style={{
            background:
              feature.status === "pausado"
                ? "var(--warning-bg)"
                : "var(--danger-bg)",
            border: `1.5px solid ${
              feature.status === "pausado"
                ? "var(--warning)"
                : "var(--danger)"
            }33`,
            color: "var(--text-primary)",
          }}
        >
          <p
            className="text-[11px] uppercase tracking-wider font-semibold mb-1"
            style={{
              color:
                feature.status === "pausado"
                  ? "var(--warning)"
                  : "var(--danger)",
            }}
          >
            Motivo público
          </p>
          {feature.statusReason}
        </div>
      )}
    </div>
  );
}

function SidePanelRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[11px] uppercase tracking-wider font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * Gera N iniciais "humanas" mockadas a partir de uma seed determinística
 * (usa o proprio count). Quando backend chegar, vira map dos avatares reais.
 */
function generateMockVoterInitials(count: number): string[] {
  const samples = [
    "AR",
    "MC",
    "RL",
    "JV",
    "AS",
    "PM",
    "FC",
    "BH",
    "LR",
    "NG",
    "VS",
    "DM",
    "TC",
    "EO",
    "GP",
  ];
  return samples.slice(0, count);
}
