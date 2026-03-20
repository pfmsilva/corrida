"use client";
// ChallengeCard — shows group challenge progress.
// When totalKm >= target_km the reward is revealed with a celebration banner.
// The reward text is blurred until the milestone is reached.

import Link from "next/link";
import type { GroupChallenge } from "@/types";

interface ChallengeCardProps {
  challenge: GroupChallenge | null;
  totalKm: number;
  isAdmin: boolean;
  groupId: string;
}

export default function ChallengeCard({
  challenge,
  totalKm,
  isAdmin,
  groupId,
}: ChallengeCardProps) {
  // ── No challenge set yet ──────────────────────────────────────────────
  if (!challenge) {
    return (
      <div className="card text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">🎯</p>
        <p className="text-sm">Ainda não há desafio definido.</p>
        {isAdmin && (
          <Link
            href={`/groups/${groupId}/admin`}
            className="mt-3 inline-block btn-primary text-sm"
          >
            Definir desafio
          </Link>
        )}
      </div>
    );
  }

  const progressPct = Math.min(
    100,
    (totalKm / Number(challenge.target_km)) * 100
  );
  const isMilestone = totalKm >= Number(challenge.target_km);

  // ── Milestone reached ─────────────────────────────────────────────────
  if (isMilestone) {
    return (
      <div className="card border-green-200 bg-green-50 space-y-4">
        {/* Celebration header */}
        <div className="text-center space-y-1">
          <p className="text-4xl">🎉</p>
          <p className="text-lg font-bold text-green-700">
            Desafio concluído!
          </p>
          <p className="text-sm text-green-600">
            Correram {totalKm.toFixed(1)} km — o objetivo era{" "}
            {challenge.target_km} km.
          </p>
        </div>

        {/* Reward reveal */}
        <div className="bg-white rounded-xl p-4 text-center border border-green-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            🏆 A vossa recompensa
          </p>
          <p className="text-base font-semibold text-gray-800">
            {challenge.reward}
          </p>
        </div>

        {/* Full progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{totalKm.toFixed(1)} km</span>
            <span>100%</span>
          </div>
          <div className="h-3 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ── In progress ───────────────────────────────────────────────────────
  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">
            🎯 Desafio de {challenge.target_km} km
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Faltam {(Number(challenge.target_km) - totalKm).toFixed(1)} km
          </p>
        </div>
        <span className="text-2xl font-bold text-brand-600">
          {progressPct.toFixed(0)}%
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{totalKm.toFixed(1)} km</span>
          <span>{challenge.target_km} km</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Blurred reward preview — revealed on milestone */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
        <span className="text-lg">🏆</span>
        <div>
          <p className="text-xs text-gray-400 font-medium">Recompensa</p>
          {/* Blurred until milestone reached */}
          <p className="text-sm text-gray-700 blur-sm select-none">
            {challenge.reward}
          </p>
        </div>
      </div>
    </div>
  );
}
