// Página de corridas — lista completa das corridas do utilizador.
// Server Component: fetches runs server-side, passa para RunList.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import RunList from "@/components/RunList";
import type { Run } from "@/types";

export default async function RunsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: runs, error } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) console.error("Error fetching runs:", error.message);

  const safeRuns: Run[] = runs ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">As tuas corridas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {safeRuns.length === 0
              ? "Ainda sem corridas — regista a primeira!"
              : `${safeRuns.length} corrida${safeRuns.length === 1 ? "" : "s"} registada${safeRuns.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <RunList initialRuns={safeRuns} userId={user.id} />
      </main>
    </div>
  );
}
