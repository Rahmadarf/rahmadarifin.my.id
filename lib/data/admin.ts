import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { signOwnerMediaUrls } from "@/lib/media/sign";
import type { ProjectView } from "@/lib/data/portfolio";
import type {
  ProfileRow,
  SkillRow,
  SocialLinkRow,
  TimelineEntryRow,
} from "@/lib/types/database";

// Admin reads. Each one re-checks admin access and filters on owner_id — the
// same predicate the RLS policies enforce, so a bug here cannot widen access
// beyond the signed-in owner's own rows.

export async function listOwnProjects(): Promise<ProjectView[]> {
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const urls = await signOwnerMediaUrls(
    data.flatMap((row) => [row.thumbnail_path, row.cover_path]),
  );

  return data.map((row) => ({
    ...row,
    thumbnailUrl: row.thumbnail_path
      ? (urls.get(row.thumbnail_path) ?? null)
      : null,
    coverUrl: row.cover_path ? (urls.get(row.cover_path) ?? null) : null,
  }));
}

export async function listOwnTimeline(): Promise<TimelineEntryRow[]> {
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("timeline_entries")
    .select("*")
    .eq("owner_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return error || !data ? [] : data;
}

export async function listOwnSkills(): Promise<SkillRow[]> {
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("owner_id", user.id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return error || !data ? [] : data;
}

export async function listOwnSocialLinks(): Promise<SocialLinkRow[]> {
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("owner_id", user.id)
    .order("sort_order", { ascending: true });

  return error || !data ? [] : data;
}

export async function getOwnProfile(): Promise<{
  profile: ProfileRow | null;
  photoUrl: string | null;
}> {
  const { supabase, user } = await requireAdmin();

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !data) return { profile: null, photoUrl: null };

  const urls = await signOwnerMediaUrls([data.photo_path]);
  return {
    profile: data,
    photoUrl: data.photo_path ? (urls.get(data.photo_path) ?? null) : null,
  };
}
