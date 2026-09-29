import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/lib/types/database";

export function StatusBadge({ status }: { status: ContentStatus }) {
  const published = status === "published";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em]",
        published
          ? "bg-[oklch(0.6_0.15_145/0.12)] text-[oklch(0.45_0.12_145)] dark:text-[oklch(0.8_0.14_145)]"
          : "bg-surface-alt text-text-tertiary",
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
