-- =========================================================
-- Running Tracker — Groups & Challenges Schema
-- Run this in Supabase SQL Editor AFTER schema.sql
-- =========================================================

-- ----------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for users who signed up before this migration
insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;


-- ----------------------------------------------------------
-- 2. groups  (RLS policies added AFTER group_members exists)
-- ----------------------------------------------------------
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table public.groups enable row level security;


-- ----------------------------------------------------------
-- 3. group_members
-- ----------------------------------------------------------
create table if not exists public.group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

alter table public.group_members enable row level security;

create index if not exists gm_group_idx on public.group_members (group_id);
create index if not exists gm_user_idx  on public.group_members (user_id);

-- Non-recursive membership policy
create policy "Members can read group membership"
  on public.group_members for select
  using (
    user_id = auth.uid()
    or group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on public.group_members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Creator or self can remove membership"
  on public.group_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.groups g
      where g.id = group_id and g.created_by = auth.uid()
    )
  );


-- ----------------------------------------------------------
-- 4. groups RLS policies  (now group_members exists)
-- ----------------------------------------------------------
create policy "Members can read their groups"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = id and gm.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create groups"
  on public.groups for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Creator can update group"
  on public.groups for update
  using (auth.uid() = created_by);

create policy "Creator can delete group"
  on public.groups for delete
  using (auth.uid() = created_by);


-- ----------------------------------------------------------
-- 5. group_challenges
-- ----------------------------------------------------------
create table if not exists public.group_challenges (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null unique references public.groups(id) on delete cascade,
  target_km  numeric(8, 2) not null check (target_km > 0),
  reward     text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.group_challenges enable row level security;

create policy "Members can read challenge"
  on public.group_challenges for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_id and gm.user_id = auth.uid()
    )
  );

create policy "Creator can manage challenge"
  on public.group_challenges for all
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.created_by = auth.uid()
    )
  );

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger group_challenges_updated_at
  before update on public.group_challenges
  for each row execute procedure public.set_updated_at();


-- ----------------------------------------------------------
-- 6. Extend runs RLS so group members can read each other's runs
-- ----------------------------------------------------------
drop policy if exists "Group members can read each other runs" on public.runs;

create policy "Group members can read each other runs"
  on public.runs for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from   public.group_members a
      join   public.group_members b on a.group_id = b.group_id
      where  a.user_id = auth.uid()
        and  b.user_id = runs.user_id
    )
  );
