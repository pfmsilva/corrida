import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AdminPanel from "@/components/groups/AdminPanel";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GroupChallenge } from "@/types";

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

  if (group.created_by !== userId) {
    redirect(`/groups/${groupId}`);
  }

  const { data: challenge } = await supabase
    .from("group_challenges")
    .select("*")
    .eq("group_id", groupId)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

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
