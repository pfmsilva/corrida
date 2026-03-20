"use client";
// ProgressChart — interactive area chart for the dashboard.
// The user can toggle between Distance (km) and Pace (min/km) views.
// Built with Recharts: AreaChart gives a nicer filled look than a plain line.

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatPace } from "@/lib/utils";
import type { Run } from "@/types";

interface ProgressChartProps {
  runs: Run[];
}

// Which metric is currently shown
type Metric = "distance" | "pace";

export default function ProgressChart({ runs }: ProgressChartProps) {
  const [metric, setMetric] = useState<Metric>("distance");

  // Sort oldest → newest for the X axis to read left-to-right chronologically
  const data = [...runs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((run) => ({
      date: new Date(`${run.date}T00:00`).toLocaleDateString("pt-PT", {
        month: "short",
        day: "numeric",
      }),
      distance: Number(run.distance_km),
      pace: Number(run.pace_min_per_km),
    }));

  // Visual config changes depending on the selected metric
  const config = {
    distance: {
      dataKey: "distance",
      color: "#6366f1",   // indigo
      gradientId: "gradDist",
      unit: " km",
      label: "Distance",
    },
    pace: {
      dataKey: "pace",
      color: "#f97316",   // orange
      gradientId: "gradPace",
      unit: " min/km",
      label: "Pace",
    },
  }[metric];

  // Custom tooltip — shows a nicely formatted value
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-gray-600 mb-1">{label}</p>
        <p className="font-bold" style={{ color: config.color }}>
          {metric === "pace" ? formatPace(val) : `${val} km`}
        </p>
      </div>
    );
  };

  // For pace, a lower value is better — we invert the Y domain so the chart
  // goes "up" when the runner is getting faster (lower pace).
  const yDomain: [string | number, string | number] =
    metric === "pace" ? ["dataMax + 0.5", "dataMin - 0.5"] : ["auto", "auto"];

  return (
    <div>
      {/* Metric toggle */}
      <div className="flex gap-2 mb-4">
        {(["distance", "pace"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              metric === m
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {m === "distance" ? "📏 Distância" : "⚡ Ritmo"}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          {/* SVG gradient fill definition */}
          <defs>
            <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            // For pace, format ticks as "Xm"; for distance, append "km"
            tickFormatter={(v) =>
              metric === "pace" ? `${Math.floor(v)}m` : `${v}km`
            }
            width={44}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            strokeWidth={2.5}
            fill={`url(#${config.gradientId})`}
            dot={{ r: 4, fill: config.color, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
