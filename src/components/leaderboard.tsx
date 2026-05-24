import { Trophy } from "lucide-react";
import { MOCK_LEADERBOARD } from "@/lib/mock-data";

const MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

/**
 * Sidebar "Classificacao" — top voters.
 * Inspirado em [[01 - ZDG (Upvoty white-label)]] / [[04 - Upvoty]].
 * Gamificacao leve: top 3 com medalhas, demais com numero.
 *
 * Por enquanto consome MOCK_LEADERBOARD. Quando backend chegar,
 * vira fetch de GET /api/v1/roadmap/leaderboard.
 */
export function Leaderboard() {
  return (
    <div
      className="rounded-[10px] p-4"
      style={{
        background: "var(--surface-card)",
        border: "1.5px solid var(--border-primary)",
      }}
    >
      <h2
        className="flex items-center gap-2 text-[13px] font-semibold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        <Trophy
          className="h-4 w-4"
          style={{ color: "var(--brand-cta)" }}
        />
        Classificação
      </h2>

      <ul className="flex flex-col gap-1.5">
        {MOCK_LEADERBOARD.map((u) => (
          <li
            key={u.rank}
            className="flex items-center gap-2.5 text-[13px]"
          >
            <span
              className="flex items-center justify-center text-[14px] flex-shrink-0"
              style={{ width: "20px" }}
            >
              {MEDALS[u.rank] ?? (
                <span style={{ color: "var(--text-muted)" }}>{u.rank}</span>
              )}
            </span>
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
              style={{
                background: "var(--surface-low)",
                color: "var(--text-secondary)",
              }}
            >
              {u.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <span
              className="flex-1 truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {u.name}
            </span>
            <span
              className="text-[12px] tabular-nums flex items-center gap-0.5"
              style={{ color: "var(--brand-cta)" }}
            >
              ⭐ {u.score}
            </span>
          </li>
        ))}
      </ul>

      <p
        className="text-[11px] mt-3 pt-3 border-t"
        style={{
          color: "var(--text-muted)",
          borderColor: "var(--border-secondary)",
        }}
      >
        Empresas que constroem o ConvertaFlow com a gente.
      </p>
    </div>
  );
}
