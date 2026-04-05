// GET /api/users/search?q=...&groupId=...
// Searches Clerk users by name/email. Filters out existing members
// and users with a pending invitation for the given group.
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const groupId = searchParams.get("groupId") ?? "";

  if (!q || q.length < 2) return NextResponse.json({ users: [] });

  const client = await clerkClient();

  // Search Clerk users
  const { data: clerkUsers } = await client.users.getUserList({ query: q, limit: 10 });

  // Fetch existing members + pending invites for this group to filter them out
  const supabase = createAdminClient();
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase.from("group_members").select("user_id").eq("group_id", groupId),
    supabase.from("group_invitations").select("invited_user_id")
      .eq("group_id", groupId).eq("status", "pending"),
  ]);

  const excluded = new Set([
    userId, // don't show the admin themselves
    ...(members ?? []).map((m) => m.user_id),
    ...(invites ?? []).map((i) => i.invited_user_id),
  ]);

  const users = clerkUsers
    .filter((u) => !excluded.has(u.id))
    .map((u) => ({
      id: u.id,
      display_name:
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        u.emailAddresses[0]?.emailAddress?.split("@")[0] ||
        u.id.slice(0, 8),
      email: u.emailAddresses[0]?.emailAddress ?? "",
    }));

  return NextResponse.json({ users });
}
