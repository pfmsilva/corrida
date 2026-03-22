"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { GroupInvitation, GroupJoinRequest } from "@/types";

export default function NotificationBell() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(async () => {
    const [invRes, reqRes] = await Promise.all([
      fetch("/api/invitations"),
      fetch("/api/join-requests"),
    ]);
    if (invRes.ok) setInvitations(await invRes.json());
    if (reqRes.ok) setJoinRequests(await reqRes.json());
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const respondInvite = async (id: string, status: "accepted" | "declined") => {
    setResponding(id);
    await fetch(`/api/invitations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setResponding(null);
    await fetchAll();
    if (status === "accepted") router.refresh();
  };

  const respondJoinRequest = async (req: GroupJoinRequest, status: "approved" | "rejected") => {
    setResponding(req.id);
    await fetch(`/api/groups/${req.group_id}/join-requests/${req.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setResponding(null);
    await fetchAll();
    if (status === "approved") router.refresh();
  };

  const count = invitations.length + joinRequests.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center
                   w-9 h-9 rounded-xl text-gray-500 hover:text-gray-900
                   hover:bg-gray-100 transition-all duration-200"
        aria-label="Notificações"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                           bg-brand-600 text-white text-[10px] font-bold
                           rounded-full flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80
                        bg-white rounded-2xl shadow-xl border border-gray-100
                        overflow-hidden z-50 animate-fade-in-up">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900">Notificações</p>
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-sm text-gray-400">Sem notificações</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">

              {/* Convites para o utilizador */}
              {invitations.map((inv) => (
                <li key={inv.id} className="px-4 py-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
                      Convite
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Convidado para{" "}
                      <span className="text-brand-600">{inv.group_name}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(inv.created_at).toLocaleDateString("pt-PT", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respondInvite(inv.id, "accepted")}
                      disabled={responding === inv.id}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg
                                 bg-brand-600 text-white hover:bg-brand-700
                                 transition-colors disabled:opacity-50">
                      {responding === inv.id ? "…" : "Aceitar"}
                    </button>
                    <button onClick={() => respondInvite(inv.id, "declined")}
                      disabled={responding === inv.id}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg
                                 border border-gray-200 text-gray-600 hover:bg-gray-50
                                 transition-colors disabled:opacity-50">
                      Recusar
                    </button>
                  </div>
                </li>
              ))}

              {/* Pedidos de adesão para o admin */}
              {joinRequests.map((req) => (
                <li key={req.id} className="px-4 py-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
                      Pedido de adesão
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-brand-600">{req.user_name}</span>
                      {" "}quer juntar-se a{" "}
                      <span className="font-semibold">{req.group_name}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(req.created_at).toLocaleDateString("pt-PT", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respondJoinRequest(req, "approved")}
                      disabled={responding === req.id}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg
                                 bg-brand-600 text-white hover:bg-brand-700
                                 transition-colors disabled:opacity-50">
                      {responding === req.id ? "…" : "Aprovar"}
                    </button>
                    <button onClick={() => respondJoinRequest(req, "rejected")}
                      disabled={responding === req.id}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg
                                 border border-gray-200 text-gray-600 hover:bg-gray-50
                                 transition-colors disabled:opacity-50">
                      Rejeitar
                    </button>
                  </div>
                </li>
              ))}

            </ul>
          )}
        </div>
      )}
    </div>
  );
}
