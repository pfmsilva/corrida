// =========================================================
// Utility helpers shared across the app
// =========================================================

/**
 * Formats a decimal pace (min/km) into a human-readable "M:SS /km" string.
 * Example: 5.5 → "5:30 /km"
 */
export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
}

/**
 * Formats a decimal duration (minutes) into "Xh Ym" or "Ym" string.
 * Example: 75.5 → "1h 15m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Formats an ISO date string to a locale-friendly short date.
 * Example: "2024-03-15" → "Mar 15, 2024"
 */
export function formatDate(isoDate: string): string {
  // Append T00:00 to avoid timezone-shifting the date
  return new Date(`${isoDate}T00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns today's date as an ISO string "YYYY-MM-DD" in local time.
 * Useful as a default value for the date input in the run form.
 */
export function todayISO(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
