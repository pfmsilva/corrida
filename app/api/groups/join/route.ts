// POST /api/groups/join
// Lets any authenticated user join a group by its ID.
// Users share the group ID as an invite link.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await request.json() as { groupId: string };
  if (!groupId) {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 });
  }

  // Verify the group exists (the select will return nothing if it doesn't — RLS
  // for groups only shows groups the user belongs to, so we bypass with a direct
  // count on group_members which has no such restriction at the row level)
  // We use a service-agnostic approach: just attempt the insert and handle the FK error.
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: user.id });

  if (error) {
    // Unique violation = already a member
    if (error.code === "23505") {
      return NextResponse.json({ error: "You are already a member of this group" }, { status: 409 });
    }
    // FK violation = group doesn't exist
    if (error.code === "23503") {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ groupId }, { status: 200 });
}
