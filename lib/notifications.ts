/**
 * Server-side helpers for creating in-app notifications.
 * Called after a new run is saved to trigger:
 *   - "new_run"  → notify other group members
 *   - "overtake" → notify the member who was passed in the leaderboard
 *   - "goal_80"  → notify everyone when the group hits 80% of target
 *   - "goal_90"  → notify everyone when the group hits 90% of target
 */

import type { SupabaseClient } from "@supabase/supabase-js";

type NotifType = "new_run" | "overtake" | "goal_80" | "goal_90";

interface NotifInsert {
  user_id: string;
  type: NotifType;
  group_id: string;
  message: string;
  data?: Record<string, unknown>;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function computeTotals(
  memberIds: string[],
  runs: { user_id: string; distance_km: number }[]
): Record<string, number> {
  const totals: Record<string, number> = Object.fromEntries(memberIds.map((id) => [id, 0]));
  for (const r of runs) {
    if (r.user_id in totals) totals[r.user_id] += Number(r.distance_km);
  }
  return totals;
}

function rankOf(totals: Record<string, number>): Record<string, number> {
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(sorted.map(([id], i) => [id, i + 1]));
}

// ─── main entry point ────────────────────────────────────────────────────────

/**
 * Trigger notifications for all groups the runner belongs to.
 * Errors per-group are swallowed so a buggy group never blocks others.
 */
export async function triggerRunNotifications(
  runnerId: string,
  distanceKm: number,
  runDate: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", runnerId)
    .single();
  const runnerName: string = profile?.display_name || "Alguém";

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, joined_at")
    .eq("user_id", runnerId);

  if (!memberships?.length) return;

  await Promise.all(
    memberships.map((m) =>
      processGroup(
        runnerId, runnerName, distanceKm, runDate,
        m.group_id, m.joined_at, supabase
      ).catch((e) =>
        console.error(`[notifications] group ${m.group_id}:`, e)
      )
    )
  );
}

// ─── per-group logic ─────────────────────────────────────────────────────────

async function processGroup(
  runnerId: string,
  runnerName: string,
  distanceKm: number,
  runDate: string,
  groupId: string,
  runnerJoinedAt: string,
  supabase: SupabaseClient
): Promise<void> {
  const [{ data: challenge }, { data: membersRaw }, { data: group }] = await Promise.all([
    supabase
      .from("group_challenges")
      .select("target_km, starts_at, ends_at")
      .eq("group_id", groupId)
      .maybeSingle(),
    supabase
      .from("group_members")
      .select("user_id, joined_at")
      .eq("group_id", groupId),
    supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single(),
  ]);

  const members = membersRaw ?? [];
  const others = members.filter((m) => m.user_id !== runnerId);
  const groupName: string = group?.name ?? "desafio";

  const startsAt: string | null = challenge?.starts_at ?? null;
  const endsAt: string | null = challenge?.ends_at ?? null;
  const runInRange =
    (!startsAt || runDate >= startsAt) && (!endsAt || runDate <= endsAt);

  const toInsert: NotifInsert[] = [];

  // ── 1. New-run notification ────────────────────────────────────────────────
  if (runInRange && others.length > 0) {
    const kmStr = distanceKm.toFixed(1).replace(".", ",");
    for (const m of others) {
      toInsert.push({
        user_id: m.user_id,
        type: "new_run",
        group_id: groupId,
        message: `${runnerName} registou uma corrida de ${kmStr} km em "${groupName}"`,
        data: { runner_id: runnerId, distance_km: distanceKm },
      });
    }
  }

  // Without a challenge there is no leaderboard or goal to track
  if (!challenge) {
    if (toInsert.length) await supabase.from("notifications").insert(toInsert);
    return;
  }

  // ── Fetch all member runs (within challenge window) ───────────────────────
  const allRuns: { user_id: string; distance_km: number }[] = [];
  await Promise.all(
    members.map(async (m) => {
      const effectiveStart = startsAt ?? m.joined_at;
      let q = supabase
        .from("runs")
        .select("user_id, distance_km")
        .eq("user_id", m.user_id);
      if (effectiveStart) q = q.gte("date", effectiveStart);
      if (endsAt) q = q.lte("date", endsAt);
      const { data } = await q;
      if (data) allRuns.push(...data);
    })
  );

  const memberIds = members.map((m) => m.user_id);
  const currentTotals = computeTotals(memberIds, allRuns);

  // "Before" state: subtract this run from the runner's total if it counted
  const prevTotals = { ...currentTotals };
  if (runInRange) {
    prevTotals[runnerId] = Math.max(0, (prevTotals[runnerId] ?? 0) - distanceKm);
  }

  // ── 2. Overtake notification ──────────────────────────────────────────────
  if (runInRange && others.length > 0) {
    const prevRanks = rankOf(prevTotals);
    const currRanks = rankOf(currentTotals);
    const runnerPrev = prevRanks[runnerId] ?? members.length;
    const runnerCurr = currRanks[runnerId] ?? members.length;

    if (runnerCurr < runnerPrev) {
      for (const m of others) {
        const prevR = prevRanks[m.user_id] ?? members.length;
        const currR = currRanks[m.user_id] ?? members.length;
        // Member was ahead of runner before, and is now behind (or tied lower)
        if (prevR < runnerPrev && currR >= runnerCurr) {
          toInsert.push({
            user_id: m.user_id,
            type: "overtake",
            group_id: groupId,
            message: `${runnerName} ultrapassou-te no leaderboard de "${groupName}"!`,
            data: { runner_id: runnerId },
          });
        }
      }
    }
  }

  // ── 3. Goal milestones (80% / 90%) ────────────────────────────────────────
  if (runInRange && challenge.target_km) {
    const target = Number(challenge.target_km);
    const totalBefore = Object.values(prevTotals).reduce((s, v) => s + v, 0);
    const totalAfter = Object.values(currentTotals).reduce((s, v) => s + v, 0);

    for (const [type, threshold] of [
      ["goal_80", 0.8],
      ["goal_90", 0.9],
    ] as [NotifType, number][]) {
      const thresholdKm = target * threshold;
      if (totalBefore < thresholdKm && totalAfter >= thresholdKm) {
        // Deduplicate: only send once per group per milestone
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("group_id", groupId)
          .eq("type", type)
          .limit(1);

        if (!existing?.length) {
          const pct = Math.round(threshold * 100);
          const remaining = Math.max(0, target - totalAfter)
            .toFixed(1)
            .replace(".", ",");
          for (const m of members) {
            toInsert.push({
              user_id: m.user_id,
              type,
              group_id: groupId,
              message:
                `O grupo "${groupName}" atingiu ${pct}% do objetivo! ` +
                `Faltam ${remaining} km para a meta.`,
              data: { target_km: target, current_km: totalAfter },
            });
          }
        }
      }
    }
  }

  if (toInsert.length) {
    await supabase.from("notifications").insert(toInsert);
  }
}
