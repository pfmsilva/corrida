// PATCH /api/groups/[groupId]/join-requests/[requestId] — admin approves or rejects
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string; requestId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId, requestId } = await params;
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups").select("created_by").eq("id", groupId).single();

  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (group.created_by !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await request.json() as { status: "approved" | "rejected" };
  if (status !== "approved" && status !== "rejected")
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { data: joinReq } = await supabase
    .from("group_join_requests")
    .select("*").eq("id", requestId).eq("group_id", groupId).single();

  if (!joinReq) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  await supabase.from("group_join_requests").update({ status }).eq("id", requestId);

  if (status === "approved") {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(joinReq.user_id);
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
      joinReq.user_id.slice(0, 8);

    await supabase.from("profiles")
      .upsert({ id: joinReq.user_id, display_name: displayName }, { onConflict: "id" });

    await supabase.from("group_members")
      .upsert({ group_id: groupId, user_id: joinReq.user_id }, { onConflict: "group_id,user_id" });
  }

  return NextResponse.json({ ok: true });
}
