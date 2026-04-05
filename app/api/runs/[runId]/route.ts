import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Verify ownership before deleting
  const { data: run } = await supabase
    .from("runs")
    .select("user_id")
    .eq("id", runId)
    .single();

  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (run.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("runs").delete().eq("id", runId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalidate group pages so feed + leaderboard reflect the deletion immediately
  revalidatePath("/groups", "layout");
  revalidatePath("/dashboard");

  return new NextResponse(null, { status: 204 });
}
