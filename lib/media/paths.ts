// Shared by the browser uploader and the server-side signer, so no
// "server-only" here.

export const MEDIA_BUCKET = "portfolio-media";

export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;

export const MEDIA_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;

export type MediaKind = "thumbnails" | "covers" | "photo";

// Storage RLS reads the first path segment as the ownership claim, so the
// owner UUID must lead. Anything else is rejected by the bucket policies.
export function buildMediaPath(
  ownerId: string,
  kind: MediaKind,
  fileName: string,
) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "bin";
  const unique = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  return `${ownerId}/${kind}/${unique}.${extension}`;
}

export function isOwnedMediaPath(ownerId: string, path: string) {
  return path.startsWith(`${ownerId}/`);
}

export function describeMediaLimits() {
  return `PNG, JPEG, WebP, or AVIF · max ${Math.round(
    MEDIA_MAX_BYTES / (1024 * 1024),
  )} MB`;
}
