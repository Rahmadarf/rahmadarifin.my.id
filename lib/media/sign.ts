import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MEDIA_BUCKET } from "@/lib/media/paths";
import type { Database } from "@/lib/types/database";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type MediaUrlMap = Map<string, string>;

// The bucket is private, so every image needs a signed URL. Signing goes
// through Storage RLS: an anonymous request only gets a URL back while a
// published row still references the path. The owner's session additionally
// covers media attached to drafts.
async function signPaths(
  supabase: SupabaseClient<Database>,
  paths: string[],
): Promise<MediaUrlMap> {
  const urls: MediaUrlMap = new Map();
  if (!paths.length) return urls;

  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return urls;

  for (const entry of data) {
    // Storage reports per-path failures inline; skip those rather than
    // rendering a broken image.
    if (entry.signedUrl && !entry.error && entry.path) {
      urls.set(entry.path, entry.signedUrl);
    }
  }

  return urls;
}

// react/cache compares arguments by identity, so the cache key must be a
// primitive: a sorted, newline-joined path list.
const signAsAnon = cache(async (key: string) =>
  signPaths(createAnonClient(), key.split("\n")),
);

const signAsOwner = cache(async (key: string) =>
  signPaths(await createClient(), key.split("\n")),
);

function toKey(paths: (string | null | undefined)[]) {
  return [...new Set(paths.filter((path): path is string => Boolean(path)))]
    .sort()
    .join("\n");
}

async function sign(
  paths: (string | null | undefined)[],
  as: "anon" | "owner",
): Promise<MediaUrlMap> {
  const key = toKey(paths);
  if (!key || !isSupabaseConfigured()) return new Map();
  return as === "owner" ? signAsOwner(key) : signAsAnon(key);
}

// Public pages: published media only, no session required.
export function signPublicMediaUrls(paths: (string | null | undefined)[]) {
  return sign(paths, "anon");
}

export async function signPublicMediaUrl(path: string | null | undefined) {
  if (!path) return null;
  return (await signPublicMediaUrls([path])).get(path) ?? null;
}

// Admin pages: also covers the owner's draft media.
export function signOwnerMediaUrls(paths: (string | null | undefined)[]) {
  return sign(paths, "owner");
}

export async function signOwnerMediaUrl(path: string | null | undefined) {
  if (!path) return null;
  return (await signOwnerMediaUrls([path])).get(path) ?? null;
}
