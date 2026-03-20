"use client";
// ProgressChart — a line chart showing distance per run over time.
// Built with Recharts, which is a React wrapper around D3.
// We show two lines: distance and pace, each on its own Y-axis.

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatPace } from "@/lib/utils";
import type { Run } from "@/types";

interface ProgressChartProps {
  runs: Run[];
}

export default function ProgressChart({ runs }: ProgressChartProps) {
  // Chart data needs to be ordered oldest → newest
  const data = [...runs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((run) => ({
      // Short date label for the X axis
      date: new Date(`${run.date}T00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      distance: run.distance_km,
      pace: run.pace_min_per_km,
    }));

  // Custom tooltip so we can show a formatted pace string
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-md p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name === "pace"
              ? `Pace: ${formatPace(entry.value)}`
              : `Distance: ${entry.value} km`}
          </p>
        ))}
      </div>
    );
  };

  return (
    // ResponsiveContainer fills whatever width its parent gives it
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* X axis: run dates */}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />

        {/* Left Y axis: distance in km */}
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          unit=" km"
          width={48}
        />

        {/* Right Y axis: pace in min/km (inverted — lower is better) */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${Math.floor(v)}m`}
          width={36}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />

        {/* Distance line — indigo */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="distance"
          name="distance"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 4, fill: "#6366f1" }}
          activeDot={{ r: 6 }}
        />

        {/* Pace line — orange */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="pace"
          name="pace"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ r: 4, fill: "#f97316" }}
          activeDot={{ r: 6 }}
          strokeDasharray="5 3"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
