"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GroupInvitation, GroupJoinRequest, AppNotification } from "@/types";

const NOTIF_ICON: Record<AppNotification["type"], string> = {
  new_run: "🏃",
  overtake: "⚡",
  goal_80: "🎯",
  goal_90: "🏆",
};

const NOTIF_LABEL: Record<AppNotification["type"], string> = {
  new_run: "Nova corrida",
  overtake: "Ultrapassagem",
  goal_80: "80% da meta!",
  goal_90: "90% da meta!",
};

const NOTIF_COLOR: Record<AppNotification["type"], string> = {
  new_run: "text-brand-500",
  overtake: "text-orange-500",
  goal_80: "text-emerald-500",
  goal_90: "text-emerald-600",
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} d`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(async () => {
    const [invRes, reqRes, notifRes] = await Promise.all([
      fetch("/api/invitations"),
      fetch("/api/join-requests"),
      fetch("/api/notifications"),
    ]);
    if (invRes.ok) setInvitations(await invRes.json());
    if (reqRes.ok) setJoinRequests(await reqRes.json());
    if (notifRes.ok) setNotifications(await notifRes.json());
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      // Mark all notifications as read in the background
      const unread = notifications.filter((n) => !n.is_read);
      if (unread.length) {
        fetch("/api/notifications", { method: "PATCH" });
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    }
  };

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

  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;
  const count = invitations.length + joinRequests.length + unreadNotifCount;
  const hasAny = invitations.length > 0 || joinRequests.length > 0 || notifications.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
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
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Notificações</p>
            {count > 0 && (
              <span className="text-xs text-gray-400">{count} nova{count !== 1 ? "s" : ""}</span>
            )}
          </div>

          {!hasAny ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-sm text-gray-400">Sem notificações</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">

              {/* ── Convites ────────────────────────────────────────── */}
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

              {/* ── Pedidos de adesão ────────────────────────────────── */}
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

              {/* ── Notificações de atividade ─────────────────────────── */}
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`px-4 py-3 transition-colors
                    ${notif.is_read ? "bg-white" : "bg-brand-50/40"}`}
                >
                  {notif.group_id ? (
                    <Link
                      href={`/groups/${notif.group_id}`}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 items-start group"
                    >
                      <NotifContent notif={notif} />
                    </Link>
                  ) : (
                    <div className="flex gap-3 items-start">
                      <NotifContent notif={notif} />
                    </div>
                  )}
                </li>
              ))}

            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotifContent({ notif }: { notif: AppNotification }) {
  return (
    <>
      <span className="text-xl shrink-0 mt-0.5">{NOTIF_ICON[notif.type]}</span>
      <div className="min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${NOTIF_COLOR[notif.type]}`}>
          {NOTIF_LABEL[notif.type]}
        </p>
        <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
      </div>
    </>
  );
}
