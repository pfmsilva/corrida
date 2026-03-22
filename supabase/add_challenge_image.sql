-- =========================================================
-- Adiciona imagem ao desafio de grupo
-- =========================================================

-- 1. Nova coluna na tabela de desafios
ALTER TABLE public.group_challenges
  ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Bucket público no Supabase Storage para imagens de desafios
--    (uploads feitos via service role key; leitura pública sem autenticação)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'challenge-images',
  'challenge-images',
  true,
  5242880,                                    -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
