// POST /api/groups
// Creates a new group and automatically adds the creator as the first member.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json() as { name: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 });
  }

  // 1. Create the group (RLS: created_by must equal auth.uid())
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name: name.trim(), created_by: user.id })
    .select()
    .single();

  if (groupError || !group) {
    return NextResponse.json({ error: groupError?.message ?? "Failed to create group" }, { status: 500 });
  }

  // 2. Add the creator as the first member
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: user.id });

  if (memberError) {
    // Group was created but membership insert failed — clean up
    await supabase.from("groups").delete().eq("id", group.id);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json(group, { status: 201 });
}
