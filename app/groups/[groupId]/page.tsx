// Group hub — the main page for a single group.
// Shows: challenge progress, leaderboard, and group feed.
// Server Component: fetches all data and passes to client components.
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ChallengeCard from "@/components/groups/ChallengeCard";
import Leaderboard from "@/components/groups/Leaderboard";
import GroupFeed from "@/components/groups/GroupFeed";
import type {
  Group,
  GroupMember,
  GroupChallenge,
  FeedRun,
  LeaderboardEntry,
  Profile,
} from "@/types";

export default async function GroupHubPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  // Next.js 15: params is a Promise — must be awaited
  const { groupId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ── 1. Fetch group + verify membership ────────────────────────────────
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  // RLS returns nothing if the user is not a member
  if (!group) notFound();

  // ── 2. Fetch members + their profiles in one query ────────────────────
  const { data: members } = await supabase
    .from("group_members")
    .select("*, profiles(display_name)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  const safeMembers = (members ?? []) as (GroupMember & {
    profiles: Pick<Profile, "display_name"> | null;
  })[];

  const memberIds = safeMembers.map((m) => m.user_id);

  // Map user_id → display_name for quick lookup
  const profileMap: Record<string, string> = {};
  // Map user_id → joined_at date string (YYYY-MM-DD) for run filtering
  const joinedAtMap: Record<string, string> = {};
  for (const m of safeMembers) {
    profileMap[m.user_id] = m.profiles?.display_name ?? m.user_id.slice(0, 8);
    joinedAtMap[m.user_id] = m.joined_at.slice(0, 10);
  }

  // ── 3. Fetch group challenge ──────────────────────────────────────────
  const { data: challenge } = await supabase
    .from("group_challenges")
    .select("*")
    .eq("group_id", groupId)
    .maybeSingle();

  // ── 4. Fetch all runs for group members ───────────────────────────────
  // This works because groups_schema.sql added a new RLS policy to `runs`
  // that allows group members to read each other's runs.
  const { data: runs } = await supabase
    .from("runs")
    .select("*")
    .in("user_id", memberIds)
    .order("date", { ascending: false })
    .limit(200);

  // Only keep runs made on or after the member's joined_at date
  const safeRuns = (runs ?? []).filter(
    (r) => !joinedAtMap[r.user_id] || r.date >= joinedAtMap[r.user_id]
  );

  // ── 5. Build feed (runs + display name) ──────────────────────────────
  const feedRuns: FeedRun[] = safeRuns.slice(0, 50).map((r) => ({
    ...r,
    display_name: profileMap[r.user_id] ?? "Desconhecido",
  }));

  // ── 6. Compute leaderboard ────────────────────────────────────────────
  const totalGroupKm = safeRuns.reduce(
    (sum, r) => sum + Number(r.distance_km),
    0
  );

  const leaderboard: LeaderboardEntry[] = memberIds
    .map((uid) => {
      const userRuns = safeRuns.filter((r) => r.user_id === uid);
      return {
        user_id: uid,
        display_name: profileMap[uid] ?? "Desconhecido",
        total_km: userRuns.reduce((s, r) => s + Number(r.distance_km), 0),
        run_count: userRuns.length,
        rank: 0, // assigned below after sort
      };
    })
    .sort((a, b) => b.total_km - a.total_km)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const isAdmin = group.created_by === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ── Group header ── */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/groups"
              className="text-xs text-gray-400 hover:text-brand-600 mb-1 block"
            >
              ← Todos os grupos
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {(group as Group).name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {safeMembers.length} membro
              {safeMembers.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Share the group ID so others can join */}
            <button
              id="copy-group-id"
              data-group-id={groupId}
              className="btn-ghost text-xs"
              onClick={undefined} // handled client-side via inline script below
            >
              📋 Copiar ID
            </button>

            {isAdmin && (
              <Link
                href={`/groups/${groupId}/admin`}
                className="btn-ghost text-xs"
              >
                ⚙️ Admin
              </Link>
            )}
          </div>
        </div>

        {/* Copy-to-clipboard inline script (avoids a full client component for one button) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('copy-group-id')?.addEventListener('click', function() {
                navigator.clipboard.writeText('${groupId}');
                this.textContent = '✅ Copiado!';
                setTimeout(() => { this.textContent = '📋 Copiar ID'; }, 2000);
              });
            `,
          }}
        />

        {/* ── Challenge progress card ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Desafio do grupo
          </h2>
          <ChallengeCard
            challenge={challenge as GroupChallenge | null}
            totalKm={totalGroupKm}
            isAdmin={isAdmin}
            groupId={groupId}
          />
        </section>

        {/* ── Leaderboard ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Classificação
          </h2>
          <Leaderboard entries={leaderboard} currentUserId={user.id} />
        </section>

        {/* ── Group feed ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Feed do grupo
          </h2>
          <GroupFeed initialRuns={feedRuns} />
        </section>
      </main>
    </div>
  );
}
