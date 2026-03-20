"use client";
// GroupList — renders the user's groups and exposes Create + Join forms.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateGroupForm from "./CreateGroupForm";
import JoinGroupForm from "./JoinGroupForm";
import type { Group } from "@/types";

interface GroupListProps {
  initialGroups: Group[];
  userId: string;
}

export default function GroupList({ initialGroups, userId }: GroupListProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<"none" | "create" | "join">("none");

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setPanel(panel === "create" ? "none" : "create")}
          className="btn-primary"
        >
          + Criar grupo
        </button>
        <button
          onClick={() => setPanel(panel === "join" ? "none" : "join")}
          className="btn-ghost"
        >
          Entrar com ID
        </button>
      </div>

      {/* Inline forms */}
      {panel === "create" && (
        <CreateGroupForm
          onSuccess={(groupId) => {
            router.push(`/groups/${groupId}`);
          }}
          onCancel={() => setPanel("none")}
        />
      )}
      {panel === "join" && (
        <JoinGroupForm
          onSuccess={(groupId) => {
            router.push(`/groups/${groupId}`);
          }}
          onCancel={() => setPanel("none")}
        />
      )}

      {/* Group cards */}
      {initialGroups.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm">Ainda não entraste em nenhum grupo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialGroups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`}>
              <div className="card hover:border-brand-200 hover:bg-brand-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{g.name}</p>
                    {g.created_by === userId && (
                      <p className="text-xs text-brand-500 mt-0.5">Administrador</p>
                    )}
                  </div>
                  <span className="text-gray-300 text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
