/**
 * Gamification business logic — pure functions, no DB calls.
 *
 * Exports:
 *   computeBadges    — badges earned by a user
 *   computeStreak    — consecutive running-day streak
 *   buildDailyComparison — Recharts-ready daily-distance rows for N users
 */

import type { Badge } from "@/types";

// ─── Types used internally ────────────────────────────────────────────────────

type RunLike = { date: string; distance_km: number | string };

// ─── Badge computation ────────────────────────────────────────────────────────

/**
 * Return the badges earned by a user.
 * @param runs        Runs within the relevant period (challenge or all-time)
 * @param isTopRunner True when this user holds rank 1 in the group
 */
export function computeBadges(runs: RunLike[], isTopRunner: boolean): Badge[] {
  const badges: Badge[] = [];

  if (runs.length >= 1) {
    badges.push({
      id: "first_run",
      emoji: "👟",
      label: "Primeira corrida",
      description: "Registaste a tua primeira corrida",
    });
  }

  if (hasKmInWeek(runs, 10)) {
    badges.push({
      id: "weekly_10k",
      emoji: "🔟",
      label: "10 km / semana",
      description: "Correste 10 km ou mais numa só semana",
    });
  }

  if (isTopRunner) {
    badges.push({
      id: "top_runner",
      emoji: "🏆",
      label: "Top runner",
      description: "Líder do grupo em distância total",
    });
  }

  return badges;
}

// ─── Streak computation ───────────────────────────────────────────────────────

/**
 * Count the current consecutive-day running streak.
 * A streak is "alive" only if the user ran today or yesterday.
 */
export function computeStreak(runs: { date: string }[]): number {
  if (runs.length === 0) return 0;

  const uniqueDates = [...new Set(runs.map((r) => r.date))].sort((a, b) =>
    b.localeCompare(a)
  );

  const todayStr = utcToday();
  const yesterdayStr = shiftDay(todayStr, -1);

  // Streak is only active if ran today or yesterday
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === shiftDay(uniqueDates[i - 1], -1)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Comparison chart data ────────────────────────────────────────────────────

export type ChartRow = { date: string } & Record<string, number>;

/**
 * Build a Recharts-friendly dataset for a multi-user daily-distance line chart.
 *
 * Each row: { date: "YYYY-MM-DD", [userId]: km_that_day, … }
 * Dates with no run for a given user are filled with 0.
 */
export function buildDailyComparison(
  userIds: string[],
  runs: { user_id: string; date: string; distance_km: number | string }[]
): ChartRow[] {
  const dateSet = new Set<string>();
  const byUserDate: Record<string, Record<string, number>> = {};

  for (const uid of userIds) byUserDate[uid] = {};

  for (const r of runs) {
    if (!userIds.includes(r.user_id)) continue;
    dateSet.add(r.date);
    byUserDate[r.user_id][r.date] =
      (byUserDate[r.user_id][r.date] ?? 0) + Number(r.distance_km);
  }

  return [...dateSet]
    .sort()
    .map((date) => {
      const row: ChartRow = { date };
      for (const uid of userIds) row[uid] = byUserDate[uid][date] ?? 0;
      return row;
    });
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD (UTC). */
function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD date string by ±N days. */
function shiftDay(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z"); // noon UTC avoids DST edge cases
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Return true if any rolling 7-day window in `runs` totals ≥ targetKm.
 */
function hasKmInWeek(runs: RunLike[], targetKm: number): boolean {
  if (!runs.length) return false;

  const sorted = [...runs]
    .map((r) => ({ date: r.date, km: Number(r.distance_km) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sorted.length; i++) {
    const windowEnd = shiftDay(sorted[i].date, 7);
    let total = 0;
    for (let j = i; j < sorted.length && sorted[j].date <= windowEnd; j++) {
      total += sorted[j].km;
      if (total >= targetKm) return true;
    }
  }
  return false;
}
