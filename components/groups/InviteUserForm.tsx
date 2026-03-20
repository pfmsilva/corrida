"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserSearchResult } from "@/types";

export default function InviteUserForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [inviting, setInviting] = useState<string | null>(null);
  const [justInvited, setJustInvited] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }

    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}&groupId=${groupId}`
      );
      const data = await res.json();
      setResults(data.users ?? []);
    }, 300);

    return () => clearTimeout(t);
  }, [query, groupId]);

  const handleInvite = async (user: UserSearchResult) => {
    setInviting(user.id);
    setError(null);

    const res = await fetch(`/api/groups/${groupId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    const data = await res.json();
    setInviting(null);

    if (!res.ok) {
      setError(data?.error ?? "Erro ao enviar convite");
      return;
    }

    setJustInvited((prev) => new Set([...prev, user.id]));
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-brand-600 px-5 py-4">
        <h2 className="font-bold text-white">Convidar utilizadores</h2>
        <p className="text-indigo-200 text-xs mt-0.5">
          Pesquisa pelo nome ou email de utilizadores da aplicação.
        </p>
      </div>

      <div className="p-5 space-y-3">
        <input
          type="text"
          placeholder="Pesquisar por nome ou email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          autoComplete="off"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        {results.length > 0 && (
          <ul className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
            {results.map((user) => {
              const invited = justInvited.has(user.id);
              return (
                <li key={user.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-white">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  {invited ? (
                    <span className="text-xs text-green-600 font-medium shrink-0">
                      ✓ Convidado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInvite(user)}
                      disabled={inviting === user.id}
                      className="shrink-0 text-xs font-semibold text-brand-600
                                 hover:text-white hover:bg-brand-600
                                 border border-brand-200 hover:border-brand-600
                                 px-3 py-1.5 rounded-lg transition-all duration-200
                                 disabled:opacity-50"
                    >
                      {inviting === user.id ? "…" : "Convidar"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {query.trim().length >= 2 && results.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">
            Nenhum utilizador encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
