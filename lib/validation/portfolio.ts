import { z } from "zod";
import {
  SKILL_CATEGORIES,
  SOCIAL_PLATFORMS,
} from "@/lib/types/database";
import { MEDIA_BUCKET } from "@/lib/media/paths";

// Everything here runs on the server, inside the Server Action, even when the
// browser already validated the same field.

const text = (max: number) => z.string().trim().max(max);

const requiredText = (max: number, label: string) =>
  text(max).min(1, `${label} wajib diisi.`);

const optionalText = (max: number) =>
  text(max).transform((value) => (value.length ? value : null));

const httpUrl = (label: string) =>
  text(2048)
    .transform((value) => (value.length ? value : null))
    .refine(
      (value) => value === null || /^https?:\/\//i.test(value),
      `${label} harus diawali http:// atau https://.`,
    );

const status = z.enum(["draft", "published"]);

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
  .transform((value) => value === "on" || value === "true");

const sortOrder = z.coerce
  .number()
  .int("Urutan harus bilangan bulat.")
  .min(0)
  .max(100000)
  .catch(0);

const rowId = z.coerce.number().int().positive();

// A create form submits an empty hidden id; an edit form submits the row id.
const optionalRowId = z
  .union([z.literal(""), rowId])
  .optional()
  .transform((value) => (typeof value === "number" ? value : undefined));

// Storage paths must stay inside the media bucket and keep the owner-UUID
// prefix the bucket policies check; anything else is dropped rather than
// stored.
const mediaPath = text(512)
  .transform((value) => (value.length ? value : null))
  .refine(
    (value) => value === null || !value.startsWith(`${MEDIA_BUCKET}/`),
    "Simpan path objek saja, tanpa nama bucket.",
  );

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const list = (separator: RegExp, max: number, itemMax: number) =>
  text(8000).transform((value) =>
    value
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, max)
      .map((item) => item.slice(0, itemMax)),
  );

export const signInSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export const projectSchema = z
  .object({
    id: optionalRowId,
    title: requiredText(120, "Nama proyek"),
    slug: text(80),
    category: optionalText(60),
    year: optionalText(40),
    role: optionalText(120),
    status_label: optionalText(60),
    summary: optionalText(2000),
    description: optionalText(4000),
    detail_heading: optionalText(120),
    features: list(/\r?\n/, 24, 500),
    note_label: optionalText(60),
    note_body: optionalText(1000),
    tech_tags: list(/,/, 12, 40),
    thumbnail_path: mediaPath,
    cover_path: mediaPath,
    // One storage path per line, in display order.
    gallery_paths: list(/\r?\n/, 12, 512),
    repo_url: httpUrl("Repo link"),
    live_url: httpUrl("Live link"),
    is_featured: checkbox,
    sort_order: sortOrder,
    status,
  })
  .transform((value) => ({
    ...value,
    summary: value.summary ?? "",
    description: value.description ?? "",
    slug: slugify(value.slug || value.title),
  }))
  .refine((value) => value.slug.length > 0, {
    message: "Slug tidak bisa dibuat dari nama proyek ini. Isi slug manual.",
    path: ["slug"],
  });

export const timelineSchema = z.object({
  id: optionalRowId,
  period_label: requiredText(60, "Bulan / tahun"),
  title: requiredText(200, "Nama kegiatan"),
  role: optionalText(200),
  note: optionalText(1000),
  occurred_on: text(10)
    .transform((value) => (value.length ? value : null))
    .refine(
      (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Tanggal harus format YYYY-MM-DD.",
    ),
  sort_order: sortOrder,
  status,
});

export const skillSchema = z.object({
  id: optionalRowId,
  name: requiredText(60, "Nama skill"),
  category: z.enum(SKILL_CATEGORIES),
  is_core: checkbox,
  sort_order: sortOrder,
  status,
});

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: optionalText(120),
  url: text(2048).refine(
    (value) => /^(https?:\/\/|mailto:)/i.test(value),
    "URL harus diawali http://, https://, atau mailto:.",
  ),
  sort_order: sortOrder,
  status,
});

export const profileSchema = z.object({
  full_name: requiredText(120, "Nama lengkap"),
  alias: optionalText(60),
  role_title: optionalText(300),
  availability_badge: optionalText(120),
  hero_headline: optionalText(400),
  hero_intro: optionalText(1200),
  bio: optionalText(2000),
  certifications: optionalText(2000),
  education: optionalText(2000),
  contact_heading: optionalText(120),
  contact_body: optionalText(1000),
  contact_email: text(200)
    .transform((value) => (value.length ? value : null))
    .refine(
      (value) => value === null || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      "Email kontak tidak valid.",
    ),
  photo_path: mediaPath,
  footer_note: optionalText(300),
  status,
});

export const deleteSchema = z.object({ id: rowId });

export const setStatusSchema = z.object({ id: rowId, status });

export type ProjectInput = z.output<typeof projectSchema>;
export type TimelineInput = z.output<typeof timelineSchema>;
export type SkillInput = z.output<typeof skillSchema>;
export type SocialLinkInput = z.output<typeof socialLinkSchema>;
export type ProfileInput = z.output<typeof profileSchema>;

// FormData values arrive as strings or File; a missing field arrives as null.
// Normalising to "" keeps the schemas free of null handling.
export function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION_")) {
      values[key] = value;
    }
  }
  return values;
}

export function fieldErrors(error: z.ZodError) {
  const flat: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    flat[key] ??= issue.message;
  }
  return flat;
}
