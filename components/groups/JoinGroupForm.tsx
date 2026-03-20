"use client";
// JoinGroupForm — lets a user join a group by pasting its UUID.
// The group admin shares the ID via the "Copy ID" button on the group hub.

import { useState } from "react";

interface JoinGroupFormProps {
  onSuccess: (groupId: string) => void;
  onCancel: () => void;
}

export default function JoinGroupForm({ onSuccess, onCancel }: JoinGroupFormProps) {
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: groupId.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Erro ao entrar no grupo");
      return;
    }

    onSuccess(groupId.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 border-brand-200">
      <h3 className="font-semibold text-gray-800">Entrar num grupo</h3>
      <p className="text-sm text-gray-500">
        Pede ao administrador do grupo que partilhe o ID do grupo e cola-o abaixo.
      </p>

      <div>
        <label htmlFor="group-id" className="label">ID do grupo</label>
        <input
          id="group-id"
          type="text"
          required
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="input font-mono text-xs"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "A entrar…" : "Entrar no grupo"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}
