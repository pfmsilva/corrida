import { formatPace } from "@/lib/utils";
import type { Run } from "@/types";

interface StatsBarProps { runs: Run[]; }

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  gradient?: boolean;
}

function StatCard({ icon, label, value, sub, gradient }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-2 ${
      gradient
        ? "bg-gradient-to-br from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20"
        : "bg-white border border-gray-100 shadow-sm"
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
        gradient ? "bg-white/20" : "bg-gray-50"
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-xl font-black leading-none ${gradient ? "text-white" : "text-gray-900"}`}>
          {value}
          {sub && (
            <span className={`text-xs font-medium ml-1 ${gradient ? "text-white/70" : "text-gray-400"}`}>
              {sub}
            </span>
          )}
        </p>
        <p className={`text-xs font-medium mt-1 ${gradient ? "text-white/70" : "text-gray-500"}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function StatsBar({ runs }: StatsBarProps) {
  const totalRuns = runs.length;
  const totalKm   = runs.reduce((s, r) => s + Number(r.distance_km), 0);
  const avgPace   = runs.length > 0
    ? runs.reduce((s, r) => s + Number(r.pace_min_per_km), 0) / runs.length
    : null;
  const longestRun = runs.length > 0
    ? Math.max(...runs.map((r) => Number(r.distance_km))) : null;
  const bestPace  = runs.length > 0
    ? Math.min(...runs.map((r) => Number(r.pace_min_per_km))) : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard icon="🏃" label="Total de corridas" value={String(totalRuns)} gradient />
      <StatCard icon="📏" label="Distância total"   value={totalKm.toFixed(1)} sub="km" />
      <StatCard icon="⏱️" label="Ritmo médio"       value={avgPace !== null ? formatPace(avgPace) : "—"} />
      <StatCard icon="🚀" label="Melhor ritmo"      value={bestPace !== null ? formatPace(bestPace) : "—"} />
      <StatCard icon="🏅" label="Corrida mais longa"
        value={longestRun !== null ? longestRun.toFixed(1) : "—"}
        sub={longestRun !== null ? "km" : undefined} />
    </div>
  );
}
