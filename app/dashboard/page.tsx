import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import ProgressChart from "@/components/ProgressChart";
import RunInsights from "@/components/RunInsights";
import type { Run } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: runs, error } = await supabase
    .from("runs").select("*").eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) console.error("Error fetching runs:", error.message);

  const safeRuns: Run[] = runs ?? [];

  const firstName = user.email?.split("@")[0].split(".")[0] ?? "atleta";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email ?? ""} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── Welcome banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br
                        from-brand-600 via-indigo-600 to-indigo-800 p-6 shadow-lg
                        shadow-brand-500/20">
          {/* Orb decorativo */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Bem-vindo de volta</p>
              <h1 className="text-2xl font-black text-white mt-0.5">
                Olá, {displayName} 👋
              </h1>
              <p className="text-indigo-200 text-sm mt-1">
                {safeRuns.length === 0
                  ? "Regista a tua primeira corrida para começar."
                  : `${safeRuns.length} corrida${safeRuns.length === 1 ? "" : "s"} registada${safeRuns.length === 1 ? "" : "s"}. Continua assim!`}
              </p>
            </div>
            <Link href="/runs"
              className="shrink-0 bg-white text-brand-600 font-bold text-sm
                         px-4 py-2.5 rounded-xl hover:bg-brand-50 transition-all
                         duration-200 shadow-sm whitespace-nowrap">
              + Registar
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <section>
          <p className="section-title">Estatísticas</p>
          <StatsBar runs={safeRuns} />
        </section>

        {/* ── Chart + Insights side by side on lg ── */}
        {safeRuns.length >= 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <section className="lg:col-span-3">
              <p className="section-title">Evolução</p>
              <div className="card">
                <ProgressChart runs={safeRuns} />
              </div>
            </section>

            <section className="lg:col-span-2">
              <p className="section-title">Análise do treinador</p>
              <RunInsights runs={safeRuns} />
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
