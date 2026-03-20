// =========================================================
// Shared TypeScript types used across the app
// =========================================================

/** A run record returned from Supabase */
export interface Run {
  id: string;
  user_id: string;
  date: string;           // ISO date string "YYYY-MM-DD"
  distance_km: number;
  duration_min: number;
  pace_min_per_km: number; // generated column — always min/km
  notes: string | null;
  created_at: string;
}

/** Shape of the form the user fills in to log a run */
export interface RunFormValues {
  date: string;
  distance_km: string;   // kept as string for <input> compatibility
  duration_min: string;
  notes: string;
}

// ── Groups & Challenges ────────────────────────────────────────────────────

/** Public profile row — one per auth user */
export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

/** A running group */
export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

/** Membership record — user ↔ group */
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  profiles?: Pick<Profile, "display_name">; // populated via Supabase join
}

/** Challenge attached to a group (one per group) */
export interface GroupChallenge {
  id: string;
  group_id: string;
  target_km: number;
  reward: string;
  starts_at: string | null; // ISO date "YYYY-MM-DD"
  ends_at: string | null;   // ISO date "YYYY-MM-DD"
  updated_at: string;
}

/** Run enriched with the runner's display name — used in the group feed */
export interface FeedRun extends Run {
  display_name: string;
}

/** Invitation to join a group */
export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_user_id: string;
  invited_by: string;
  invited_user_name: string;
  group_name: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
}

/** User result from search */
export interface UserSearchResult {
  id: string;
  display_name: string;
  email: string;
}

/** Leaderboard row — member ranked by total distance */
export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_km: number;
  run_count: number;
  rank: number;
}
