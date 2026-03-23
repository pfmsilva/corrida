import Link from "next/link";
import BadgeDisplay from "./BadgeDisplay";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  /** When provided, shows a "Comparar membros" footer link */
  groupId?: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_BG = [
  "bg-yellow-50 border-yellow-100",
  "bg-gray-50 border-gray-100",
  "bg-orange-50 border-orange-100",
];

export default function Leaderboard({ entries, currentUserId, groupId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
        <p className="text-4xl mb-3">🏁</p>
        <p className="font-semibold text-gray-700">Ainda sem corridas registadas</p>
        <p className="text-sm text-gray-400 mt-1">Sê o primeiro a correr!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isMe = entry.user_id === currentUserId;
        const isMedal = entry.rank <= 3;
        return (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3
                        transition-all duration-200 ${
              isMe
                ? "bg-brand-50 border-brand-100 shadow-sm"
                : isMedal
                  ? `${MEDAL_BG[entry.rank - 1]} shadow-sm`
                  : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center shrink-0">
              {isMedal ? (
                <span className="text-xl">{MEDALS[entry.rank - 1]}</span>
              ) : (
                <span className="text-sm font-bold text-gray-400">{entry.rank}</span>
              )}
            </div>

            {/* Avatar + name + badges */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center
                             text-white text-xs font-bold shrink-0
                             ${isMe
                               ? "bg-gradient-to-br from-brand-500 to-indigo-500"
                               : "bg-gradient-to-br from-gray-400 to-gray-500"}`}
              >
                {entry.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span
                  className={`font-semibold text-sm truncate block ${
                    isMe ? "text-brand-700" : "text-gray-900"
                  }`}
                >
                  {entry.display_name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isMe && (
                    <span className="text-xs text-brand-400 font-medium">tu</span>
                  )}
                  <BadgeDisplay badges={entry.badges} />
                </div>
              </div>
            </div>

            {/* Streak (only shown when active) */}
            {entry.streak > 0 && (
              <div className="text-center shrink-0">
                <p className="text-sm font-bold text-orange-500 leading-tight">
                  🔥{entry.streak}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">dias</p>
              </div>
            )}

            {/* Distance + run count */}
            <div className="text-right shrink-0">
              <p className="font-black text-gray-900 text-sm">
                {entry.total_km.toFixed(1)}{" "}
                <span className="font-normal text-gray-400 text-xs">km</span>
              </p>
              <p className="text-xs text-gray-400">
                {entry.run_count} corrida{entry.run_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        );
      })}

      {/* Compare link — only when there are at least 2 members */}
      {groupId && entries.length >= 2 && (
        <div className="text-right pt-1">
          <Link
            href={`/groups/${groupId}/compare`}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            📊 Comparar membros →
          </Link>
        </div>
      )}
    </div>
  );
}
