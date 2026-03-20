// Groups list page — shows all groups the user belongs to.
// Server Component: fetches memberships, passes to client components.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import GroupList from "@/components/groups/GroupList";
import type { Group } from "@/types";

export default async function GroupsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch groups the user belongs to, with the group details joined
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name, created_by, created_at)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  // Unwrap the nested groups object from each membership row
  const groups: Group[] = (memberships ?? [])
    .map((m) => m.groups as unknown as Group)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Grupos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cria um grupo ou entra num com o ID do grupo.
          </p>
        </div>
        {/* GroupList handles create + join forms and the list of cards */}
        <GroupList initialGroups={groups} userId={user.id} />
      </main>
    </div>
  );
}
