// Admin page — only accessible to the group creator.
// Allows setting / updating the challenge target and reward.
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminPanel from "@/components/groups/AdminPanel";
import type { GroupChallenge } from "@/types";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the group — RLS ensures user is a member
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, created_by")
    .eq("id", groupId)
    .single();

  if (!group) notFound();

  // Only the creator may access this page
  if (group.created_by !== user.id) {
    redirect(`/groups/${groupId}`);
  }

  // Fetch existing challenge (null if not set yet)
  const { data: challenge } = await supabase
    .from("group_challenges")
    .select("*")
    .eq("group_id", groupId)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href={`/groups/${groupId}`}
          className="text-sm text-gray-400 hover:text-brand-600 mb-5 inline-flex
                     items-center gap-1 font-medium transition-colors"
        >
          ← Voltar a {group.name}
        </Link>

        <div className="page-header">
          <h1 className="page-title">⚙️ Administração</h1>
          <p className="page-subtitle">{group.name}</p>
        </div>

        <AdminPanel
          groupId={groupId}
          challenge={challenge as GroupChallenge | null}
        />
      </main>
    </div>
  );
}
