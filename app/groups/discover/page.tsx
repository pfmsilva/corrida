import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DiscoverGroupList from "@/components/groups/DiscoverGroupList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function DiscoverPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  const [
    { data: groups },
    { data: memberships },
    { data: pendingRequests },
  ] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, created_by, is_public, group_challenges(target_km, starts_at, ends_at)")
      .eq("is_public", true)
      .order("created_at", { ascending: false }),
    supabase.from("group_members").select("group_id").eq("user_id", userId),
    supabase.from("group_join_requests").select("group_id")
      .eq("user_id", userId).eq("status", "pending"),
  ]);

  const memberOf = new Set((memberships ?? []).map((m) => m.group_id));
  const pendingSet = new Set((pendingRequests ?? []).map((r) => r.group_id));

  const publicGroups = (groups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    challenge: Array.isArray(g.group_challenges)
      ? (g.group_challenges[0] ?? null)
      : (g.group_challenges ?? null),
    is_member: memberOf.has(g.id),
    has_pending_request: pendingSet.has(g.id),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/groups"
            className="text-sm text-gray-400 hover:text-brand-600 font-medium transition-colors">
            ← Desafios
          </Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">🌍 Descobrir desafios</h1>
          <p className="page-subtitle">
            Explora desafios públicos e pede adesão — o administrador irá confirmar.
          </p>
        </div>

        <DiscoverGroupList groups={publicGroups} />
      </main>
    </div>
  );
}
