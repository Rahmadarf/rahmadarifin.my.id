-- Portfolio content schema.
--
-- Every content table carries an `owner_id` that points at an auth user. That
-- column is the only thing the database trusts when deciding who may change a
-- row; the server-side ADMIN_USER_IDS list is a second, independent gate and
-- has no effect here.

-- Enums -----------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type public.content_status as enum ('draft', 'published');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'skill_category') then
    create type public.skill_category as enum (
      'frontend', 'backend', 'mobile', 'database', 'tools'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'social_platform') then
    create type public.social_platform as enum (
      'email', 'github', 'linkedin', 'instagram', 'website'
    );
  end if;
end $$;

-- Shared triggers -------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Keeps published_at in sync with the status column so public pages can order
-- by a real publication date instead of guessing from created_at.
create or replace function public.sync_published_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

-- profile ---------------------------------------------------------------------
-- One row per owner: hero, about, and contact copy for the public site.

create table if not exists public.profile (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  alias text,
  role_title text,
  availability_badge text,
  hero_headline text,
  hero_intro text,
  bio text,
  certifications text,
  education text,
  contact_heading text,
  contact_body text,
  contact_email text,
  photo_path text,
  footer_note text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_full_name_not_blank check (length(btrim(full_name)) > 0),
  constraint profile_contact_email_format check (
    contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

-- projects --------------------------------------------------------------------

create table if not exists public.projects (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  description text not null default '',
  detail_heading text,
  features text[] not null default '{}',
  note_label text,
  note_body text,
  tech_tags text[] not null default '{}',
  thumbnail_path text,
  cover_path text,
  repo_url text,
  live_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_title_not_blank check (length(btrim(title)) > 0),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_owner_slug_key unique (owner_id, slug),
  constraint projects_repo_url_scheme check (
    repo_url is null or repo_url ~* '^https?://'
  ),
  constraint projects_live_url_scheme check (
    live_url is null or live_url ~* '^https?://'
  )
);

-- timeline_entries ------------------------------------------------------------
-- Backs the "Activities & Seminars" section.

create table if not exists public.timeline_entries (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  period_label text not null,
  title text not null,
  role text,
  note text,
  occurred_on date,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timeline_entries_title_not_blank check (length(btrim(title)) > 0),
  constraint timeline_entries_period_not_blank check (
    length(btrim(period_label)) > 0
  )
);

-- skills ----------------------------------------------------------------------
-- `category` is the exclusive bucket; `is_core` powers the cross-cutting "Main"
-- tab, which is why the tab counts in the design do not sum to the total.

create table if not exists public.skills (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  name text not null,
  category public.skill_category not null,
  is_core boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_name_not_blank check (length(btrim(name)) > 0),
  constraint skills_owner_name_key unique (owner_id, name)
);

-- social_links ----------------------------------------------------------------

create table if not exists public.social_links (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  platform public.social_platform not null,
  label text,
  url text not null,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_links_owner_platform_key unique (owner_id, platform),
  constraint social_links_url_scheme check (url ~* '^(https?://|mailto:)')
);

-- Triggers --------------------------------------------------------------------

do $$
declare
  target text;
begin
  foreach target in array array[
    'profile', 'projects', 'timeline_entries', 'skills', 'social_links'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I', target
    );
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', target
    );
    execute format(
      'drop trigger if exists sync_published_at on public.%I', target
    );
    execute format(
      'create trigger sync_published_at before insert or update on public.%I
         for each row execute function public.sync_published_at()', target
    );
  end loop;
end $$;

-- Indexes ---------------------------------------------------------------------
-- owner_id is a foreign key used by every write policy, so it needs its own
-- index on each table. The partial indexes serve the public read path, which
-- only ever asks for published rows.

create index if not exists projects_owner_id_idx
  on public.projects (owner_id);
create index if not exists projects_published_idx
  on public.projects (sort_order, published_at desc)
  where status = 'published';
create index if not exists projects_featured_published_idx
  on public.projects (sort_order)
  where status = 'published' and is_featured;

create index if not exists timeline_entries_owner_id_idx
  on public.timeline_entries (owner_id);
create index if not exists timeline_entries_published_idx
  on public.timeline_entries (sort_order, occurred_on desc)
  where status = 'published';

create index if not exists skills_owner_id_idx
  on public.skills (owner_id);
create index if not exists skills_published_idx
  on public.skills (category, sort_order)
  where status = 'published';

create index if not exists social_links_owner_id_idx
  on public.social_links (owner_id);
create index if not exists social_links_published_idx
  on public.social_links (sort_order)
  where status = 'published';

-- Privileges ------------------------------------------------------------------
-- Reads are granted broadly and then narrowed by RLS to published rows only.
-- Writes are never granted to anon. Identity columns need no sequence grant.

grant usage on schema public to anon, authenticated;

grant select on
  public.profile,
  public.projects,
  public.timeline_entries,
  public.skills,
  public.social_links
to anon, authenticated;

grant insert, update, delete on
  public.profile,
  public.projects,
  public.timeline_entries,
  public.skills,
  public.social_links
to authenticated;
