import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, distance_km, duration_min, notes } = body;

  if (!date || !distance_km || !duration_min) {
    return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("runs")
    .insert({
      user_id: userId,
      date,
      distance_km: parseFloat(distance_km),
      duration_min: parseFloat(duration_min),
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
