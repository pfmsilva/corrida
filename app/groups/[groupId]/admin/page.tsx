import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminPanel from "@/components/groups/AdminPanel";
import InviteUserForm from "@/components/groups/InviteUserForm";
import GroupInvitationsAdmin from "@/components/groups/GroupInvitationsAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GroupChallenge, GroupInvitation } from "@/types";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, created_by")
    .eq("id", groupId)
    .single();

  if (!group) notFound();
  if (group.created_by !== userId) redirect(`/groups/${groupId}`);

  const [{ data: challenge }, { data: invitations }] = await Promise.all([
    supabase.from("group_challenges").select("*").eq("group_id", groupId).maybeSingle(),
    supabase.from("group_invitations").select("*")
      .eq("group_id", groupId).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Link
          href={`/groups/${groupId}`}
          className="text-sm text-gray-400 hover:text-brand-600 inline-flex
                     items-center gap-1 font-medium transition-colors"
        >
          ← Voltar a {group.name}
        </Link>

        <div className="page-header">
          <h1 className="page-title">⚙️ Administração</h1>
          <p className="page-subtitle">{group.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <AdminPanel groupId={groupId} challenge={challenge as GroupChallenge | null} />
            <InviteUserForm groupId={groupId} />
          </div>
          <GroupInvitationsAdmin invitations={(invitations ?? []) as GroupInvitation[]} />
        </div>
      </main>
    </div>
  );
}
