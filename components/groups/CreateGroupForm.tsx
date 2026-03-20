"use client";
// CreateGroupForm — POST /api/groups, redirects to the new group on success.

import { useState } from "react";

interface CreateGroupFormProps {
  onSuccess: (groupId: string) => void;
  onCancel: () => void;
}

export default function CreateGroupForm({ onSuccess, onCancel }: CreateGroupFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Erro ao criar grupo");
      return;
    }

    onSuccess(data.id);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 border-brand-200">
      <h3 className="font-semibold text-gray-800">Novo grupo</h3>

      <div>
        <label htmlFor="group-name" className="label">Nome do grupo</label>
        <input
          id="group-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Corredores de Sábado"
          className="input"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "A criar…" : "Criar grupo"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}
