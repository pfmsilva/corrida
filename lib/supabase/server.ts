// Server-side Supabase client.
// Use this inside Server Components, Route Handlers, and Server Actions.
// Note: cookies() is async in Next.js 15, so this function must be awaited.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // In Next.js 15, cookies() returns a Promise — await it first
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies from the incoming request
        getAll() {
          return cookieStore.getAll();
        },
        // Write / refresh session cookies in the response
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can throw inside read-only contexts (e.g. static rendering).
            // The middleware handles refreshing the session for those cases.
          }
        },
      },
    }
  );
}
