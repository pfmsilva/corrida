"use client";

import { useState, useRef } from "react";

interface CreateGroupFormProps {
  onSuccess: (groupId: string) => void;
  onCancel: () => void;
}

export default function CreateGroupForm({ onSuccess, onCancel }: CreateGroupFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grupo
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Desafio (opcional)
  const [targetKm, setTargetKm] = useState("");
  const [reward, setReward] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setImageError("Tipo inválido. Use JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Ficheiro demasiado grande. Máximo 5 MB.");
      return;
    }

    setImageError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Criar grupo
    const groupRes = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, is_public: isPublic }),
    });
    const groupData = await groupRes.json();
    if (!groupRes.ok) {
      setError(groupData?.error ?? "Erro ao criar desafio");
      setLoading(false);
      return;
    }
    const groupId: string = groupData.id;

    // 2. Upload da imagem (se selecionada)
    let imageUrl: string | null = null;
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      const imgRes = await fetch(`/api/groups/${groupId}/challenge/image`, {
        method: "POST",
        body: fd,
      });
      const imgData = await imgRes.json();
      if (!imgRes.ok) {
        setError(imgData?.error ?? "Erro ao carregar imagem");
        setLoading(false);
        return;
      }
      imageUrl = imgData.url;
    }

    // 3. Criar desafio (se campos preenchidos)
    const hasChallenge = targetKm && parseFloat(targetKm) > 0 && reward.trim();
    if (hasChallenge) {
      const challengeRes = await fetch(`/api/groups/${groupId}/challenge`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_km: parseFloat(targetKm),
          reward: reward.trim(),
          starts_at: startsAt || null,
          ends_at: endsAt || null,
          image_url: imageUrl,
        }),
      });
      if (!challengeRes.ok) {
        const d = await challengeRes.json();
        setError(d?.error ?? "Erro ao definir o desafio");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSuccess(groupId);
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-brand-600 to-indigo-500 px-5 py-4">
        <h3 className="font-bold text-white">Novo desafio</h3>
        <p className="text-indigo-200 text-xs mt-0.5">
          Define o desafio e as suas regras desde o início.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">

        {/* ── Nome ── */}
        <div>
          <label htmlFor="group-name" className="label">Nome do desafio</label>
          <input
            id="group-name" type="text" required
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="ex: Corredores de Sábado"
            className="input"
          />
        </div>

        {/* ── Visibilidade ── */}
        <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Desafio público</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isPublic
                ? "Qualquer utilizador pode encontrar e pedir adesão."
                : "Só é possível entrar com o ID do desafio."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic((v) => !v)}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                        ${isPublic ? "bg-brand-600" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                              shadow-sm transition-transform duration-200
                              ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* ── Separador ── */}
        <div className="border-t border-gray-100" />

        {/* ── Objetivo (opcional) ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider -mb-2">
          Objetivo do desafio <span className="font-normal normal-case">(opcional)</span>
        </p>

        <div>
          <label htmlFor="target-km" className="label">Distância alvo (km)</label>
          <input
            id="target-km" type="number" min="1" step="0.5"
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
            id="reward" type="text"
            placeholder="ex: Noite de pizza para todo o grupo! 🍕"
            value={reward} onChange={(e) => setReward(e.target.value)}
            className="input"
          />
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
          Só as corridas dentro deste período contam. Deixa em branco para sem limite.
        </p>

        {/* ── Imagem ── */}
        <div className="space-y-2">
          <label className="label">
            Imagem do desafio{" "}
            <span className="font-normal text-gray-400">(opcional)</span>
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white
                           text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
              >
                ✕ Remover
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-brand-400
                         rounded-xl py-6 text-center transition-colors"
            >
              <p className="text-2xl mb-1">🖼️</p>
              <p className="text-sm text-gray-500 font-medium">Clica para adicionar imagem</p>
              <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG ou WebP · máx. 5 MB</p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview && (
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

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "A criar…" : "Criar desafio"}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
