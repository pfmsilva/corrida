// PUT /api/groups/[groupId]/challenge
// Admin-only: create or update the challenge for a group.
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const supabase = createAdminClient();

  // Confirm the current user is the group creator (admin)
  const { data: group } = await supabase
    .from("groups")
    .select("created_by")
    .eq("id", groupId)
    .single();

  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
  if (group.created_by !== userId) {
    return NextResponse.json({ error: "Only the group admin can set the challenge" }, { status: 403 });
  }

  const { target_km, reward, starts_at, ends_at, image_url } = await request.json() as {
    target_km: number;
    reward: string;
    starts_at: string | null;
    ends_at: string | null;
    image_url?: string | null;
  };

  if (!target_km || target_km <= 0) {
    return NextResponse.json({ error: "target_km must be a positive number" }, { status: 400 });
  }
  if (!reward?.trim()) {
    return NextResponse.json({ error: "Reward description is required" }, { status: 400 });
  }
  if (starts_at && ends_at && ends_at <= starts_at) {
    return NextResponse.json({ error: "A data de fim deve ser posterior à data de início" }, { status: 400 });
  }

  const { data: challenge, error } = await supabase
    .from("group_challenges")
    .upsert(
      {
        group_id: groupId,
        target_km,
        reward: reward.trim(),
        starts_at: starts_at ?? null,
        ends_at: ends_at ?? null,
        ...(image_url !== undefined ? { image_url: image_url ?? null } : {}),
      },
      { onConflict: "group_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(challenge);
}
