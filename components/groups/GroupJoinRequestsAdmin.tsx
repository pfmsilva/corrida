import type { GroupJoinRequest } from "@/types";

const STATUS: Record<GroupJoinRequest["status"], { label: string; cls: string }> = {
  pending:  { label: "Pendente",  cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  approved: { label: "Aprovado",  cls: "bg-green-50  text-green-700  border-green-200"  },
  rejected: { label: "Rejeitado", cls: "bg-red-50    text-red-700    border-red-200"    },
};

const SECTIONS: { status: GroupJoinRequest["status"]; icon: string; title: string }[] = [
  { status: "approved", icon: "✅", title: "Pedidos aprovados"  },
  { status: "pending",  icon: "⏳", title: "Pedidos pendentes"  },
  { status: "rejected", icon: "❌", title: "Pedidos rejeitados" },
];

export default function GroupJoinRequestsAdmin({ requests }: { requests: GroupJoinRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="font-bold text-gray-900">Pedidos de adesão</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {SECTIONS.map(({ status, icon, title }) => {
          const items = requests.filter((r) => r.status === status);
          if (!items.length) return null;
          return (
            <div key={status} className="px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {icon} {title} ({items.length})
              </p>
              <ul className="space-y-2">
                {items.map((req) => {
                  const { label, cls } = STATUS[req.status];
                  return (
                    <li key={req.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{req.user_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(req.created_at).toLocaleDateString("pt-PT", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
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
