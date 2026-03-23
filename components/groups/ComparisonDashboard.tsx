"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { buildDailyComparison } from "@/lib/gamification";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ["#6366f1", "#f97316", "#10b981"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RunRow {
  user_id: string;
  date: string;
  distance_km: number;
}

interface Props {
  memberIds: string[];
  profileMap: Record<string, string>;
  currentUserId: string;
  runs: RunRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ComparisonDashboard({
  memberIds,
  profileMap,
  currentUserId,
  runs,
}: Props) {
  // Default: first 3 members (or fewer if group is smaller)
  const [selected, setSelected] = useState<string[]>(memberIds.slice(0, 3));

  const colorOf = (uid: string): string => {
    const i = selected.indexOf(uid);
    return i >= 0 ? COLORS[i] : "#d1d5db";
  };

  const toggleUser = (uid: string) => {
    setSelected((prev) => {
      if (prev.includes(uid)) {
        return prev.length === 1 ? prev : prev.filter((id) => id !== uid);
      }
      return prev.length >= 3 ? prev : [...prev, uid];
    });
  };

  // Per-user totals (only within selected set)
  const userTotals = useMemo<Record<string, number>>(() => {
    const totals: Record<string, number> = Object.fromEntries(
      selected.map((uid) => [uid, 0])
    );
    for (const r of runs) {
      if (r.user_id in totals) totals[r.user_id] = (totals[r.user_id] ?? 0) + Number(r.distance_km);
    }
    return totals;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, selected]);

  const groupTotal = Object.values(userTotals).reduce((s, v) => s + v, 0);

  const chartData = useMemo(
    () => buildDailyComparison(selected, runs),
    [selected, runs]
  );

  // Sort selected users by total desc for the stats table
  const selectedSorted = [...selected].sort(
    (a, b) => (userTotals[b] ?? 0) - (userTotals[a] ?? 0)
  );

  return (
    <div className="space-y-6">

      {/* ── Member selector ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Selecionar membros{" "}
          <span className="text-gray-400 font-normal">(máx. 3)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {memberIds.map((uid) => {
            const isSelected = selected.includes(uid);
            const canToggle = isSelected || selected.length < 3;
            const color = isSelected ? colorOf(uid) : undefined;
            return (
              <button
                key={uid}
                onClick={() => toggleUser(uid)}
                disabled={!canToggle}
                title={isSelected ? "Remover da comparação" : "Adicionar à comparação"}
                className={[
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold",
                  "border-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
                  isSelected
                    ? "text-white"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                ].join(" ")}
                style={isSelected ? { backgroundColor: color, borderColor: color } : {}}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center
                               text-[10px] font-bold shrink-0"
                  style={isSelected ? { background: "rgba(255,255,255,0.25)" } : { background: "#e5e7eb" }}
                >
                  {profileMap[uid]?.charAt(0).toUpperCase()}
                </span>
                {profileMap[uid]}
                {uid === currentUserId && (
                  <span className="opacity-70 text-xs">(tu)</span>
                )}
              </button>
            );
          })}
        </div>
        {memberIds.length < 2 && (
          <p className="text-xs text-gray-400 mt-3">
            É necessário pelo menos 2 membros para comparar.
          </p>
        )}
      </div>

      {/* ── Line chart ──────────────────────────────────────────────────── */}
      {chartData.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Distância por dia (km)
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Distância total registada por cada membro em cada dia.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                unit=" km"
                width={52}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${Number(value).toFixed(1)} km`,
                  profileMap[name] ?? name,
                ]}
                labelFormatter={(label: string) => formatDate(label)}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                  fontSize: "12px",
                }}
              />
              <Legend
                formatter={(value) => profileMap[value] ?? value}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
              {selected.map((uid, i) => (
                <Line
                  key={uid}
                  type="monotone"
                  dataKey={uid}
                  name={uid}
                  stroke={COLORS[i]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-gray-700">Sem corridas para comparar</p>
          <p className="text-sm text-gray-400 mt-1">
            Os membros selecionados ainda não registaram corridas.
          </p>
        </div>
      )}

      {/* ── Stats table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-800">
            Estatísticas comparativas
          </p>
        </div>

        <div className="divide-y divide-gray-50">
          {selectedSorted.map((uid) => {
            const km = userTotals[uid] ?? 0;
            const pct = groupTotal > 0 ? (km / groupTotal) * 100 : 0;
            const runCount = runs.filter((r) => r.user_id === uid).length;
            const color = colorOf(uid);

            return (
              <div key={uid} className="flex items-center gap-4 px-5 py-3.5">
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profileMap[uid]}
                    {uid === currentUserId && (
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">
                        (tu)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {runCount} corrida{runCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-24 shrink-0 hidden sm:block">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>

                {/* Distance + percentage */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-gray-900">
                    {km.toFixed(1)} km
                  </p>
                  <p className="text-xs text-gray-400">
                    {pct.toFixed(1)}% do total
                  </p>
                </div>
              </div>
            );
          })}

          {/* Total row */}
          {groupTotal > 0 && (
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total selecionados
              </p>
              <p className="text-sm font-black text-gray-800">
                {groupTotal.toFixed(1)} km
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
