-- Fields the rebuilt project detail page needs: the meta strip's year, role
-- and status, plus an ordered gallery of screenshots.
--
-- All additive and all optional. `gallery_paths` defaults to an empty array
-- rather than null so reads never have to guard it; the rest are nullable with
-- no backfill. Nothing here is a key, so no index is warranted.
--
-- Naming note: the design calls the fourth meta cell "STATUS", but
-- public.projects.status is already the draft/published enum that RLS and
-- every query depend on. The column is `status_label` so the publishing state
-- keeps its name; the UI still renders it under the heading "STATUS".

alter table public.projects
  add column if not exists year text,
  add column if not exists role text,
  add column if not exists status_label text,
  add column if not exists gallery_paths text[] not null default '{}';

comment on column public.projects.year is
  'Free text, shown in the detail meta strip. e.g. "2026" or "2025 — 2026".';
comment on column public.projects.role is
  'What the owner did on the project, shown in the detail meta strip.';
comment on column public.projects.status_label is
  'Editorial state shown in the detail meta strip, e.g. "In progress". Not the publishing status.';
comment on column public.projects.gallery_paths is
  'Ordered storage paths for the detail page gallery. Same bucket and folder rules as thumbnail_path.';

-- Blank strings are not a value; an empty form field stores null instead.
alter table public.projects
  drop constraint if exists projects_year_not_blank;
alter table public.projects
  add constraint projects_year_not_blank
  check (year is null or length(btrim(year)) > 0);

alter table public.projects
  drop constraint if exists projects_role_not_blank;
alter table public.projects
  add constraint projects_role_not_blank
  check (role is null or length(btrim(role)) > 0);

alter table public.projects
  drop constraint if exists projects_status_label_not_blank;
alter table public.projects
  add constraint projects_status_label_not_blank
  check (status_label is null or length(btrim(status_label)) > 0);

-- No ownership CHECK on gallery_paths: a CHECK constraint cannot contain a
-- subquery, so "every element starts with the owner's uuid" is not expressible
-- here without an unreadable regex over array_to_string. thumbnail_path and
-- cover_path carry no such constraint either. The guarantees that do hold are
-- the ones that already protect those columns: storage RLS refuses writes
-- outside the owner's folder, and buildMediaPath/isOwnedMediaPath enforce the
-- shape in the app before anything is stored.

-- Storage read access -------------------------------------------------------
-- Without this, an anonymous visitor cannot sign a gallery image: the object
-- policy asks is_published_media(), and that only knew about the thumbnail and
-- the cover. Same predicate, widened to the array.

create or replace function public.is_published_media(object_path text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    where p.status = 'published'
      and (
        object_path in (p.thumbnail_path, p.cover_path)
        or object_path = any (p.gallery_paths)
      )
  ) or exists (
    select 1
    from public.profile pr
    where pr.status = 'published'
      and pr.photo_path = object_path
  );
$$;

grant execute on function public.is_published_media(text)
  to anon, authenticated;
