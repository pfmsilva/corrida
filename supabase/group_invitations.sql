-- =========================================================
-- Convites para grupos
-- =========================================================

CREATE TABLE IF NOT EXISTS public.group_invitations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_user_id  text NOT NULL,
  invited_by       text NOT NULL,
  invited_user_name text NOT NULL DEFAULT '',  -- denormalizado para display
  group_name        text NOT NULL DEFAULT '',  -- denormalizado para notificação
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, invited_user_id)
);

CREATE INDEX IF NOT EXISTS gi_user_status_idx ON public.group_invitations (invited_user_id, status);
CREATE INDEX IF NOT EXISTS gi_group_idx       ON public.group_invitations (group_id);

CREATE OR REPLACE FUNCTION public.set_invitation_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS group_invitations_updated_at ON public.group_invitations;
CREATE TRIGGER group_invitations_updated_at
  BEFORE UPDATE ON public.group_invitations
  FOR EACH ROW EXECUTE PROCEDURE public.set_invitation_updated_at();
