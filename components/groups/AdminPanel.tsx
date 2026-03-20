"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GroupChallenge } from "@/types";

interface AdminPanelProps {
  groupId: string;
  challenge: GroupChallenge | null;
}

export default function AdminPanel({ groupId, challenge }: AdminPanelProps) {
  const router = useRouter();
  const [targetKm, setTargetKm] = useState(challenge ? String(challenge.target_km) : "");
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
      body: JSON.stringify({ target_km: parseFloat(targetKm), reward }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data?.error ?? "Erro ao guardar desafio"); return; }
    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-md">
      <div className="bg-gradient-to-r from-brand-600 to-indigo-500 px-5 py-4">
        <h2 className="font-bold text-white">
          {challenge ? "Atualizar desafio" : "Definir um desafio"}
        </h2>
        <p className="text-indigo-200 text-xs mt-0.5">
          Define um objetivo coletivo de distância e uma recompensa.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label htmlFor="target-km" className="label">Distância alvo (km)</label>
          <input
            id="target-km" type="number" required min="1" step="0.5"
            placeholder="ex: 500"
            value={targetKm} onChange={(e) => setTargetKm(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="reward" className="label">
            Recompensa{" "}
            <span className="font-normal text-gray-400">(revelada ao atingir o objetivo)</span>
          </label>
          <input
            id="reward" type="text" required
            placeholder="ex: Noite de pizza para todo o grupo! 🍕"
            value={reward} onChange={(e) => setReward(e.target.value)}
            className="input"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Os membros não verão isto até o objetivo ser atingido.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
            ✅ Desafio guardado com sucesso!
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "A guardar…" : challenge ? "Atualizar desafio" : "Definir desafio"}
        </button>
      </form>
    </div>
  );
}
