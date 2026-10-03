-- A short editorial category for a project — "Web app", "Web platform",
-- "Mobile app" — shown in the mono meta line above the title on the home page.
--
-- Nullable with no default and no backfill: every existing row keeps working,
-- and the UI falls back to the project's first stack tag until an editor fills
-- this in. Nothing reads it as a key, so no index is needed.
--
-- Grants on public.projects were issued for the whole table rather than a
-- column list, so they already cover this column; RLS is row-level and is
-- likewise unaffected. No policy changes belong in this migration.

alter table public.projects
  add column if not exists category text;

comment on column public.projects.category is
  'Short editorial label shown in the project meta line. Null falls back to the first tech tag.';

-- Keep the stored value tidy: either absent or actual text, never a blank
-- string left behind by an empty form field.
alter table public.projects
  drop constraint if exists projects_category_not_blank;

alter table public.projects
  add constraint projects_category_not_blank
  check (category is null or length(btrim(category)) > 0);
