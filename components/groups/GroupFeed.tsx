"use client";
// GroupFeed — shows the most recent runs from all group members.
// Has a "Refresh" button that calls router.refresh() to re-fetch server data.

import { useRouter } from "next/navigation";
import { formatDate, formatPace, formatDuration } from "@/lib/utils";
import type { FeedRun } from "@/types";

interface GroupFeedProps {
  initialRuns: FeedRun[];
}

export default function GroupFeed({ initialRuns }: GroupFeedProps) {
  const router = useRouter();

  if (initialRuns.length === 0) {
    return (
      <div className="card text-center py-10 text-gray-400">
        <p className="text-3xl mb-2">👟</p>
        <p className="text-sm">Ainda não há corridas registadas neste grupo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Refresh button — re-runs the server component fetch */}
      <div className="flex justify-end">
        <button
          onClick={() => router.refresh()}
          className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
        >
          ↻ Atualizar feed
        </button>
      </div>

      {initialRuns.map((run) => (
        <div key={run.id} className="card space-y-3">
          {/* Header: member badge + date */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white bg-brand-600 rounded-full px-3 py-1">
              {run.display_name}
            </span>
            <span className="text-xs text-gray-400">{formatDate(run.date)}</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Distância" value={`${run.distance_km} km`} />
            <Metric label="Duração" value={formatDuration(run.duration_min)} />
            <Metric
              label="Ritmo"
              value={formatPace(run.pace_min_per_km)}
              highlight
            />
          </div>

          {/* Notes */}
          {run.notes && (
            <p className="text-sm text-gray-500 border-t border-gray-50 pt-3 line-clamp-2">
              {run.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-base font-bold ${
          highlight ? "text-accent-500" : "text-gray-800"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
