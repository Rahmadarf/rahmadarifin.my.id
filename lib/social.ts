import type { SocialPlatform } from "@/lib/types/database";

// Display names for the hero's mono link row. The contact card uses the raw
// platform value instead, lowercase, which is what the design draws there.
export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  email: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  website: "Website",
};

/** `https://github.com/Rahmadarf/` → `github.com/Rahmadarf`. */
export function socialHandle(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}
