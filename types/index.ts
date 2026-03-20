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
