import type { ProfileRow } from "@/lib/types/database";

// Fallback copy from the design export. Used when Supabase is not configured
// yet, or when the profile row is missing or still a draft, so the site renders
// instead of going blank. Real content lives in the database.
export const DEFAULT_PROFILE: Pick<
  ProfileRow,
  | "full_name"
  | "alias"
  | "role_title"
  | "availability_badge"
  | "hero_headline"
  | "hero_intro"
  | "bio"
  | "certifications"
  | "education"
  | "contact_heading"
  | "contact_body"
  | "contact_email"
  | "photo_path"
  | "footer_note"
> = {
  full_name: "Rahmad Arifin Susilo",
  alias: "Kumar",
  role_title:
    "Web Developer focused on building end-to-end products — from design systems to backend integration.",
  availability_badge: "Looking for an internship · 2027",
  hero_headline:
    "Hey, I'm Rahmad — a UI tinkerer, full-stack builder, and someone who never stops learning.",
  hero_intro:
    "Day to day I switch between two stacks: Next.js/Supabase for more modern products, and Laravel/Inertia.js for more classic systems. UI/UX detail is always a priority, never an afterthought. Also open to freelance work alongside the internship.",
  bio: "I build web applications using two stack approaches: Next.js + Supabase for modern products, and Laravel + Inertia.js for more traditional systems. I emphasize visual consistency through a token-based design system, not ad-hoc styling.",
  certifications: null,
  education: null,
  contact_heading: "Let's Connect",
  contact_body:
    "Open to internship opportunities starting 2027, and available for freelance web development projects alongside it.",
  contact_email: "rahmadarifinsusilo17@gmail.com",
  photo_path: null,
  footer_note: "© 2026 Rahmad Arifin Susilo. Built with Next.js & Tailwind CSS.",
};

export const MONOGRAM = "RAS";

// Shown beside the monogram in the navbar. Deliberately shorter than
// DEFAULT_PROFILE.full_name so the pill stays narrow enough for the inline
// links to fit alongside it.
export const BRAND_NAME = "Rahmad Arifin";

// Cycled on the splash screen. Short on purpose — DEFAULT_PROFILE.role_title
// is a full sentence, which does not fit the design's two-line lockup.
//
// Constants rather than profile rows: the splash paints before any data is
// read, and these are identity, not content an editor changes per project.
export const SPLASH_ROLES = [
  "Software Developer",
  "Minecraft Plugin Developer",
  "Vibe Coder",
] as const;

// --- Copy with no column behind it ---------------------------------------
//
// Everything below is hardcoded on purpose. These are elements the redesign
// introduced that have no field in the database, and inventing columns for
// them was explicitly out of scope. If any of it should become editable, it
// needs a migration plus an admin form first.

/** Section headings on the home page. The CMS has no field for these. */
export const SECTION_TITLES = {
  about: "About me",
  projects: "Selected work",
  skills: "Tools I work with",
  journey: "Where I am, where I'm heading",
} as const;

/**
 * The role on the About section's one-line identity lockup, rendered
 * uppercase after the alias.
 *
 * Not `profile.role_title`: that column holds a full sentence ("Web Developer
 * focused on building end-to-end products — …"), which the design's single
 * mono line cannot carry. The sentence-length copy has its slot in `bio`.
 */
export const IDENTITY_ROLE = "Web developer";

/** The terminal-style card in the hero: its prompt and its key/value rows. */
export const PROFILE_READOUT_PATH = "~/rahmad.profile";

/** Shown in the hero readout and again on the About status pill. */
export const TIMEZONE_LABEL = "Asia/Jakarta · UTC+7";

export const PROFILE_READOUT: { key: string; value: string }[] = [
  { key: "role", value: "Web developer" },
  { key: "stack", value: "Next.js · Laravel · Supabase" },
  { key: "language", value: "TypeScript · Tailwind CSS" },
  { key: "database", value: "PostgreSQL" },
  { key: "timezone", value: TIMEZONE_LABEL },
];

/**
 * The About section's focus rows.
 *
 * Hardcoded, and this is a step back from where the previous pass had it: the
 * titles used to come from `profile.certifications`. The redesign pairs each
 * row with its own stack tags, and there is no column for those — so keeping
 * half the row editable and half of it fixed would have been worse than
 * saying plainly that the whole block lives here. `certifications` is no
 * longer rendered anywhere on the public site.
 */
export const FOCUS_AREAS: { title: string; tags: string[] }[] = [
  {
    title: "Design systems & UI/UX",
    tags: ["Figma", "Tailwind CSS", "shadcn/ui"],
  },
  {
    title: "Full-stack with Next.js + Supabase",
    tags: ["Next.js", "Supabase", "PostgreSQL"],
  },
  {
    title: "Laravel + Inertia.js + React",
    tags: ["Laravel", "Inertia.js", "React", "TypeScript"],
  },
];

/**
 * The three skill cards in the design, mapped onto the five `skill_category`
 * values that already exist. Flutter sits under Frontend because that is
 * where the design puts it; the third card is named "Design & tooling"
 * rather than the design's "Design" because the only category behind it is
 * `tools`, which also holds Git.
 */
export const SKILL_GROUPS = [
  {
    label: "Frontend",
    blurb: "Interfaces with a clear hierarchy, built to be fast and accessible.",
    categories: ["frontend", "mobile"],
  },
  {
    label: "Backend & data",
    blurb: "Full-stack apps with auth, CRUD and real data behind them.",
    categories: ["backend", "database"],
  },
  {
    label: "Design & tooling",
    blurb: "Systems first: tokens, components, and consistent states.",
    categories: ["tools"],
  },
] as const;

/** Hero call-to-action labels. */
export const HERO_PRIMARY_CTA = "View projects";
export const HERO_SECONDARY_CTA = "Get in touch";

/** Fallback for the footer's middle slot when `profile.footer_note` is empty. */
export const FOOTER_BUILT_WITH =
  "Built with Next.js · Supabase · Tailwind CSS";
