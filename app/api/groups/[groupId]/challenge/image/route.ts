// POST /api/groups/[groupId]/challenge/image
// Admin-only: faz upload de uma imagem para o Supabase Storage e devolve o URL público.
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "challenge-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const supabase = createAdminClient();

  // Confirmar que é o admin do grupo
  const { data: group } = await supabase
    .from("groups")
    .select("created_by")
    .eq("id", groupId)
    .single();

  if (!group) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
  if (group.created_by !== userId) {
    return NextResponse.json({ error: "Apenas o admin pode gerir imagens do desafio" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Nenhum ficheiro enviado" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de ficheiro inválido. Use JPEG, PNG ou WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ficheiro demasiado grande. Máximo 5 MB." },
      { status: 400 }
    );
  }

  // Apagar imagem anterior deste grupo (se existir)
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list(groupId);

  if (existing && existing.length > 0) {
    const oldPaths = existing.map((f) => `${groupId}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(oldPaths);
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${groupId}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  revalidatePath(`/groups/${groupId}`);

  return NextResponse.json({ url: publicUrl });
}

// DELETE /api/groups/[groupId]/challenge/image
// Admin-only: remove a imagem do desafio do Storage.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups")
    .select("created_by")
    .eq("id", groupId)
    .single();

  if (!group) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });
  if (group.created_by !== userId) {
    return NextResponse.json({ error: "Apenas o admin pode gerir imagens do desafio" }, { status: 403 });
  }

  const { data: existing } = await supabase.storage.from(BUCKET).list(groupId);
  if (existing && existing.length > 0) {
    const paths = existing.map((f) => `${groupId}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }

  // Limpar image_url no desafio
  await supabase
    .from("group_challenges")
    .update({ image_url: null })
    .eq("group_id", groupId);

  revalidatePath(`/groups/${groupId}`);

  return new NextResponse(null, { status: 204 });
}
