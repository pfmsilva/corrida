// Dashboard — the main protected page.
// This is a Server Component: it fetches the user's runs server-side
// and passes them down to Client Components for interactivity.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import RunList from "@/components/RunList";
import ProgressChart from "@/components/ProgressChart";
import type { Run } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verify the user is authenticated (middleware already guards this,
  // but we also need the user object to scope our DB query)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all runs for the logged-in user, newest first
  const { data: runs, error } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching runs:", error.message);
  }

  const safeRuns: Run[] = runs ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Summary statistics */}
        <StatsBar runs={safeRuns} />

        {/* Progress chart — only shown when there are at least 2 runs */}
        {safeRuns.length >= 2 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Progress over time
            </h2>
            <div className="card">
              <ProgressChart runs={safeRuns} />
            </div>
          </section>
        )}

        {/* Run list with the inline "Add run" form */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Your runs
          </h2>
          {/* RunList is a Client Component so it can manage the form + optimistic updates */}
          <RunList initialRuns={safeRuns} userId={user.id} />
        </section>
      </main>
    </div>
  );
}
