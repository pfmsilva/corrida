// PATCH /api/invitations/[invitationId] — accept or decline
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invitationId } = await params;
  const { status } = await request.json() as { status: "accepted" | "declined" };

  if (status !== "accepted" && status !== "declined")
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const supabase = createAdminClient();

  // Fetch the invitation and verify it belongs to this user
  const { data: invitation } = await supabase
    .from("group_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("invited_user_id", userId)
    .eq("status", "pending")
    .single();

  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });

  // Update status
  const { error: updateError } = await supabase
    .from("group_invitations")
    .update({ status })
    .eq("id", invitationId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // If accepted: ensure profile exists and add to group_members
  if (status === "accepted") {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
      userId.slice(0, 8);

    await supabase
      .from("profiles")
      .upsert({ id: userId, display_name: displayName }, { onConflict: "id" });

    await supabase
      .from("group_members")
      .upsert(
        { group_id: invitation.group_id, user_id: userId },
        { onConflict: "group_id,user_id" }
      );
  }

  return NextResponse.json({ ok: true });
}
