import "server-only";

import { createAnonClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signPublicMediaUrls } from "@/lib/media/sign";
import { DEFAULT_PROFILE } from "@/lib/content/defaults";
import type {
  ProfileRow,
  ProjectRow,
  SkillRow,
  SocialLinkRow,
  TimelineEntryRow,
} from "@/lib/types/database";

// Reads for the public site. Every query goes through the cookie-free anon
// client, so RLS limits the result to published rows no matter what this code
// asks for. The explicit status filters are there to keep the intent readable
// and the indexes useful, not as the security boundary.

export type ProjectView = ProjectRow & {
  thumbnailUrl: string | null;
  coverUrl: string | null;
  /** Signed gallery URLs, in stored order, with unsignable entries dropped. */
  galleryUrls: string[];
};

export type PublicProfile = Pick<
  ProfileRow,
  keyof typeof DEFAULT_PROFILE | "status"
> & { photoUrl: string | null };

async function attachProjectMedia(rows: ProjectRow[]): Promise<ProjectView[]> {
  const urls = await signPublicMediaUrls(
    rows.flatMap((row) => [
      row.thumbnail_path,
      row.cover_path,
      ...(row.gallery_paths ?? []),
    ]),
  );

  return rows.map((row) => ({
    ...row,
    thumbnailUrl: row.thumbnail_path
      ? (urls.get(row.thumbnail_path) ?? null)
      : null,
    coverUrl: row.cover_path ? (urls.get(row.cover_path) ?? null) : null,
    // Order is the stored order. A path that failed to sign is dropped rather
    // than rendered as a gap in the grid.
    galleryUrls: (row.gallery_paths ?? [])
      .map((path) => urls.get(path))
      .filter((url): url is string => Boolean(url)),
  }));
}

export async function getPublicProfile(): Promise<PublicProfile> {
  const fallback: PublicProfile = {
    ...DEFAULT_PROFILE,
    status: "published",
    photoUrl: null,
  };

  if (!isSupabaseConfigured()) return fallback;

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (error || !data) return fallback;

  const photoUrl = data.photo_path
    ? ((await signPublicMediaUrls([data.photo_path])).get(data.photo_path) ??
      null)
    : null;

  return {
    full_name: data.full_name || fallback.full_name,
    alias: data.alias ?? fallback.alias,
    role_title: data.role_title ?? fallback.role_title,
    availability_badge:
      data.availability_badge ?? fallback.availability_badge,
    hero_headline: data.hero_headline ?? fallback.hero_headline,
    hero_intro: data.hero_intro ?? fallback.hero_intro,
    bio: data.bio ?? fallback.bio,
    certifications: data.certifications,
    education: data.education,
    contact_heading: data.contact_heading ?? fallback.contact_heading,
    contact_body: data.contact_body ?? fallback.contact_body,
    contact_email: data.contact_email ?? fallback.contact_email,
    photo_path: data.photo_path,
    footer_note: data.footer_note ?? fallback.footer_note,
    status: data.status,
    photoUrl,
  };
}

export async function getPublishedProjects(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<ProjectView[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAnonClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) return [];

  return attachProjectMedia(data);
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug")
    .eq("status", "published");

  if (error || !data) return [];
  return data.map((row) => row.slug);
}

export async function getPublishedProject(
  slug: string,
): Promise<ProjectView | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const [view] = await attachProjectMedia([data]);
  return view ?? null;
}

export async function getPublishedSkills(): Promise<SkillRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return error || !data ? [] : data;
}

export async function getPublishedTimeline(): Promise<TimelineEntryRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("timeline_entries")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("occurred_on", { ascending: false, nullsFirst: false });

  return error || !data ? [] : data;
}

export async function getPublishedSocialLinks(): Promise<SocialLinkRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  return error || !data ? [] : data;
}
