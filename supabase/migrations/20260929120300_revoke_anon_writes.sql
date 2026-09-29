-- Tighten the grant layer under RLS.
--
-- Supabase ships default privileges that grant `anon` and `authenticated` all
-- privileges on new tables in the public schema. RLS already blocks anonymous
-- writes — verified against the live project, where an anonymous UPDATE or
-- DELETE affects zero rows — but the table privilege itself was still there,
-- so the only thing standing between an anonymous request and a write was a
-- single policy check.
--
-- Revoking the write privileges from `anon` puts a second, independent barrier
-- in front of it: a mistake in one policy no longer opens up writes on its own.
-- Reads stay granted; RLS narrows them to published rows.

revoke insert, update, delete, truncate on
  public.profile,
  public.projects,
  public.timeline_entries,
  public.skills,
  public.social_links
from anon;

-- Stop the same default privileges from re-granting writes to anon on tables
-- added to this schema later.
alter default privileges in schema public
  revoke insert, update, delete, truncate on tables from anon;
