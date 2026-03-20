import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import GroupList from "@/components/groups/GroupList";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Group } from "@/types";

export default async function GroupsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name, created_by, created_at)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  const groups: Group[] = (memberships ?? [])
    .map((m) => m.groups as unknown as Group)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="page-header flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Grupos</h1>
            <p className="page-subtitle">Cria um grupo ou entra num com o ID do grupo.</p>
          </div>
          <Link href="/groups/discover"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold
                       text-brand-600 border border-brand-200 bg-brand-50
                       hover:bg-brand-100 px-4 py-2 rounded-xl transition-all duration-200">
            🌍 Descobrir grupos
          </Link>
        </div>
        <GroupList initialGroups={groups} userId={userId} />
      </main>
    </div>
  );
}
