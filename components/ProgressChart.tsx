"use client";

import { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { formatPace } from "@/lib/utils";
import type { Run } from "@/types";

type Metric = "distance" | "pace";

export default function ProgressChart({ runs }: { runs: Run[] }) {
  const [metric, setMetric] = useState<Metric>("distance");

  const data = [...runs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((run) => ({
      date: new Date(`${run.date}T00:00`).toLocaleDateString("pt-PT", {
        month: "short", day: "numeric",
      }),
      distance: Number(run.distance_km),
      pace: Number(run.pace_min_per_km),
    }));

  const config = {
    distance: { dataKey: "distance", color: "#4f46e5", gradientId: "gradDist",  unit: " km"     },
    pace:     { dataKey: "pace",     color: "#f97316", gradientId: "gradPace",  unit: " min/km" },
  }[metric];

  const CustomTooltip = ({
    active, payload, label,
  }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-medium text-gray-500 mb-1 text-xs">{label}</p>
        <p className="font-black text-base" style={{ color: config.color }}>
          {metric === "pace" ? formatPace(val) : `${val} km`}
        </p>
      </div>
    );
  };

  const yDomain: [string | number, string | number] =
    metric === "pace" ? ["dataMax + 0.5", "dataMin - 0.5"] : ["auto", "auto"];

  return (
    <div>
      {/* Toggle */}
      <div className="flex gap-2 mb-5">
        {(["distance", "pace"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              metric === m
                ? "bg-gradient-to-r from-brand-600 to-indigo-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {m === "distance" ? "📏 Distância" : "⚡ Ritmo"}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={config.color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false} axisLine={false} />
          <YAxis domain={yDomain} tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false} axisLine={false}
            tickFormatter={(v) => metric === "pace" ? `${Math.floor(v)}m` : `${v}km`}
            width={44} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey={config.dataKey}
            stroke={config.color} strokeWidth={2.5}
            fill={`url(#${config.gradientId})`}
            dot={{ r: 4, fill: config.color, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
