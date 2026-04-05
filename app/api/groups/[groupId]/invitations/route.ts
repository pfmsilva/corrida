// GET  /api/groups/[groupId]/invitations — admin view (all invitations)
// POST /api/groups/[groupId]/invitations — admin sends an invite
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

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.created_by !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: invitations, error } = await supabase
    .from("group_invitations")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(invitations ?? []);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups").select("created_by, name").eq("id", groupId).single();

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.created_by !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId: inviteeId } = await request.json() as { userId: string };
  if (!inviteeId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  // Check not already a member
  const { data: existing } = await supabase
    .from("group_members").select("id")
    .eq("group_id", groupId).eq("user_id", inviteeId).maybeSingle();
  if (existing) return NextResponse.json({ error: "Utilizador já é membro do grupo" }, { status: 409 });

  // Get invitee display name from Clerk
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(inviteeId);
  const invitedUserName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    inviteeId.slice(0, 8);

  const { data, error } = await supabase
    .from("group_invitations")
    .upsert(
      {
        group_id: groupId,
        invited_user_id: inviteeId,
        invited_by: userId,
        invited_user_name: invitedUserName,
        group_name: group.name,
        status: "pending",
      },
      { onConflict: "group_id,invited_user_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
