-- =========================================================
-- Visibilidade dos grupos e pedidos de adesão
-- =========================================================

-- 1. Adicionar is_public à tabela groups
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- 2. Tabela de pedidos de adesão
CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    text NOT NULL,
  user_name  text NOT NULL DEFAULT '',
  group_name text NOT NULL DEFAULT '',  -- denormalizado para notificação
  status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS gjr_group_status_idx ON public.group_join_requests (group_id, status);
CREATE INDEX IF NOT EXISTS gjr_user_idx         ON public.group_join_requests (user_id);

CREATE OR REPLACE FUNCTION public.set_join_request_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS group_join_requests_updated_at ON public.group_join_requests;
CREATE TRIGGER group_join_requests_updated_at
  BEFORE UPDATE ON public.group_join_requests
  FOR EACH ROW EXECUTE PROCEDURE public.set_join_request_updated_at();
