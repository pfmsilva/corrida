"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PublicGroup {
  id: string;
  name: string;
  challenge: { target_km: number; starts_at: string | null; ends_at: string | null } | null;
  is_member: boolean;
  has_pending_request: boolean;
}

const fmt = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric",
  });

export default function DiscoverGroupList({ groups }: { groups: PublicGroup[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleRequest = async (groupId: string) => {
    setRequesting(groupId);
    setError(null);
    const res = await fetch(`/api/groups/${groupId}/join-requests`, {
      method: "POST",
    });
    const data = await res.json();
    setRequesting(null);
    if (!res.ok) { setError(data?.error ?? "Erro ao enviar pedido"); return; }
    setRequested((prev) => new Set([...prev, groupId]));
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Pesquisar desafios…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input max-w-sm"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-gray-700">Nenhum desafio público encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Tenta outro termo de pesquisa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => {
            const isPending = requested.has(g.id) || g.has_pending_request;

            return (
              <div key={g.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4
                           hover:shadow-md hover:border-brand-100 transition-all duration-200">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 leading-tight">{g.name}</h3>
                  <span className="shrink-0 text-xs bg-indigo-50 text-indigo-600
                                   font-medium px-2 py-0.5 rounded-full border border-indigo-100">
                    Público
                  </span>
                </div>

                {/* Challenge */}
                {g.challenge ? (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      🎯 Desafio
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {g.challenge.target_km} km
                    </p>
                    {(g.challenge.starts_at || g.challenge.ends_at) && (
                      <p className="text-xs text-gray-400">
                        {g.challenge.starts_at && fmt(g.challenge.starts_at)}
                        {g.challenge.starts_at && g.challenge.ends_at && " → "}
                        {g.challenge.ends_at && fmt(g.challenge.ends_at)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Sem desafio definido</p>
                )}

                {/* Action */}
                {g.is_member ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium
                                   text-green-700 bg-green-50 border border-green-200
                                   rounded-full px-3 py-1">
                    ✓ Já és membro
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium
                                   text-yellow-700 bg-yellow-50 border border-yellow-200
                                   rounded-full px-3 py-1">
                    ⏳ Pedido pendente
                  </span>
                ) : (
                  <button
                    onClick={() => handleRequest(g.id)}
                    disabled={requesting === g.id}
                    className="w-full btn-primary text-sm py-2 disabled:opacity-50"
                  >
                    {requesting === g.id ? "A enviar…" : "Pedir adesão"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
