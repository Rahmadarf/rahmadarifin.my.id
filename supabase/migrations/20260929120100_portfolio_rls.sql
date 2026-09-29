-- Row Level Security for the portfolio content tables.
--
-- Two rules, applied to every table:
--   1. anon and authenticated may read rows whose status is 'published'.
--   2. only the authenticated user whose UUID equals owner_id may insert,
--      update, or delete a row — and may also read their own drafts.
--
-- ADMIN_USER_IDS lives in the Next.js server environment and is invisible to
-- Postgres. A UUID listed there still gets nothing beyond what these policies
-- grant, and removing a UUID from that list does not revoke database access;
-- revoke it in Supabase Auth instead.
--
-- auth.uid() is wrapped in a scalar subquery so the planner evaluates it once
-- per statement rather than once per row.

alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.skills enable row level security;
alter table public.social_links enable row level security;

-- profile ---------------------------------------------------------------------

drop policy if exists profile_select_published on public.profile;
create policy profile_select_published on public.profile
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists profile_select_own on public.profile;
create policy profile_select_own on public.profile
  for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists profile_insert_own on public.profile;
create policy profile_insert_own on public.profile
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists profile_update_own on public.profile;
create policy profile_update_own on public.profile
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists profile_delete_own on public.profile;
create policy profile_delete_own on public.profile
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- projects --------------------------------------------------------------------

drop policy if exists projects_select_published on public.projects;
create policy projects_select_published on public.projects
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own on public.projects
  for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own on public.projects
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- timeline_entries ------------------------------------------------------------

drop policy if exists timeline_entries_select_published on public.timeline_entries;
create policy timeline_entries_select_published on public.timeline_entries
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists timeline_entries_select_own on public.timeline_entries;
create policy timeline_entries_select_own on public.timeline_entries
  for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists timeline_entries_insert_own on public.timeline_entries;
create policy timeline_entries_insert_own on public.timeline_entries
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists timeline_entries_update_own on public.timeline_entries;
create policy timeline_entries_update_own on public.timeline_entries
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists timeline_entries_delete_own on public.timeline_entries;
create policy timeline_entries_delete_own on public.timeline_entries
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- skills ----------------------------------------------------------------------

drop policy if exists skills_select_published on public.skills;
create policy skills_select_published on public.skills
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists skills_select_own on public.skills;
create policy skills_select_own on public.skills
  for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists skills_insert_own on public.skills;
create policy skills_insert_own on public.skills
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists skills_update_own on public.skills;
create policy skills_update_own on public.skills
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists skills_delete_own on public.skills;
create policy skills_delete_own on public.skills
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- social_links ----------------------------------------------------------------

drop policy if exists social_links_select_published on public.social_links;
create policy social_links_select_published on public.social_links
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists social_links_select_own on public.social_links;
create policy social_links_select_own on public.social_links
  for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists social_links_insert_own on public.social_links;
create policy social_links_insert_own on public.social_links
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists social_links_update_own on public.social_links;
create policy social_links_update_own on public.social_links
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists social_links_delete_own on public.social_links;
create policy social_links_delete_own on public.social_links
  for delete to authenticated
  using ((select auth.uid()) = owner_id);
