-- Storage bucket and policies for portfolio media.
--
-- The bucket is private on purpose. A public bucket would expose every object
-- to anyone with the URL, including thumbnails of draft projects, which is
-- wider than "public read for published content only". Instead objects are
-- readable by anon only while some published row still references their path,
-- and the app hands out short-lived signed URLs.
--
-- Object paths are always `<owner uuid>/<kind>/<file>`, so the first path
-- segment is the ownership claim the write policies check.

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'portfolio-media',
  'portfolio-media',
  false,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Is this object path referenced by a row the caller is allowed to read as
-- published content?
--
-- SECURITY INVOKER is deliberate: the function runs with the caller's
-- privileges, so the RLS policies on public.projects and public.profile still
-- apply inside it. The explicit status filters mean it stays correct even if
-- those policies later widen.
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
      and object_path in (p.thumbnail_path, p.cover_path)
  ) or exists (
    select 1
    from public.profile pr
    where pr.status = 'published'
      and pr.photo_path = object_path
  );
$$;

grant execute on function public.is_published_media(text)
  to anon, authenticated;

-- Buckets --------------------------------------------------------------------
-- Listing the bucket itself carries no object data, and the object policies
-- below are what actually gate the files.

-- storage.buckets is owned by supabase_storage_admin. If the migration runs as
-- a role without ownership, skip this one rather than failing the migration:
-- the object policies below are the actual access gate.
do $$
begin
  drop policy if exists portfolio_media_bucket_read on storage.buckets;
  create policy portfolio_media_bucket_read on storage.buckets
    for select to anon, authenticated
    using (id = 'portfolio-media');
exception
  when insufficient_privilege then
    raise notice
      'Skipped storage.buckets policy: run it as supabase_storage_admin if bucket listing is needed.';
end $$;

-- Objects --------------------------------------------------------------------

drop policy if exists portfolio_media_read_published on storage.objects;
create policy portfolio_media_read_published on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'portfolio-media'
    and public.is_published_media(name)
  );

-- The owner reads their own folder unconditionally, including media attached to
-- drafts, so the admin panel can preview before publishing.
drop policy if exists portfolio_media_owner_read on storage.objects;
create policy portfolio_media_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists portfolio_media_owner_insert on storage.objects;
create policy portfolio_media_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Upsert needs insert + select + update; all three are owner-scoped.
drop policy if exists portfolio_media_owner_update on storage.objects;
create policy portfolio_media_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists portfolio_media_owner_delete on storage.objects;
create policy portfolio_media_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
