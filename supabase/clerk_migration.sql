-- =========================================================
-- Migração: Supabase Auth → Clerk
--
-- Clerk usa IDs de texto (ex: "user_2abc123"), não UUIDs.
-- É necessário:
--   1. Remover TODAS as políticas RLS (dependem das colunas)
--   2. Remover FK constraints que apontam para auth.users
--   3. Converter colunas user_id / created_by de uuid para text
--   4. Remover o trigger de auto-criação de perfis
--   5. Desativar RLS (já não é usado — service role key faz bypass)
-- =========================================================

-- ----------------------------------------------------------
-- 1. Remover todas as políticas RLS que dependem das colunas
-- ----------------------------------------------------------

-- profiles
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"                  ON public.profiles;

-- runs
DROP POLICY IF EXISTS "Users can read their own runs"          ON public.runs;
DROP POLICY IF EXISTS "Users can insert their own runs"        ON public.runs;
DROP POLICY IF EXISTS "Users can update their own runs"        ON public.runs;
DROP POLICY IF EXISTS "Users can delete their own runs"        ON public.runs;
DROP POLICY IF EXISTS "Group members can read each other runs" ON public.runs;

-- groups
DROP POLICY IF EXISTS "Authenticated users can create groups"  ON public.groups;
DROP POLICY IF EXISTS "Members can read their groups"          ON public.groups;
DROP POLICY IF EXISTS "Members or creator can read groups"     ON public.groups;
DROP POLICY IF EXISTS "Creator can update group"               ON public.groups;
DROP POLICY IF EXISTS "Creator can delete group"               ON public.groups;

-- group_members
DROP POLICY IF EXISTS "Members can read group membership"      ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups"                  ON public.group_members;
DROP POLICY IF EXISTS "Creator or self can remove membership"  ON public.group_members;

-- group_challenges
DROP POLICY IF EXISTS "Members can read challenge"             ON public.group_challenges;
DROP POLICY IF EXISTS "Creator can manage challenge"           ON public.group_challenges;

-- ----------------------------------------------------------
-- 2. Remover trigger e função de auto-perfil (Supabase Auth)
-- ----------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.my_group_ids();

-- ----------------------------------------------------------
-- 3. profiles — remover FK a auth.users, mudar id para text
-- ----------------------------------------------------------
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ALTER COLUMN id TYPE text;

-- ----------------------------------------------------------
-- 4. runs — remover FK a auth.users, mudar user_id para text
-- ----------------------------------------------------------
ALTER TABLE public.runs
  DROP CONSTRAINT IF EXISTS runs_user_id_fkey;

ALTER TABLE public.runs
  ALTER COLUMN user_id TYPE text;

-- ----------------------------------------------------------
-- 5. groups — remover FK a auth.users, mudar created_by para text
-- ----------------------------------------------------------
ALTER TABLE public.groups
  DROP CONSTRAINT IF EXISTS groups_created_by_fkey;

ALTER TABLE public.groups
  ALTER COLUMN created_by TYPE text;

-- ----------------------------------------------------------
-- 6. group_members — remover FK a auth.users, mudar user_id para text
-- ----------------------------------------------------------
ALTER TABLE public.group_members
  DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE public.group_members
  ALTER COLUMN user_id TYPE text;

-- ----------------------------------------------------------
-- 7. Desativar RLS em todas as tabelas
--    (service role key faz bypass de qualquer forma, mas
--     desativar evita erros caso alguém use o anon key)
-- ----------------------------------------------------------
ALTER TABLE public.profiles         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenges DISABLE ROW LEVEL SECURITY;
