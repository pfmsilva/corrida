"use client";

import Link from "next/link";
import type { GroupChallenge } from "@/types";

interface ChallengeCardProps {
  challenge: GroupChallenge | null;
  totalKm: number;
  isAdmin: boolean;
  groupId: string;
}

export default function ChallengeCard({ challenge, totalKm, isAdmin, groupId }: ChallengeCardProps) {
  if (!challenge) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
        <p className="text-4xl mb-3">🎯</p>
        <p className="font-semibold text-gray-700">Ainda não há desafio</p>
        <p className="text-sm text-gray-400 mt-1 mb-4">Define um objetivo para o desafio</p>
        {isAdmin && (
          <Link href={`/groups/${groupId}/admin`} className="btn-primary text-sm">
            Definir desafio
          </Link>
        )}
      </div>
    );
  }

  const progressPct = Math.min(100, (totalKm / Number(challenge.target_km)) * 100);
  const isMilestone = totalKm >= Number(challenge.target_km);

  if (isMilestone) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600
                      text-white shadow-lg shadow-green-500/25 space-y-4">
        {challenge.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={challenge.image_url}
            alt="Imagem do desafio"
            className="w-full h-36 object-cover"
          />
        )}
        <div className={`space-y-4 ${challenge.image_url ? "px-6 pb-6" : "p-6"}`}>
          <div className="text-center space-y-1">
            <p className="text-5xl">🎉</p>
            <p className="text-xl font-black">Desafio concluído!</p>
            <p className="text-green-100 text-sm">
              Correram {totalKm.toFixed(1)} km — objetivo era {challenge.target_km} km.
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
            <p className="text-xs font-bold text-green-100 uppercase tracking-wider mb-2">
              🏆 A vossa recompensa
            </p>
            <p className="font-bold text-white text-base">{challenge.reward}</p>
          </div>
          <div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="card overflow-hidden !p-0">
      {challenge.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={challenge.image_url}
          alt="Imagem do desafio"
          className="w-full h-36 object-cover"
        />
      )}

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">🎯 Desafio de {challenge.target_km} km</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Faltam {(Number(challenge.target_km) - totalKm).toFixed(1)} km
            </p>
          </div>
          <span className="text-2xl font-black text-brand-600">{progressPct.toFixed(0)}%</span>
        </div>

        {(challenge.starts_at || challenge.ends_at) && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>📅</span>
            {challenge.starts_at && <span>{fmt(challenge.starts_at)}</span>}
            {challenge.starts_at && challenge.ends_at && <span>→</span>}
            {challenge.ends_at && <span>{fmt(challenge.ends_at)}</span>}
            {!challenge.starts_at && challenge.ends_at && <span>Até {fmt(challenge.ends_at)}</span>}
          </div>
        )}

        {/* Barra de progresso com gradiente */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{totalKm.toFixed(1)} km</span>
            <span>{challenge.target_km} km</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500
                         transition-all duration-500 shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Recompensa sempre visível */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-xl">🏆</span>
          <div>
            <p className="text-xs text-gray-400 font-medium">Recompensa</p>
            <p className="text-sm text-gray-700 font-semibold">{challenge.reward}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
