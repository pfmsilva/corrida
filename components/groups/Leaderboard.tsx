// Leaderboard — ranks group members by total distance.
// Highlights the current user's row. Medals for the top 3.

import type { LeaderboardEntry } from "@/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-400">
        <p className="text-sm">Ainda não há corridas registadas — sê o primeiro!</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-medium text-gray-500 w-8">#</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Corredor</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500">Distância</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">
              Corridas
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isMe = entry.user_id === currentUserId;
            return (
              <tr
                key={entry.user_id}
                className={`border-b border-gray-50 last:border-0 ${
                  isMe ? "bg-brand-50" : "hover:bg-gray-50"
                }`}
              >
                {/* Rank / medal */}
                <td className="px-4 py-3 text-lg">
                  {entry.rank <= 3
                    ? MEDALS[entry.rank - 1]
                    : <span className="text-xs text-gray-400">{entry.rank}</span>}
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <span
                    className={`font-medium ${
                      isMe ? "text-brand-600" : "text-gray-800"
                    }`}
                  >
                    {entry.display_name}
                  </span>
                  {isMe && (
                    <span className="ml-2 text-xs text-brand-400">(tu)</span>
                  )}
                </td>

                {/* Distance */}
                <td className="px-4 py-3 text-right font-bold text-gray-800">
                  {entry.total_km.toFixed(1)}{" "}
                  <span className="font-normal text-gray-400">km</span>
                </td>

                {/* Run count — hidden on small screens */}
                <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                  {entry.run_count} corrida{entry.run_count !== 1 ? "s" : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
