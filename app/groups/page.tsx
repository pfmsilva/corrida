import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import GroupList from "@/components/groups/GroupList";
import type { Group } from "@/types";

export default async function GroupsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name, created_by, created_at)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const groups: Group[] = (memberships ?? [])
    .map((m) => m.groups as unknown as Group)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="page-header">
          <h1 className="page-title">Grupos</h1>
          <p className="page-subtitle">Cria um grupo ou entra num com o ID do grupo.</p>
        </div>
        <GroupList initialGroups={groups} userId={user.id} />
      </main>
    </div>
  );
}
