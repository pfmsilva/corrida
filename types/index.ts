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
  is_public: boolean;
}

/** Request to join a public group */
export interface GroupJoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  group_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
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
  image_url: string | null; // Supabase Storage public URL
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

// ── Gamification ───────────────────────────────────────────────────────────

/** A badge awarded to a user for an achievement */
export interface Badge {
  id: "first_run" | "weekly_10k" | "top_runner";
  emoji: string;
  label: string;
  description: string;
}

/** In-app notification (new run, overtake, goal milestone) */
export interface AppNotification {
  id: string;
  user_id: string;
  type: "new_run" | "overtake" | "goal_80" | "goal_90";
  group_id: string | null;
  message: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
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
  badges: Badge[];   // earned gamification badges
  streak: number;    // consecutive running days (0 = no active streak)
}
