// Dashboard — the main protected page.
// Server Component: fetches runs server-side, passes to Client Components.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import ProgressChart from "@/components/ProgressChart";
import RunInsights from "@/components/RunInsights";
import Link from "next/link";
import type { Run } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verify auth — middleware guards the route, but we need the user for DB queries
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

  if (error) console.error("Error fetching runs:", error.message);

  const safeRuns: Run[] = runs ?? [];

  // Derive first-name from email (e.g. "paulo@..." → "Paulo") for the greeting
  const firstName =
    user.email?.split("@")[0].split(".")[0] ?? "runner";
  const displayName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ── Welcome header ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {displayName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {safeRuns.length === 0
              ? "Regista a tua primeira corrida para começar."
              : `Tens ${safeRuns.length} corrida${safeRuns.length === 1 ? "" : "s"} registada${safeRuns.length === 1 ? "" : "s"}. Continua assim!`}
          </p>
        </div>

        {/* ── Metric cards ── */}
        <StatsBar runs={safeRuns} />

        {/* ── Progress chart — shown as soon as there is at least 1 run ── */}
        {safeRuns.length >= 1 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Evolução ao longo do tempo
            </h2>
            <div className="card">
              <ProgressChart runs={safeRuns} />
            </div>
          </section>
        )}

        {/* ── AI insights — shown when there is at least 1 run ── */}
        {safeRuns.length >= 1 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Análise do treinador
            </h2>
            <RunInsights runs={safeRuns} />
          </section>
        )}

        {/* ── Link rápido para registar corrida ── */}
        <Link href="/runs" className="btn-primary w-full text-center block">
          + Registar corrida
        </Link>
      </main>
    </div>
  );
}
