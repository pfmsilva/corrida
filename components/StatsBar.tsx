// StatsBar — shows aggregate numbers (total runs, km, avg pace) at a glance.
// It's a pure presentational Server-compatible component (no client hooks needed).
import { formatPace } from "@/lib/utils";
import type { Run } from "@/types";

interface StatsBarProps {
  runs: Run[];
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

// A single stat "tile"
function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="card flex-1 text-center">
      <p className="text-2xl font-bold text-brand-600">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function StatsBar({ runs }: StatsBarProps) {
  // Aggregate calculations
  const totalRuns = runs.length;
  const totalKm = runs.reduce((sum, r) => sum + r.distance_km, 0);
  const avgPace =
    runs.length > 0
      ? runs.reduce((sum, r) => sum + r.pace_min_per_km, 0) / runs.length
      : null;

  return (
    <div className="flex gap-3">
      <StatCard label="Total runs" value={String(totalRuns)} />
      <StatCard
        label="Total distance"
        value={`${totalKm.toFixed(1)}`}
        sub="km"
      />
      <StatCard
        label="Avg pace"
        value={avgPace !== null ? formatPace(avgPace) : "—"}
      />
    </div>
  );
}
