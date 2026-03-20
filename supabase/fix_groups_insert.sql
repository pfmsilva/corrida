-- =========================================================
-- Fix: INSERT into groups fails because .select() after
-- insert evaluates the SELECT policy before the creator
-- has been added as a member.
--
-- Solution: also allow the group creator to SELECT their
-- own groups (not just members).
-- =========================================================

drop policy if exists "Members can read their groups" on public.groups;

create policy "Members or creator can read groups"
  on public.groups for select
  using (
    -- creator can always see their own group
    created_by = auth.uid()
    -- members can see groups they belong to
    or id = any(public.my_group_ids())
  );
