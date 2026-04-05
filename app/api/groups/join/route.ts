// POST /api/groups/join
// Lets any authenticated user join a group by its ID.
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await request.json() as { groupId: string };
  if (!groupId) {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Ensure the user has a profile in the DB
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const displayName =
    clerkUser.firstName ??
    clerkUser.username ??
    clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    userId.slice(0, 8);

  await supabase
    .from("profiles")
    .upsert({ id: userId, display_name: displayName }, { onConflict: "id" });

  // Verify the group exists
  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You are already a member of this group" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ groupId }, { status: 200 });
}
