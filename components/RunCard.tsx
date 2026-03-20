import { formatDate, formatDuration, formatPace } from "@/lib/utils";
import type { Run } from "@/types";

interface RunCardProps {
  run: Run;
  onDelete: (id: string) => void;
}

export default function RunCard({ run, onDelete }: RunCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md
                    hover:border-brand-100 transition-all duration-200 overflow-hidden group">
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand-500 to-indigo-400" />

      <div className="p-5">
        {/* Header: date + delete */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-brand-600 bg-brand-50
                           rounded-full px-3 py-1 border border-brand-100">
            {formatDate(run.date)}
          </span>
          <button
            onClick={() => onDelete(run.id)}
            aria-label="Eliminar corrida"
            className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50
                       flex items-center justify-center text-sm transition-all duration-200
                       opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Distância" value={`${run.distance_km} km`} />
          <Metric label="Duração"   value={formatDuration(run.duration_min)} />
          <Metric label="Ritmo"     value={formatPace(run.pace_min_per_km)} accent />
        </div>

        {/* Notes */}
        {run.notes && (
          <p className="mt-4 text-sm text-gray-400 border-t border-gray-50 pt-3 line-clamp-2 italic">
            "{run.notes}"
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${accent ? "bg-orange-50" : "bg-gray-50"}`}>
      <p className={`text-base font-black leading-tight ${accent ? "text-accent-500" : "text-gray-800"}`}>
        {value}
      </p>
      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}
