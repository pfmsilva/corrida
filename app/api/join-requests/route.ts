// GET /api/join-requests — pending join requests for groups where user is admin
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Groups where current user is admin
  const { data: adminGroups } = await supabase
    .from("groups").select("id").eq("created_by", userId);

  if (!adminGroups?.length) return NextResponse.json([]);

  const groupIds = adminGroups.map((g) => g.id);

  const { data, error } = await supabase
    .from("group_join_requests")
    .select("*")
    .in("group_id", groupIds)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
