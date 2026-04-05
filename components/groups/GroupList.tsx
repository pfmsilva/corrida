"use client";

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
    <div className="space-y-5">
      {/* Acções */}
      <div className="flex gap-3">
        <button
          onClick={() => setPanel(panel === "create" ? "none" : "create")}
          className="btn-primary"
        >
          + Criar desafio
        </button>
        <button
          onClick={() => setPanel(panel === "join" ? "none" : "join")}
          className="btn-ghost"
        >
          Entrar com ID
        </button>
      </div>

      {panel === "create" && (
        <CreateGroupForm
          onSuccess={(id) => router.push(`/groups/${id}`)}
          onCancel={() => setPanel("none")}
        />
      )}
      {panel === "join" && (
        <JoinGroupForm
          onSuccess={(id) => router.push(`/groups/${id}`)}
          onCancel={() => setPanel("none")}
        />
      )}

      {initialGroups.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-5xl mb-3">👥</p>
          <p className="font-semibold text-gray-700">Ainda sem desafios</p>
          <p className="text-sm text-gray-400 mt-1">Cria ou entra num desafio para começar</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {initialGroups.map((g) => (
            <Link key={g.id} href={`/groups/${g.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                              hover:shadow-md hover:border-brand-100 transition-all duration-200
                              group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500
                                      to-indigo-500 flex items-center justify-center
                                      text-white font-bold text-sm">
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{g.name}</p>
                        {g.created_by === userId && (
                          <p className="text-xs text-brand-500 font-medium">Administrador</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-brand-400
                                   transition-colors text-lg font-light">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
