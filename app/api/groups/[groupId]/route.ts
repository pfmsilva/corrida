// PATCH /api/groups/[groupId] — update group settings (is_public)
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups").select("created_by").eq("id", groupId).single();

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.created_by !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json() as { is_public?: boolean };

  const { data, error } = await supabase
    .from("groups")
    .update({ is_public: body.is_public })
    .eq("id", groupId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
