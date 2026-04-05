// GET  /api/groups/[groupId]/join-requests — admin view
// POST /api/groups/[groupId]/join-requests — user requests to join
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ groupId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups").select("created_by").eq("id", groupId).single();

  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (group.created_by !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("group_join_requests")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups").select("name, is_public, created_by").eq("id", groupId).single();

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (!group.is_public) return NextResponse.json({ error: "Group is not public" }, { status: 403 });
  if (group.created_by === userId)
    return NextResponse.json({ error: "Já és o administrador deste grupo" }, { status: 409 });

  // Already a member?
  const { data: member } = await supabase
    .from("group_members").select("id")
    .eq("group_id", groupId).eq("user_id", userId).maybeSingle();
  if (member) return NextResponse.json({ error: "Já és membro deste grupo" }, { status: 409 });

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const userName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    userId.slice(0, 8);

  const { data, error } = await supabase
    .from("group_join_requests")
    .upsert(
      { group_id: groupId, user_id: userId, user_name: userName, group_name: group.name, status: "pending" },
      { onConflict: "group_id,user_id" }
    )
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
