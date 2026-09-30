"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { MEDIA_BUCKET, isOwnedMediaPath } from "@/lib/media/paths";
import { sweepOwnerMedia } from "@/lib/media/sweep";
import {
  deleteSchema,
  fieldErrors,
  formValues,
  profileSchema,
  projectSchema,
  setStatusSchema,
  skillSchema,
  socialLinkSchema,
  timelineSchema,
} from "@/lib/validation/portfolio";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/actions/state";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/types/database";

// Every action re-runs requireAdmin(). A form rendered on an admin page is not
// proof of authorization: Server Actions are reachable as plain HTTP endpoints.
// The database then checks owner_id again through RLS.

function revalidatePublic(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

// Media paths come from the browser uploader, so they are untrusted input.
// Storage RLS would reject a foreign path anyway; rejecting it here keeps a
// bad path from being written into a content row at all.
function assertOwnedPath(
  ownerId: string,
  path: string | null,
  field: string,
): ActionState | null {
  if (path && !isOwnedMediaPath(ownerId, path)) {
    return actionError("Path media tidak valid.", {
      [field]: "Path media ini bukan milik akun Anda.",
    });
  }
  return null;
}

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function removeMedia(supabase: AdminClient, paths: (string | null)[]) {
  const targets = paths.filter((path): path is string => Boolean(path));
  if (!targets.length) return;
  // Best effort: a stale object is preferable to a failed content delete.
  await supabase.storage.from(MEDIA_BUCKET).remove(targets);
}

// Collects images that were uploaded from the browser but never landed on a
// row. Runs after a successful write and never blocks its result.
async function sweepQuietly(supabase: AdminClient, ownerId: string) {
  try {
    await sweepOwnerMedia(supabase, ownerId);
  } catch {
    // A failed cleanup is not a failed save.
  }
}

// Projects --------------------------------------------------------------------

export async function saveProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = projectSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return actionError(
      "Periksa kembali isian form.",
      fieldErrors(parsed.error),
    );
  }

  const { id, ...values } = parsed.data;

  for (const [field, path] of [
    ["thumbnail_path", values.thumbnail_path],
    ["cover_path", values.cover_path],
  ] as const) {
    const invalid = assertOwnedPath(user.id, path, field);
    if (invalid) return invalid;
  }

  if (id) {
    const { data: previous } = await supabase
      .from("projects")
      .select("slug, thumbnail_path, cover_path")
      .eq("id", id)
      .eq("owner_id", user.id)
      .maybeSingle();

    const { error } = await supabase
      .from("projects")
      .update(values)
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      return actionError(
        error.code === "23505"
          ? "Slug ini sudah dipakai proyek lain."
          : `Gagal menyimpan proyek: ${error.message}`,
      );
    }

    // Drop replaced images so the bucket does not accumulate orphans.
    const replaced = [
      previous?.thumbnail_path !== values.thumbnail_path
        ? (previous?.thumbnail_path ?? null)
        : null,
      previous?.cover_path !== values.cover_path
        ? (previous?.cover_path ?? null)
        : null,
    ];
    await removeMedia(supabase, replaced);
    await sweepQuietly(supabase, user.id);

    revalidatePath("/admin/projects");
    revalidatePublic(values.slug);
    if (previous?.slug && previous.slug !== values.slug) {
      revalidatePublic(previous.slug);
    }
    return actionSuccess(`Proyek "${values.title}" diperbarui.`);
  }

  const { error } = await supabase
    .from("projects")
    .insert({ ...values, owner_id: user.id });

  if (error) {
    return actionError(
      error.code === "23505"
        ? "Slug ini sudah dipakai proyek lain."
        : `Gagal menyimpan proyek: ${error.message}`,
    );
  }

  await sweepQuietly(supabase, user.id);

  revalidatePath("/admin/projects");
  revalidatePublic(values.slug);
  return actionSuccess(`Proyek "${values.title}" ditambahkan.`);
}

export async function deleteProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = deleteSchema.safeParse(formValues(formData));
  if (!parsed.success) return actionError("Proyek tidak ditemukan.");

  const { data: existing } = await supabase
    .from("projects")
    .select("slug, title, thumbnail_path, cover_path")
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id);

  if (error) {
    return actionError(`Gagal menghapus proyek: ${error.message}`);
  }

  await removeMedia(supabase, [
    existing?.thumbnail_path ?? null,
    existing?.cover_path ?? null,
  ]);
  await sweepQuietly(supabase, user.id);

  revalidatePath("/admin/projects");
  revalidatePublic(existing?.slug);
  return actionSuccess(
    existing?.title ? `Proyek "${existing.title}" dihapus.` : "Proyek dihapus.",
  );
}

export async function setProjectStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = setStatusSchema.safeParse(formValues(formData));
  if (!parsed.success) return actionError("Status tidak valid.");

  const { data, error } = await supabase
    .from("projects")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) return actionError(`Gagal mengubah status: ${error.message}`);

  revalidatePath("/admin/projects");
  revalidatePublic(data?.slug);
  return actionSuccess(
    parsed.data.status === "published"
      ? "Proyek dipublikasikan."
      : "Proyek dikembalikan ke draft.",
  );
}

// Timeline --------------------------------------------------------------------

