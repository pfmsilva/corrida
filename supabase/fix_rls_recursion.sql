-- =========================================================
-- Fix: infinite recursion + set-returning function in RLS
--
-- PostgreSQL does not allow set-returning functions (SETOF)
-- in policy expressions. The function must return uuid[]
-- (an array) instead, and policies use = any(array).
-- =========================================================

-- ----------------------------------------------------------
-- 1. Helper function — returns group IDs as a uuid ARRAY.
--    SECURITY DEFINER bypasses RLS so no recursion occurs.
--    COALESCE ensures an empty array (not NULL) when the
--    user has no groups, so = any(...) evaluates to false
--    rather than NULL.
-- ----------------------------------------------------------
create or replace function public.my_group_ids()
returns uuid[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(group_id), '{}')
  from   public.group_members
  where  user_id = auth.uid();
$$;


-- ----------------------------------------------------------
-- 2. group_members — drop recursive policy, add clean one
-- ----------------------------------------------------------
drop policy if exists "Members can read group membership" on public.group_members;

create policy "Members can read group membership"
  on public.group_members for select
  using (
    user_id  = auth.uid()
    or group_id = any(public.my_group_ids())
  );


-- ----------------------------------------------------------
-- 3. runs — drop recursive policy, add clean one
-- ----------------------------------------------------------
drop policy if exists "Group members can read each other runs" on public.runs;

create policy "Group members can read each other runs"
  on public.runs for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from   public.group_members b
      where  b.group_id = any(public.my_group_ids())
        and  b.user_id  = runs.user_id
    )
  );


-- ----------------------------------------------------------
-- 4. groups — drop recursive policy, add clean one
-- ----------------------------------------------------------
drop policy if exists "Members can read their groups" on public.groups;

create policy "Members can read their groups"
  on public.groups for select
  using (
    id = any(public.my_group_ids())
  );
