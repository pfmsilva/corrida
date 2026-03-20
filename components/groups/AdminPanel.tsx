"use client";
// AdminPanel — lets the group creator set or update the group challenge.
// PUT /api/groups/[groupId]/challenge

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GroupChallenge } from "@/types";

interface AdminPanelProps {
  groupId: string;
  challenge: GroupChallenge | null;
}

export default function AdminPanel({ groupId, challenge }: AdminPanelProps) {
  const router = useRouter();

  const [targetKm, setTargetKm] = useState(
    challenge ? String(challenge.target_km) : ""
  );
  const [reward, setReward] = useState(challenge?.reward ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch(`/api/groups/${groupId}/challenge`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_km: parseFloat(targetKm),
        reward,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Erro ao guardar desafio");
      return;
    }

    setSuccess(true);
    // Re-fetch the server component so ChallengeCard reflects the update
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 max-w-md">
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          {challenge ? "Atualizar desafio" : "Definir um desafio"}
        </h2>
        <p className="text-sm text-gray-500">
          Define um objetivo coletivo de distância e uma recompensa que é revelada
          quando o grupo o atingir.
        </p>
      </div>

      {/* Target distance */}
      <div>
        <label htmlFor="target-km" className="label">
          Distância alvo (km)
        </label>
        <input
          id="target-km"
          type="number"
          required
          min="1"
          step="0.5"
          placeholder="e.g. 500"
          value={targetKm}
          onChange={(e) => setTargetKm(e.target.value)}
          className="input"
        />
      </div>

      {/* Reward */}
      <div>
        <label htmlFor="reward" className="label">
          Recompensa{" "}
          <span className="font-normal text-gray-400">
            (revelada ao atingir o objetivo)
          </span>
        </label>
        <input
          id="reward"
          type="text"
          required
          placeholder="ex: Noite de pizza para todo o grupo! 🍕"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          className="input"
        />
        <p className="mt-1 text-xs text-gray-400">
          Os membros não verão isto até o objetivo ser atingido.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          ✅ Desafio guardado com sucesso!
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "A guardar…" : challenge ? "Atualizar desafio" : "Definir desafio"}
      </button>
    </form>
  );
}
