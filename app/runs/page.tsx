import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import RunList from "@/components/RunList";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Run } from "@/types";

export default async function RunsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { new: openNew } = await searchParams;

  const supabase = createAdminClient();
  const { data: runs, error } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) console.error("Error fetching runs:", error.message);

  const safeRuns: Run[] = runs ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="page-header flex items-end justify-between">
          <div>
            <h1 className="page-title">As tuas corridas</h1>
            <p className="page-subtitle">
              {safeRuns.length === 0
                ? "Ainda sem corridas — regista a primeira!"
                : `${safeRuns.length} corrida${safeRuns.length === 1 ? "" : "s"} registada${safeRuns.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        <RunList initialRuns={safeRuns} userId={userId} defaultShowForm={openNew === "1"} />
      </main>
    </div>
  );
}
