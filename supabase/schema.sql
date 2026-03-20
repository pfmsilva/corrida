-- =========================================================
-- Running Tracker — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- =========================================================

-- The "runs" table stores every run entry per user.
create table if not exists public.runs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  date           date not null,
  distance_km    numeric(6, 2) not null check (distance_km > 0),
  duration_min   numeric(6, 2) not null check (duration_min > 0),
  -- pace is stored in min/km so the frontend doesn't need to compute it on reads
  pace_min_per_km numeric(6, 2) generated always as (duration_min / distance_km) stored,
  notes          text,
  created_at     timestamptz not null default now()
);

-- Row-Level Security: each user can only access their own runs.
alter table public.runs enable row level security;

create policy "Users can read their own runs"
  on public.runs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own runs"
  on public.runs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own runs"
  on public.runs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own runs"
  on public.runs for delete
  using (auth.uid() = user_id);

-- Index for fast per-user queries ordered by date
create index if not exists runs_user_date_idx on public.runs (user_id, date desc);
