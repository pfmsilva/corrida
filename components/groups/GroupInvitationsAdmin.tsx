import type { GroupInvitation } from "@/types";

const STATUS_LABELS: Record<GroupInvitation["status"], { label: string; className: string }> = {
  pending:  { label: "Pendente",  className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  accepted: { label: "Aceite",    className: "bg-green-50  text-green-700  border-green-200"  },
  declined: { label: "Recusado",  className: "bg-red-50    text-red-700    border-red-200"    },
};

const SECTIONS: { status: GroupInvitation["status"]; icon: string; title: string }[] = [
  { status: "accepted", icon: "✅", title: "Membros via convite" },
  { status: "pending",  icon: "⏳", title: "Convites pendentes"  },
  { status: "declined", icon: "❌", title: "Convites recusados"  },
];

export default function GroupInvitationsAdmin({
  invitations,
}: {
  invitations: GroupInvitation[];
}) {
  if (invitations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="font-bold text-gray-900">Estado dos convites</h2>
      </div>

      <div className="divide-y divide-gray-50">
        {SECTIONS.map(({ status, icon, title }) => {
          const items = invitations.filter((i) => i.status === status);
          if (items.length === 0) return null;

          return (
            <div key={status} className="px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {icon} {title} ({items.length})
              </p>
              <ul className="space-y-2">
                {items.map((inv) => {
                  const { label, className } = STATUS_LABELS[inv.status];
                  return (
                    <li key={inv.id}
                      className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inv.invited_user_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Convidado a{" "}
                          {new Date(inv.created_at).toLocaleDateString("pt-PT", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-1
                                        rounded-full border ${className}`}>
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
