"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { GroupChallenge } from "@/types";

interface AdminPanelProps {
  groupId: string;
  challenge: GroupChallenge | null;
  isPublic: boolean;
}

export default function AdminPanel({ groupId, challenge, isPublic: initialIsPublic }: AdminPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [savingVisibility, setSavingVisibility] = useState(false);

  const [targetKm, setTargetKm] = useState(challenge ? String(challenge.target_km) : "");
  const [reward, setReward] = useState(challenge?.reward ?? "");
  const [startsAt, setStartsAt] = useState(challenge?.starts_at ?? "");
  const [endsAt, setEndsAt] = useState(challenge?.ends_at ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(challenge?.image_url ?? null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setImageUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`/api/groups/${groupId}/challenge/image`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setImageUploading(false);

    if (!res.ok) {
      setImageError(data?.error ?? "Erro ao carregar imagem");
      // Reset file input so the same file can be retried
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageUrl(data.url);
  };

  const handleRemoveImage = async () => {
    setImageError(null);
    const res = await fetch(`/api/groups/${groupId}/challenge/image`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setImageUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        image_url: imageUrl,
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
          <p className="font-semibold text-gray-900 text-sm">Desafio público</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isPublic
              ? "Qualquer utilizador pode encontrar e pedir adesão."
              : "Só é possível entrar com o ID do desafio."}
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

        {/* ── Imagem do desafio ── */}
        <div className="space-y-2">
          <label className="label">
            Imagem do desafio{" "}
            <span className="font-normal text-gray-400">(opcional)</span>
          </label>

          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Imagem do desafio"
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white
                           text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
              >
                ✕ Remover
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={imageUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-brand-400
                         rounded-xl py-6 text-center transition-colors cursor-pointer
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {imageUploading ? (
                <span className="text-sm text-gray-400">A carregar…</span>
              ) : (
                <>
                  <p className="text-2xl mb-1">🖼️</p>
                  <p className="text-sm text-gray-500 font-medium">Clica para adicionar imagem</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG ou WebP · máx. 5 MB</p>
                </>
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          {imageUrl && !imageUploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Substituir imagem
            </button>
          )}

          {imageError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{imageError}</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
            ✅ Desafio guardado com sucesso!
          </p>
        )}

        <button type="submit" disabled={loading || imageUploading} className="btn-primary w-full">
          {loading ? "A guardar…" : challenge ? "Atualizar desafio" : "Definir desafio"}
        </button>
      </form>
    </div>
    </div>
  );
}
