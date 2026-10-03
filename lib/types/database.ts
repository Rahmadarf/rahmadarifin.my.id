// Hand-maintained mirror of supabase/migrations. Keep in sync when the schema
// changes, or replace with `supabase gen types typescript` output once the CLI
// is linked to the project.

export type ContentStatus = "draft" | "published";

export const SKILL_CATEGORIES = [
  "frontend",
  "backend",
  "mobile",
  "database",
  "tools",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const SOCIAL_PLATFORMS = [
  "email",
  "github",
  "linkedin",
  "instagram",
  "website",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type ProfileRow = {
  owner_id: string;
  full_name: string;
  alias: string | null;
  role_title: string | null;
  availability_badge: string | null;
  hero_headline: string | null;
  hero_intro: string | null;
  bio: string | null;
  certifications: string | null;
  education: string | null;
  contact_heading: string | null;
  contact_body: string | null;
  contact_email: string | null;
  photo_path: string | null;
  footer_note: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: number;
  owner_id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string;
  description: string;
  detail_heading: string | null;
  features: string[];
  note_label: string | null;
  note_body: string | null;
  tech_tags: string[];
  year: string | null;
  role: string | null;
  status_label: string | null;
  thumbnail_path: string | null;
  cover_path: string | null;
  gallery_paths: string[];
  repo_url: string | null;
  live_url: string | null;
  is_featured: boolean;
  sort_order: number;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TimelineEntryRow = {
  id: number;
  owner_id: string;
  period_label: string;
  title: string;
  role: string | null;
  note: string | null;
  occurred_on: string | null;
  sort_order: number;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SkillRow = {
  id: number;
  owner_id: string;
  name: string;
  category: SkillCategory;
  is_core: boolean;
  sort_order: number;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialLinkRow = {
  id: number;
  owner_id: string;
  platform: SocialPlatform;
  label: string | null;
  url: string;
  sort_order: number;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// Columns the database generates or maintains; never sent from a form.
type Managed = "id" | "published_at" | "created_at" | "updated_at";

type TableDef<Row, InsertOptional extends keyof Row = never> = {
  Row: Row;
  Insert: Omit<Row, Managed | InsertOptional> &
    Partial<Pick<Row, Extract<InsertOptional, keyof Row>>>;
  Update: Partial<Omit<Row, Managed>>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profile: TableDef<ProfileRow, "owner_id">;
      projects: TableDef<ProjectRow, "owner_id">;
      timeline_entries: TableDef<TimelineEntryRow, "owner_id">;
      skills: TableDef<SkillRow, "owner_id">;
      social_links: TableDef<SocialLinkRow, "owner_id">;
    };
    Views: Record<never, never>;
    Functions: {
      is_published_media: {
        Args: { object_path: string };
        Returns: boolean;
      };
    };
    Enums: {
      content_status: ContentStatus;
      skill_category: SkillCategory;
      social_platform: SocialPlatform;
    };
    CompositeTypes: Record<never, never>;
  };
};
