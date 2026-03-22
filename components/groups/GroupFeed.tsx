"use client";

import { useRouter } from "next/navigation";
import { formatDate, formatPace, formatDuration } from "@/lib/utils";
import type { FeedRun } from "@/types";

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${accent ? "bg-orange-50" : "bg-gray-50"}`}>
      <p className={`text-sm font-black leading-tight ${accent ? "text-accent-500" : "text-gray-800"}`}>
        {value}
      </p>
      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}

export default function GroupFeed({ initialRuns }: { initialRuns: FeedRun[] }) {
  const router = useRouter();

  if (initialRuns.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-14 text-center">
        <p className="text-4xl mb-3">👟</p>
        <p className="font-semibold text-gray-700">Ainda sem corridas no desafio</p>
        <p className="text-sm text-gray-400 mt-1">Regista uma corrida para aparecer aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => router.refresh()}
          className="text-xs text-gray-400 hover:text-brand-600 transition-colors
                     flex items-center gap-1 font-medium"
        >
          <span>↻</span> Atualizar feed
        </button>
      </div>

      {initialRuns.map((run) => (
        <div key={run.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm
                     hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-brand-500 to-indigo-400" />
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500
                                to-indigo-500 flex items-center justify-center
                                text-white text-xs font-bold shrink-0">
                  {run.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-900">{run.display_name}</span>
              </div>
              <span className="text-xs text-gray-400">{formatDate(run.date)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric label="Distância" value={`${run.distance_km} km`} />
              <Metric label="Duração" value={formatDuration(run.duration_min)} />
              <Metric label="Ritmo" value={formatPace(run.pace_min_per_km)} accent />
            </div>

            {run.notes && (
              <p className="text-sm text-gray-400 italic border-t border-gray-50 pt-2.5 line-clamp-2">
                "{run.notes}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
