import Link from "next/link";
import { MediaFrame } from "@/components/site/media-frame";
import type { ProjectView } from "@/lib/data/portfolio";

/**
 * One row in the /projects list.
 *
 * Deliberately its own component rather than another variant of
 * project-card.tsx: the home cards are self-contained panels, these are ruled
 * rows, and the two stopped sharing anything but the data.
 *
 * The whole row is the link, so `aria-label` carries the title — otherwise its
 * accessible name would be every word in the row. No second link lives inside
 * it; the repository and live-site links belong to the detail page now.
 */
export function ProjectRow({
  project,
  index,
}: {
  project: ProjectView;
  /** 1-based position, shown as the mono index above `lg`. */
  index: number;
}) {
  const meta = project.category?.trim() || project.tech_tags[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={project.title}
      className="group flex flex-col gap-4 rounded-sm border-t border-border py-6 transition-colors hover:bg-surface/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:flex-row lg:items-start lg:gap-8 lg:py-7"
    >
      {/* Desktop only: the frame drops the index on mobile. */}
      <span
        aria-hidden
        className="hidden w-8 shrink-0 font-mono text-xs leading-5 text-text-tertiary lg:block"
      >
        {String(index).padStart(2, "0")}
      </span>

      <MediaFrame
        src={project.thumbnailUrl ?? project.coverUrl}
        alt={`${project.title} screenshot`}
        sizes="(max-width: 1023px) 100vw, 320px"
        imageClassName="object-top"
        fallback={
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center font-mono text-xl tracking-[0.1em] text-text-tertiary"
          >
            {initials(project.title)}
          </span>
        }
        className="hover-zoom aspect-[16/10] w-full rounded-md border border-border bg-surface-alt lg:w-80 lg:shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          {meta ? (
            <p className="font-mono text-[11px] uppercase leading-4 tracking-[0.06em] text-text-tertiary">
              {meta}
            </p>
          ) : (
            <span />
          )}

          {/* Mobile keeps the arrow in the meta row; desktop has its own
              column for it at the far right. */}
          <span
            aria-hidden
            className="hover-arrow-x inline-block font-mono text-lg leading-none text-text-tertiary transition-colors group-hover:text-foreground lg:hidden"
          >
            &rarr;
          </span>
        </div>

        <h2 className="text-2xl leading-tight tracking-[-0.02em] lg:text-[28px]">
          {project.title}
        </h2>

        {project.summary ? (
          <p className="text-[15px] leading-[22px] text-text-secondary lg:text-base lg:leading-6">
            {project.summary}
          </p>
        ) : null}

        {project.tech_tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-[4px] border border-border px-2 py-[3px] font-mono text-[11px] leading-4 text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <span
        aria-hidden
        className="hover-arrow-x hidden shrink-0 font-mono text-lg leading-7 text-text-tertiary transition-colors group-hover:text-foreground lg:block"
      >
        &rarr;
      </span>
    </Link>
  );
}

/** "E-commerce Flutter" → "EF", for a project with no screenshot. */
function initials(title: string): string {
  return title
    .split(/[\s—–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}
