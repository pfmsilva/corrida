// StatsBar — shows key aggregate metrics at the top of the dashboard.
// Five cards arranged in a responsive 2-column → 3-column → 5-column grid.
import { formatPace } from "@/lib/utils";
import type { Run } from "@/types";

interface StatsBarProps {
  runs: Run[];
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean; // highlights the card when true
}

// Single metric tile
function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={`card flex flex-col items-center text-center gap-1 py-4
        ${accent ? "border-brand-200 bg-brand-50" : ""}`}
    >
      <span className="text-xl">{icon}</span>
      <p
        className={`text-xl font-bold leading-tight ${
          accent ? "text-brand-600" : "text-gray-800"
        }`}
      >
        {value}
        {sub && (
          <span className="text-xs font-normal text-gray-400 ml-1">{sub}</span>
        )}
      </p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

export default function StatsBar({ runs }: StatsBarProps) {
  // ── Aggregate calculations ────────────────────────────────────────────────
  const totalRuns = runs.length;

  const totalKm = runs.reduce((sum, r) => sum + Number(r.distance_km), 0);

  // Average pace across all runs (weighted by run, not distance)
  const avgPace =
    runs.length > 0
      ? runs.reduce((sum, r) => sum + Number(r.pace_min_per_km), 0) / runs.length
      : null;

  // Longest single run by distance
  const longestRun =
    runs.length > 0 ? Math.max(...runs.map((r) => Number(r.distance_km))) : null;

  // Best (fastest) pace — lowest min/km value
  const bestPace =
    runs.length > 0
      ? Math.min(...runs.map((r) => Number(r.pace_min_per_km)))
      : null;

  return (
    // Responsive grid: 2 cols on mobile, 3 on sm, 5 on lg
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        icon="🏃"
        label="Total de corridas"
        value={String(totalRuns)}
        accent
      />
      <StatCard
        icon="📏"
        label="Distância total"
        value={totalKm.toFixed(1)}
        sub="km"
      />
      <StatCard
        icon="⏱️"
        label="Ritmo médio"
        value={avgPace !== null ? formatPace(avgPace) : "—"}
      />
      <StatCard
        icon="🚀"
        label="Melhor ritmo"
        value={bestPace !== null ? formatPace(bestPace) : "—"}
      />
      <StatCard
        icon="🏅"
        label="Corrida mais longa"
        value={longestRun !== null ? longestRun.toFixed(1) : "—"}
        sub={longestRun !== null ? "km" : undefined}
      />
    </div>
  );
}