export async function saveTimelineEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = timelineSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return actionError(
      "Periksa kembali isian form.",
      fieldErrors(parsed.error),
    );
  }

  const { id, ...values } = parsed.data;

  const { error } = id
    ? await supabase
        .from("timeline_entries")
        .update(values)
        .eq("id", id)
        .eq("owner_id", user.id)
    : await supabase
        .from("timeline_entries")
        .insert({ ...values, owner_id: user.id });

  if (error) return actionError(`Gagal menyimpan entri: ${error.message}`);

  revalidatePath("/admin/timeline");
  revalidatePath("/");
  return actionSuccess(
    id ? "Entri timeline diperbarui." : "Entri timeline ditambahkan.",
  );
}

export async function deleteTimelineEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = deleteSchema.safeParse(formValues(formData));
  if (!parsed.success) return actionError("Entri tidak ditemukan.");

  const { error } = await supabase
    .from("timeline_entries")
    .delete()
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id);

  if (error) return actionError(`Gagal menghapus entri: ${error.message}`);

  revalidatePath("/admin/timeline");
  revalidatePath("/");
  return actionSuccess("Entri timeline dihapus.");
}

// Skills ----------------------------------------------------------------------

export async function saveSkill(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = skillSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return actionError(
      "Periksa kembali isian form.",
      fieldErrors(parsed.error),
    );
  }

  const { id, ...values } = parsed.data;

  const { error } = id
    ? await supabase
        .from("skills")
        .update(values)
        .eq("id", id)
        .eq("owner_id", user.id)
    : await supabase.from("skills").insert({ ...values, owner_id: user.id });

  if (error) {
    return actionError(
      error.code === "23505"
        ? `Skill "${values.name}" sudah ada.`
        : `Gagal menyimpan skill: ${error.message}`,
    );
  }

  revalidatePath("/admin/skills");
  revalidatePath("/");
  return actionSuccess(
    id ? `Skill "${values.name}" diperbarui.` : `Skill "${values.name}" ditambahkan.`,
  );
}

export async function deleteSkill(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = deleteSchema.safeParse(formValues(formData));
  if (!parsed.success) return actionError("Skill tidak ditemukan.");

  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id);

  if (error) return actionError(`Gagal menghapus skill: ${error.message}`);

  revalidatePath("/admin/skills");
  revalidatePath("/");
  return actionSuccess("Skill dihapus.");
}

// Social links ----------------------------------------------------------------

// One form holds all platforms, matching the admin design. An emptied field
// removes that row instead of storing a blank URL.
export async function saveSocialLinks(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const values = formValues(formData);
  const errors: Record<string, string> = {};
  const upserts: {
    owner_id: string;
    platform: SocialPlatform;
    label: string | null;
    url: string;
    sort_order: number;
    status: "draft" | "published";
  }[] = [];
  const removals: SocialPlatform[] = [];

  SOCIAL_PLATFORMS.forEach((platform, index) => {
    const url = (values[`${platform}_url`] ?? "").trim();
    if (!url) {
      removals.push(platform);
      return;
    }

    const parsed = socialLinkSchema.safeParse({
      platform,
      label: values[`${platform}_label`] ?? "",
      url,
      sort_order: values[`${platform}_sort_order`] ?? String((index + 1) * 10),
      status: values[`${platform}_status`] ?? "published",
    });

    if (!parsed.success) {
      errors[`${platform}_url`] =
        parsed.error.issues[0]?.message ?? "Nilai tidak valid.";
      return;
    }

    upserts.push({ ...parsed.data, owner_id: user.id });
  });

  if (Object.keys(errors).length) {
    return actionError("Periksa kembali isian form.", errors);
  }

  if (upserts.length) {
    const { error } = await supabase
      .from("social_links")
      .upsert(upserts, { onConflict: "owner_id,platform" });
    if (error) return actionError(`Gagal menyimpan link: ${error.message}`);
  }

  if (removals.length) {
    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("owner_id", user.id)
      .in("platform", removals);
    if (error) return actionError(`Gagal menghapus link: ${error.message}`);
  }

  revalidatePath("/admin/social");
  revalidatePublic();
  return actionSuccess("Social links disimpan.");
}

// Profile ---------------------------------------------------------------------

export async function saveProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = profileSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return actionError(
      "Periksa kembali isian form.",
      fieldErrors(parsed.error),
    );
  }

  const invalid = assertOwnedPath(
    user.id,
    parsed.data.photo_path,
    "photo_path",
  );
  if (invalid) return invalid;

  const { data: previous } = await supabase
    .from("profile")
    .select("photo_path")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("profile")
    .upsert({ ...parsed.data, owner_id: user.id }, { onConflict: "owner_id" });

  if (error) return actionError(`Gagal menyimpan profil: ${error.message}`);

  if (previous?.photo_path && previous.photo_path !== parsed.data.photo_path) {
    await removeMedia(supabase, [previous.photo_path]);
  }
  await sweepQuietly(supabase, user.id);

  revalidatePath("/admin/profile");
  revalidatePublic();
  return actionSuccess("Profil disimpan.");
}

// Manual escape hatch for the case the automatic sweep cannot reach: an upload
// abandoned on a panel the owner never saves again.
// Takes no arguments: useActionState supplies the previous state and the form
// payload, and this action needs neither.
export async function cleanupMedia(): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const { removed, skipped } = await sweepOwnerMedia(supabase, user.id);

  revalidatePath("/admin/profile");

  if (!removed) {
    return actionSuccess(
      skipped
        ? `Tidak ada yang dihapus. ${skipped} file masih terlalu baru untuk dibersihkan.`
        : "Tidak ada gambar tak terpakai.",
    );
  }

  return actionSuccess(
    `${removed} gambar tak terpakai dihapus${
      skipped ? `, ${skipped} dilewati karena masih baru` : ""
    }.`,
  );
}
