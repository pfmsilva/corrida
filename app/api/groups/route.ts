// POST /api/groups
// Creates a new group and automatically adds the creator as the first member.
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json() as { name: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Ensure the creator has a profile in the DB
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

  // 1. Create the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name: name.trim(), created_by: userId })
    .select()
    .single();

  if (groupError || !group) {
    return NextResponse.json({ error: groupError?.message ?? "Failed to create group" }, { status: 500 });
  }

  // 2. Add the creator as the first member
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: userId });

  if (memberError) {
    await supabase.from("groups").delete().eq("id", group.id);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json(group, { status: 201 });
}
