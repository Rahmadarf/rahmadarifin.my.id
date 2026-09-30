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

// Shown on the splash screen. Short on purpose — DEFAULT_PROFILE.role_title is
// a full sentence, which does not fit the design's two-line lockup.
export const SPLASH_TAGLINE = "Software Developer";

export const PLACEHOLDER_CERTIFICATIONS =
  "[ To be filled in — formal certifications (bootcamp/course) or a list of core focus areas ]";

export const PLACEHOLDER_EDUCATION =
  "[ To be filled in — institution name · major/level · start–end year ]";
