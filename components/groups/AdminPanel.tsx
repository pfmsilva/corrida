"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GroupChallenge } from "@/types";

interface AdminPanelProps {
  groupId: string;
  challenge: GroupChallenge | null;
  isPublic: boolean;
}

export default function AdminPanel({ groupId, challenge, isPublic: initialIsPublic }: AdminPanelProps) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [targetKm, setTargetKm] = useState(challenge ? String(challenge.target_km) : "");
  const [reward, setReward] = useState(challenge?.reward ?? "");
  const [startsAt, setStartsAt] = useState(challenge?.starts_at ?? "");
  const [endsAt, setEndsAt] = useState(challenge?.ends_at ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVisibilityToggle = async (value: boolean) => {
    setIsPublic(value);
    setSavingVisibility(true);
    await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: value }),
    });
    setSavingVisibility(false);
    router.refresh();
  };

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
        starts_at: startsAt || null,
        ends_at: endsAt || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data?.error ?? "Erro ao guardar desafio"); return; }
    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="space-y-4 max-w-md">

    {/* ── Visibilidade ── */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Grupo público</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isPublic
              ? "Qualquer utilizador pode encontrar e pedir adesão."
              : "Só é possível entrar com o ID do grupo."}
          </p>
        </div>
        <button
          onClick={() => handleVisibilityToggle(!isPublic)}
          disabled={savingVisibility}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                      ${isPublic ? "bg-brand-600" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                            shadow-sm transition-transform duration-200
                            ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>
    </div>

    {/* ── Desafio ── */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="starts-at" className="label">Data de início</label>
            <input
              id="starts-at" type="date"
              value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="ends-at" className="label">Data de fim</label>
            <input
              id="ends-at" type="date"
              min={startsAt || undefined}
              value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
              className="input"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          Só as corridas dentro deste período contam para o desafio. Deixa em branco para sem limite.
        </p>

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
    </div>
  );
}
