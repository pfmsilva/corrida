// Group hub — the main page for a single group.
// Shows: challenge progress, leaderboard, and group feed.
// Server Component: fetches all data and passes to client components.
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ChallengeCard from "@/components/groups/ChallengeCard";
import Leaderboard from "@/components/groups/Leaderboard";
import GroupFeed from "@/components/groups/GroupFeed";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const { groupId } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  // Verify membership manually (no RLS — admin client)
  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) notFound();

  // ── 1. Fetch group ────────────────────────────────────────────────────
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

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

  const challengeStart = (challenge as GroupChallenge | null)?.starts_at ?? null;
  const challengeEnd   = (challenge as GroupChallenge | null)?.ends_at   ?? null;

  // ── 4. Fetch runs for group members ──────────────────────────────────
  // Date bounds are applied at DB level so nunca perdemos corridas por causa do limite.
  // Lower bound: o mais tardio entre o joined_at de cada membro e o início do desafio.
  // Para a query usamos o mínimo dos joined_at e o starts_at (pior caso mais antigo),
  // o filtro fino por membro faz-se no cliente abaixo.
  const earliestJoinedAt = Object.values(joinedAtMap).sort()[0] ?? null;
  const dbDateFrom = [earliestJoinedAt, challengeStart]
    .filter(Boolean)
    .reduce<string | null>((a, b) => (!a || b! < a ? b : a), null); // mínimo

  let runsQuery = supabase
    .from("runs")
    .select("*")
    .in("user_id", memberIds)
    .order("date", { ascending: false });

  if (dbDateFrom)  runsQuery = runsQuery.gte("date", dbDateFrom);
  if (challengeEnd) runsQuery = runsQuery.lte("date", challengeEnd);

  const { data: runs } = await runsQuery;

  // Filtro fino por membro: cada corrida tem de ocorrer após o joined_at do próprio
  // membro E dentro do período do desafio (starts_at já garante o DB, mas confirmed aqui).
  const safeRuns = (runs ?? []).filter((r) => {
    if (joinedAtMap[r.user_id] && r.date < joinedAtMap[r.user_id]) return false;
    if (challengeStart && r.date < challengeStart) return false;
    if (challengeEnd   && r.date > challengeEnd)   return false;
    return true;
  });

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

  const isAdmin = group.created_by === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── Group header banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br
                        from-indigo-900 via-indigo-700 to-brand-600 p-6 shadow-lg
                        shadow-indigo-500/20">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-8 bottom-0 w-20 h-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            <Link href="/groups"
              className="text-indigo-200 hover:text-white text-xs font-medium
                         transition-colors mb-3 inline-flex items-center gap-1">
              ← Todos os grupos
            </Link>
            <div className="flex items-start justify-between gap-4 mt-1">
              <div>
                <h1 className="text-2xl font-black text-white">{(group as Group).name}</h1>
                <p className="text-indigo-200 text-sm mt-0.5">
                  {safeMembers.length} membro{safeMembers.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="copy-group-id"
                  data-group-id={groupId}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium
                             px-3 py-1.5 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  onClick={undefined}
                >
                  📋 Copiar ID
                </button>
                {isAdmin && (
                  <Link href={`/groups/${groupId}/admin`}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium
                               px-3 py-1.5 rounded-lg transition-all duration-200 backdrop-blur-sm">
                    ⚙️ Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copy-to-clipboard inline script */}
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

        {/* ── Challenge + Leaderboard side by side on lg ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <p className="section-title">Desafio do grupo</p>
            <ChallengeCard
              challenge={challenge as GroupChallenge | null}
              totalKm={totalGroupKm}
              isAdmin={isAdmin}
              groupId={groupId}
            />
          </section>

          <section>
            <p className="section-title">Classificação</p>
            <Leaderboard entries={leaderboard} currentUserId={user.id} />
          </section>
        </div>

        {/* ── Group feed ── */}
        <section>
          <p className="section-title">Feed do grupo</p>
          <GroupFeed initialRuns={feedRuns} />
        </section>
      </main>
    </div>
  );
}
