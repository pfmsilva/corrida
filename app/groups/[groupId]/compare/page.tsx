// Comparison page — side-by-side member progress for up to 3 users.
// Server Component: fetches all group data and passes to ComparisonDashboard.
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ComparisonDashboard from "@/components/groups/ComparisonDashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Group, GroupMember, GroupChallenge, Profile } from "@/types";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  // ── Auth: must be a member ────────────────────────────────────────────────
  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) notFound();

  // ── Data fetching ─────────────────────────────────────────────────────────
  const [{ data: group }, { data: members }, { data: challenge }] =
    await Promise.all([
      supabase.from("groups").select("*").eq("id", groupId).single(),
      supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .order("joined_at", { ascending: true }),
      supabase
        .from("group_challenges")
        .select("*")
        .eq("group_id", groupId)
        .maybeSingle(),
    ]);

  if (!group) notFound();

  const safeMembers = (members ?? []) as GroupMember[];
  const memberIds = safeMembers.map((m) => m.user_id);

  // Profiles
  const { data: profileRows } = memberIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", memberIds)
    : { data: [] as Pick<Profile, "id" | "display_name">[] };

  const profileMap: Record<string, string> = {};
  for (const p of (profileRows ?? [])) profileMap[p.id] = p.display_name;

  // Fall back to truncated user_id if no profile
  const joinedAtMap: Record<string, string> = {};
  for (const m of safeMembers) {
    joinedAtMap[m.user_id] = m.joined_at.slice(0, 10);
    if (!profileMap[m.user_id]) profileMap[m.user_id] = m.user_id.slice(0, 8);
  }

  // Challenge window
  const ch = challenge as GroupChallenge | null;
  const challengeStart = ch?.starts_at ?? null;
  const challengeEnd = ch?.ends_at ?? null;

  // Runs (filtered by challenge window if set)
  let runsQuery = supabase
    .from("runs")
    .select("id, user_id, date, distance_km")
    .in("user_id", memberIds)
    .order("date", { ascending: true });

  if (challengeStart) runsQuery = runsQuery.gte("date", challengeStart);
  if (challengeEnd) runsQuery = runsQuery.lte("date", challengeEnd);

  const { data: runs } = await runsQuery;

  // Apply per-member joined_at filter (non-admin members only)
  const adminId = (group as Group).created_by;
  const safeRuns = (runs ?? []).filter((r) => {
    if (r.user_id !== adminId && joinedAtMap[r.user_id] && r.date < joinedAtMap[r.user_id])
      return false;
    return true;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Link
          href={`/groups/${groupId}`}
          className="text-sm text-gray-400 hover:text-brand-600 inline-flex
                     items-center gap-1 font-medium transition-colors"
        >
          ← Voltar a {(group as Group).name}
        </Link>

        <div className="page-header">
          <h1 className="page-title">📊 Comparação de membros</h1>
          <p className="page-subtitle">
            Seleciona até 3 membros para comparar o progresso lado a lado.
          </p>
        </div>

        {memberIds.length < 2 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold text-gray-700">Membros insuficientes</p>
            <p className="text-sm text-gray-400 mt-1">
              É necessário pelo menos 2 membros para usar a comparação.
            </p>
          </div>
        ) : (
          <ComparisonDashboard
            memberIds={memberIds}
            profileMap={profileMap}
            currentUserId={userId}
            runs={safeRuns}
          />
        )}
      </main>
    </div>
  );
}
