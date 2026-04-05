-- =========================================================
-- Adiciona datas de início e fim ao desafio de grupo
-- =========================================================

ALTER TABLE public.group_challenges
  ADD COLUMN IF NOT EXISTS starts_at date,
  ADD COLUMN IF NOT EXISTS ends_at   date;

-- Restrição: se ambas forem preenchidas, ends_at > starts_at
ALTER TABLE public.group_challenges
  DROP CONSTRAINT IF EXISTS challenge_dates_check;

ALTER TABLE public.group_challenges
  ADD CONSTRAINT challenge_dates_check
    CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at);
