// GET /api/groups/discover — list public groups with challenge info
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const [
    { data: groups },
    { data: memberships },
    { data: pendingRequests },
  ] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, created_by, created_at, is_public, group_challenges(target_km, starts_at, ends_at)")
      .eq("is_public", true)
      .order("created_at", { ascending: false }),
    supabase.from("group_members").select("group_id").eq("user_id", userId),
    supabase.from("group_join_requests").select("group_id, status")
      .eq("user_id", userId).in("status", ["pending"]),
  ]);

  const memberOf = new Set((memberships ?? []).map((m) => m.group_id));
  const pendingSet = new Set((pendingRequests ?? []).map((r) => r.group_id));

  const result = (groups ?? []).map((g) => ({
    ...g,
    challenge: Array.isArray(g.group_challenges)
      ? g.group_challenges[0] ?? null
      : g.group_challenges ?? null,
    is_member: memberOf.has(g.id),
    has_pending_request: pendingSet.has(g.id),
  }));

  return NextResponse.json(result);
}
