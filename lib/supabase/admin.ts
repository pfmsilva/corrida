// Supabase client with service role key — bypasses RLS.
// Use only in server-side code (API routes, Server Components).
// Authorization must be handled explicitly in application code via Clerk.
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
