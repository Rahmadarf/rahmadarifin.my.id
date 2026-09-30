import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "@/lib/media/paths";
import type { Database } from "@/lib/types/database";

// Uploads happen from the browser before the form is submitted, so a file can
// reach the bucket and never end up on a row: the user closes the tab, or the
// save fails validation and they walk away. This sweep is the backstop that
// removes those objects.
//
// Two guards keep it from deleting live media:
//   1. Every path referenced by one of the owner's rows is spared, draft rows
//      included.
//   2. Objects newer than `minAgeMinutes` are spared, because a second tab may
//      have just uploaded one and not saved yet.
//
// Everything runs through the owner's own session, so Storage RLS confines it
// to their folder even if the prefix were wrong.

const DEFAULT_MIN_AGE_MINUTES = 60;
const PAGE_SIZE = 100;
const MAX_OBJECTS = 1000;

type Client = SupabaseClient<Database>;

// Structural subset of storage-js's FileObject. Folders come back with a null
// id; real objects carry one. Declared here rather than imported so the app
// does not depend on @supabase/storage-js directly — assignability from the
// real return type is still checked at the push site below.
type StorageEntry = {
  name: string;
  id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

async function listFolder(
  supabase: Client,
  prefix: string,
): Promise<StorageEntry[]> {
  const entries: StorageEntry[] = [];

  for (let offset = 0; offset < MAX_OBJECTS; offset += PAGE_SIZE) {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset });

    if (error || !data?.length) break;

    entries.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return entries;
}

// Returns null when a lookup failed, so the caller can abort rather than treat
// an error as "nothing is referenced".
async function referencedPaths(
  supabase: Client,
  ownerId: string,
): Promise<Set<string> | null> {
  const paths = new Set<string>();

  const [projects, profile] = await Promise.all([
    supabase
      .from("projects")
      .select("thumbnail_path, cover_path")
      .eq("owner_id", ownerId),
    supabase
      .from("profile")
      .select("photo_path")
      .eq("owner_id", ownerId)
      .maybeSingle(),
  ]);

  if (projects.error || profile.error) return null;

  for (const row of projects.data ?? []) {
    if (row.thumbnail_path) paths.add(row.thumbnail_path);
    if (row.cover_path) paths.add(row.cover_path);
  }
  if (profile.data?.photo_path) paths.add(profile.data.photo_path);

  return paths;
}

function ageMinutes(entry: StorageEntry) {
  const stamp = entry.created_at ?? entry.updated_at;
  if (!stamp) return null;

  const parsed = Date.parse(stamp);
  if (Number.isNaN(parsed)) return null;

  return (Date.now() - parsed) / 60000;
}

export type SweepResult = { removed: number; skipped: number };

export async function sweepOwnerMedia(
  supabase: Client,
  ownerId: string,
  options?: { minAgeMinutes?: number },
): Promise<SweepResult> {
  const minAge = options?.minAgeMinutes ?? DEFAULT_MIN_AGE_MINUTES;

  const referenced = await referencedPaths(supabase, ownerId);
  if (!referenced) return { removed: 0, skipped: 0 };

  // Discover the kind folders instead of hard-coding them, so a media kind
  // added later is still swept.
  const folders = await listFolder(supabase, ownerId);
  const orphans: string[] = [];
  let skipped = 0;

  for (const folder of folders) {
    // Folders come back with a null id; real objects have one.
    if (folder.id) continue;

    const prefix = `${ownerId}/${folder.name}`;
    for (const entry of await listFolder(supabase, prefix)) {
      if (!entry.id) continue;

      const path = `${prefix}/${entry.name}`;
      if (referenced.has(path)) continue;

      const age = ageMinutes(entry);
      if (age === null || age < minAge) {
        skipped += 1;
        continue;
      }

      orphans.push(path);
    }
  }

  if (!orphans.length) return { removed: 0, skipped };

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove(orphans);

  return { removed: error ? 0 : orphans.length, skipped };
}
