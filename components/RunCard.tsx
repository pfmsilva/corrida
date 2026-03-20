// RunCard — displays a single run in the list.
// Shows date, distance, duration, pace, and an optional notes excerpt.
import { formatDate, formatDuration, formatPace } from "@/lib/utils";
import type { Run } from "@/types";

interface RunCardProps {
  run: Run;
  onDelete: (id: string) => void;
}

export default function RunCard({ run, onDelete }: RunCardProps) {
  return (
    <div className="card flex flex-col gap-3">
      {/* Header row: date + delete button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-600 bg-brand-50 rounded-full px-3 py-1">
          {formatDate(run.date)}
        </span>
        <button
          onClick={() => onDelete(run.id)}
          aria-label="Delete run"
          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric label="Distance" value={`${run.distance_km} km`} />
        <Metric label="Duration" value={formatDuration(run.duration_min)} />
        <Metric label="Pace" value={formatPace(run.pace_min_per_km)} highlight />
      </div>

      {/* Optional notes */}
      {run.notes && (
        <p className="text-sm text-gray-500 border-t border-gray-50 pt-3 line-clamp-2">
          {run.notes}
        </p>
      )}
    </div>
  );
}

// Small helper for each metric cell
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
