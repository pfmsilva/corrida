import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import ProgressChart from "@/components/ProgressChart";
import RunInsights from "@/components/RunInsights";
import DashboardChallenges from "@/components/dashboard/DashboardChallenges";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Run, GroupChallenge } from "@/types";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const firstName =
    clerkUser?.firstName ??
    clerkUser?.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "atleta";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const supabase = createAdminClient();

  // ── Fetch user's runs ──────────────────────────────────────────────────
  const { data: runs } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  const safeRuns: Run[] = runs ?? [];

  // ── Fetch groups + challenges the user belongs to ──────────────────────
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, joined_at, groups(id, name, created_by, group_challenges(*))")
    .eq("user_id", userId);

  // For each group that has a challenge, compute total km by all members
  type RawGroup = {
    id: string;
    name: string;
    created_by: string;
    group_challenges: GroupChallenge[] | GroupChallenge | null;
  };

  const groupsWithChallenges = (memberships ?? [])
    .map((m) => {
      const g = m.groups as unknown as RawGroup | null;
      if (!g) return null;
      const challenge = Array.isArray(g.group_challenges)
        ? (g.group_challenges[0] ?? null)
        : (g.group_challenges ?? null);
      if (!challenge) return null;
      return { group: g, challenge: challenge as GroupChallenge, joinedAt: m.joined_at as string };
    })
    .filter(Boolean) as { group: RawGroup; challenge: GroupChallenge; joinedAt: string }[];

  // Fetch all member IDs and runs for each group in parallel
  const challengeStatuses = await Promise.all(
    groupsWithChallenges.map(async ({ group, challenge, joinedAt }) => {
      // Get all members of this group
      const { data: members } = await supabase
        .from("group_members")
        .select("user_id, joined_at")
        .eq("group_id", group.id);

      const memberIds = (members ?? []).map((m) => m.user_id as string);
      const joinedAtMap: Record<string, string> = {};
      for (const m of members ?? []) {
        joinedAtMap[m.user_id as string] = (m.joined_at as string).slice(0, 10);
      }

      // Build run query with challenge date bounds
      let q = supabase
        .from("runs")
        .select("user_id, distance_km, date")
        .in("user_id", memberIds);
      if (challenge.starts_at) q = q.gte("date", challenge.starts_at);
      if (challenge.ends_at)   q = q.lte("date", challenge.ends_at);

      const { data: groupRuns } = await q;

      const totalKm = (groupRuns ?? [])
        .filter((r) => {
          const isAdmin = r.user_id === group.created_by;
          if (!isAdmin && joinedAtMap[r.user_id] && r.date < joinedAtMap[r.user_id]) return false;
          return true;
        })
        .reduce((sum, r) => sum + Number(r.distance_km), 0);

      return {
        groupId: group.id,
        groupName: group.name,
        challenge,
        totalKm,
        joinedAt,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── Welcome banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br
                        from-brand-600 via-indigo-600 to-indigo-800 p-6 shadow-lg
                        shadow-brand-500/20">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Bem-vindo de volta</p>
              <h1 className="text-2xl font-black text-white mt-0.5">
                Olá, {displayName} 👋
              </h1>
              <p className="text-indigo-200 text-sm mt-1">
                {safeRuns.length === 0
                  ? "Regista a tua primeira corrida para começar."
                  : `${safeRuns.length} corrida${safeRuns.length === 1 ? "" : "s"} registada${safeRuns.length === 1 ? "" : "s"}. Continua assim!`}
              </p>
            </div>
            <Link href="/runs?new=1"
              className="shrink-0 bg-white text-brand-600 font-bold text-sm
                         px-4 py-2.5 rounded-xl hover:bg-brand-50 transition-all
                         duration-200 shadow-sm whitespace-nowrap">
              + Registar
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <section>
          <p className="section-title">Estatísticas</p>
          <StatsBar runs={safeRuns} />
        </section>

        {/* ── Group challenges ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">Os teus desafios</p>
            <Link href="/groups" className="text-xs font-semibold text-brand-600 hover:underline">
              Ver desafios →
            </Link>
          </div>
          <DashboardChallenges challenges={challengeStatuses} />
        </section>

        {/* ── Chart + Insights side by side on lg ── */}
        {safeRuns.length >= 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <section className="lg:col-span-3">
              <p className="section-title">Evolução</p>
              <div className="card">
                <ProgressChart runs={safeRuns} />
              </div>
            </section>

            <section className="lg:col-span-2">
              <p className="section-title">Análise do treinador</p>
              <RunInsights runs={safeRuns} />
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
