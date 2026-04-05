import Link from "next/link";
import type { GroupChallenge } from "@/types";

interface ChallengeStatus {
  groupId: string;
  groupName: string;
  challenge: GroupChallenge;
  totalKm: number;
}

interface DashboardChallengesProps {
  challenges: ChallengeStatus[];
}

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short",
  });
}

export default function DashboardChallenges({ challenges }: DashboardChallengesProps) {
  if (challenges.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center">
        <p className="text-3xl mb-2">🏃</p>
        <p className="font-semibold text-gray-700 text-sm">Ainda não fazes parte de nenhum desafio</p>
        <Link href="/groups" className="inline-block mt-3 text-sm font-semibold text-brand-600 hover:underline">
          Explorar desafios →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {challenges.map(({ groupId, groupName, challenge, totalKm }) => {
        const target = Number(challenge.target_km);
        const pct = Math.min(100, (totalKm / target) * 100);
        const done = totalKm >= target;

        return (
          <Link key={groupId} href={`/groups/${groupId}`}
            className="block rounded-2xl border border-gray-100 bg-white shadow-sm
                       hover:shadow-md hover:border-brand-200 transition-all duration-200 p-5 space-y-3">

            {/* Group name */}
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-gray-900 text-sm leading-snug">{groupName}</p>
              {done
                ? <span className="shrink-0 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Concluído</span>
                : <span className="shrink-0 text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{pct.toFixed(0)}%</span>
              }
            </div>

            {/* Distance */}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">{totalKm.toFixed(1)}</span>
              <span className="text-sm text-gray-400 font-medium">/ {target} km</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  done
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : "bg-gradient-to-r from-brand-500 to-indigo-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Date range */}
            {(challenge.starts_at || challenge.ends_at) && (
              <p className="text-xs text-gray-400">
                📅{" "}
                {challenge.starts_at && challenge.ends_at
                  ? `${fmt(challenge.starts_at)} → ${fmt(challenge.ends_at)}`
                  : challenge.ends_at
                  ? `Até ${fmt(challenge.ends_at)}`
                  : `A partir de ${fmt(challenge.starts_at!)}`}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
