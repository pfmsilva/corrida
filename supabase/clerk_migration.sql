-- =========================================================
-- Migração: Supabase Auth → Clerk
--
-- Clerk usa IDs de texto (ex: "user_2abc123"), não UUIDs.
-- É necessário:
--   1. Remover FK constraints que apontam para auth.users
--   2. Converter colunas user_id / created_by de uuid para text
--   3. Remover o trigger de auto-criação de perfis
-- =========================================================

-- ----------------------------------------------------------
-- 1. Remover trigger e função de auto-perfil (Supabase Auth)
-- ----------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ----------------------------------------------------------
-- 2. profiles — remover FK a auth.users, mudar id para text
-- ----------------------------------------------------------
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ALTER COLUMN id TYPE text;

-- ----------------------------------------------------------
-- 3. runs — remover FK a auth.users, mudar user_id para text
-- ----------------------------------------------------------
ALTER TABLE public.runs
  DROP CONSTRAINT IF EXISTS runs_user_id_fkey;

ALTER TABLE public.runs
  ALTER COLUMN user_id TYPE text;

-- ----------------------------------------------------------
-- 4. groups — remover FK a auth.users, mudar created_by para text
-- ----------------------------------------------------------
ALTER TABLE public.groups
  DROP CONSTRAINT IF EXISTS groups_created_by_fkey;

ALTER TABLE public.groups
  ALTER COLUMN created_by TYPE text;

-- ----------------------------------------------------------
-- 5. group_members — remover FK a auth.users, mudar user_id para text
-- ----------------------------------------------------------
ALTER TABLE public.group_members
  DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE public.group_members
  ALTER COLUMN user_id TYPE text;

-- ----------------------------------------------------------
-- 6. Recriar índices (mantêm-se, apenas o tipo muda)
-- ----------------------------------------------------------
-- Os índices existentes (gm_group_idx, gm_user_idx, runs_user_date_idx)
-- são automaticamente atualizados com a mudança de tipo.

-- ----------------------------------------------------------
-- 7. Nota sobre RLS
-- ----------------------------------------------------------
-- As políticas RLS existentes usam auth.uid() do Supabase Auth,
-- que deixa de ser populado com Clerk.
-- Como passamos a usar o service role key em todas as operações
-- server-side, o RLS é contornado — as políticas ficam inativas
-- mas não causam erros. Podes desativá-las se preferires:
--
-- ALTER TABLE public.runs           DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.groups         DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.group_members  DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles       DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.group_challenges DISABLE ROW LEVEL SECURITY;
