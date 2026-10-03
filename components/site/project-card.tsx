import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MediaFrame } from "@/components/site/media-frame";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/lib/data/portfolio";

/**
 * The design's mono meta line — "FEATURED · WEB APP", "WEB PLATFORM · LARAVEL".
 *
 * There is no category column in the database and inventing one is out of
 * scope, so the line is built from what the row does carry: the featured flag
 * and the first stack tags. That means a project's leading tag shows up both
 * here and in the stack line below it; adding a `category` field later would
 * be the way to remove that.
 */
function projectMeta(project: ProjectView, lead: boolean): string | null {
  // "FEATURED" belongs to the one card actually rendered as the lead. Several
  // rows can carry is_featured, and labelling all of them would make the word
  // meaningless.
  const parts = lead
    ? ["Featured", project.tech_tags[0]]
    : project.tech_tags.slice(0, 2);

  const meta = parts.filter(Boolean).join(" · ");
  return meta ? meta.toUpperCase() : null;
}

function Meta({
  project,
  lead = false,
}: {
  project: ProjectView;
  lead?: boolean;
}) {
  const meta = projectMeta(project, lead);
  if (!meta) return null;

  return (
    <p className="font-mono text-[11px] leading-4 tracking-[0.06em] text-text-tertiary">
      {meta}
    </p>
  );
}

function Stack({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <p className="font-mono text-xs leading-[18px] text-text-secondary">
      {tags.join(" · ")}
    </p>
  );
}

export function ProjectCard({
  project,
  variant = "default",
  index,
}: {
  project: ProjectView;
  variant?: "default" | "featured" | "row";
  /** 1-based position, shown as the mono index on the /projects rows. */
  index?: number;
}) {
  if (variant === "featured") return <FeaturedCard project={project} />;
  if (variant === "row") return <ProjectRow project={project} index={index ?? 1} />;

  return <HomeCard project={project} />;
}

/** Initials for a project with no screenshot — "E-commerce Flutter" → "EF". */
function initials(title: string): string {
  return title
    .split(/[\s—–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

function Thumbnail({
  project,
  className,
  sizes,
  priority = false,
}: {
  project: ProjectView;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <MediaFrame
      src={project.thumbnailUrl ?? project.coverUrl}
      alt={`${project.title} screenshot`}
      sizes={sizes}
      priority={priority}
      imageClassName="object-top"
      // No caption in production: an empty slot reads as the project's
      // initials on a flat surface rather than as a note to the developer.
      fallback={
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-mono text-2xl tracking-[0.1em] text-text-tertiary"
        >
          {initials(project.title)}
        </span>
      }
      className={cn("hover-zoom w-full bg-surface-alt", className)}
    />
  );
}

/**
 * The lead project: media and copy side by side above `lg`, stacked below it.
 *
 * Not a single link — it carries two calls to action — so the card itself
 * only brightens its border and zooms the thumbnail on hover, and the buttons
 * bring their own states.
 */
function FeaturedCard({ project }: { project: ProjectView }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-surface transition-colors hover:border-input xl:flex-row xl:items-stretch">
      {/* Figma draws this side by side at 1440 with a 660px thumbnail — 55% of
          the content column. It only turns horizontal at `xl`: between 1024 and
          1279 the column is narrow enough that the copy would be taller than a
          16:10 thumbnail, which would either squash the ratio or leave a band
          of empty surface under the image. Stacked, both stay honest. */}
      <Thumbnail
        project={project}
        className="aspect-[16/10] xl:w-[55%] xl:shrink-0 xl:self-start"
        sizes="(max-width: 1279px) 100vw, 55vw"
      />

      <div className="flex flex-1 flex-col justify-between gap-5 p-5 lg:p-6 xl:p-10">
        <div className="flex flex-col gap-3">
          <Meta project={project} lead />

          <h3 className="text-[28px] font-medium leading-tight tracking-[-0.025em] lg:text-[32px]">
            {project.title}
          </h3>

          {project.summary ? (
            // Clamped: the stored summaries run longer than the frame's, and
            // without this the copy outgrows the thumbnail and the 16:10
            // ratio stops holding on desktop.
            <p className="line-clamp-3 text-[15px] leading-[23px] text-text-secondary lg:text-base lg:leading-[26px]">
              {project.summary}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <TagRow tags={project.tech_tags} />

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/projects/${project.slug}`}>View project</Link>
            </Button>

            {/* Only when there is something to open. */}
            {project.live_url ? (
              <Button variant="secondary" asChild className="w-full sm:w-auto">
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live demo <span className="hover-arrow-up">&#8599;</span>
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * A supporting project. The whole card is the link — hence `aria-label`, so
 * its accessible name is the title rather than every word inside it.
 */
function HomeCard({ project }: { project: ProjectView }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={project.title}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface transition-colors hover:border-input focus-visible:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Thumbnail
        project={project}
        className="aspect-[2/1]"
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 588px"
      />

      <div className="flex flex-col gap-3 p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3 font-mono text-text-tertiary">
          <Meta project={project} />
          <span
            aria-hidden
            className="hover-arrow shrink-0 text-sm leading-4 transition-colors group-hover:text-foreground"
          >
            &#8599;
          </span>
        </div>

        <h3 className="text-[20px] font-medium leading-tight tracking-[-0.015em] text-text-secondary transition-colors group-hover:text-foreground">
          {project.title}
        </h3>

        {project.summary ? (
          <p className="line-clamp-3 text-[15px] leading-[22px] text-text-secondary">
            {project.summary}
          </p>
        ) : null}

        <TagRow tags={project.tech_tags} />
      </div>
    </Link>
  );
}

/** Up to four stack chips, wrapping. */
function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 4).map((tag) => (
        <span
          key={tag}
          className="rounded-[4px] border border-border px-2 py-[3px] font-mono text-[11px] leading-4 text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/**
 * A row on /projects: index, thumbnail, copy and links in four columns on
 * desktop. Below `lg` the same content becomes the bordered card the mobile
 * frame draws, so the two shapes are rendered separately rather than coerced
 * out of one set of flex rules.
 */
function ProjectRow({
  project,
  index,
}: {
  project: ProjectView;
  index: number;
}) {
  const position = String(index).padStart(2, "0");

  return (
    // One wrapper per project so the list's `divide-y` sees a single child.
    // Without it the hidden half of each pair would still take a rule and the
    // desktop list would double its first line.
    <div>
      {/* Mobile: card */}
      <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-surface transition-colors hover:border-input lg:hidden">
        <MediaFrame
          src={project.thumbnailUrl}
          alt={`Pratinjau ${project.title}`}
          className="hover-zoom h-[200px] w-full"
          sizes="100vw"
        />

        <div className="flex flex-col gap-2.5 p-5">
          <Meta project={project} />

          <h2 className="text-[22px] leading-7 tracking-[-0.02em]">
            <Link href={`/projects/${project.slug}`} className="hover:text-primary">
              {project.title}
            </Link>
          </h2>

          {project.summary ? (
            <p className="text-[15px] leading-6 text-text-secondary">
              {project.summary}
            </p>
          ) : null}

          <Stack tags={project.tech_tags} />
        </div>

        <div aria-hidden className="h-px w-full bg-border" />

        <div className="flex flex-wrap gap-x-5 gap-y-2 p-5">
          <ProjectLinks project={project} />
        </div>
      </article>

      {/* Desktop: row */}
      <article className="group hidden gap-10 py-8 lg:flex">
        <p className="w-10 shrink-0 font-mono text-[13px] leading-[18px] text-text-secondary">
          {position}
        </p>

        <MediaFrame
          src={project.thumbnailUrl}
          alt={`Pratinjau ${project.title}`}
          className="hover-zoom h-[180px] w-[300px] shrink-0 rounded-md border border-border transition-colors group-hover:border-input"
          sizes="300px"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <Meta project={project} />

          <h2 className="text-[28px] leading-[34px] tracking-[-0.03em]">
            <Link href={`/projects/${project.slug}`} className="hover:text-primary">
              {project.title}
            </Link>
          </h2>

          {project.summary ? (
            <p className="max-w-[520px] text-[15px] leading-6 text-text-secondary">
              {project.summary}
            </p>
          ) : null}

          <Stack tags={project.tech_tags} />
        </div>

        <div className="flex w-40 shrink-0 flex-col gap-2">
          <ProjectLinks project={project} />
        </div>
      </article>
    </div>
  );
}

function ProjectLinks({ project }: { project: ProjectView }) {
  return (
    <>
      {project.repo_url ? (
        <ExternalLink href={project.repo_url}>Repository</ExternalLink>
      ) : null}

      {project.live_url ? (
        <ExternalLink href={project.live_url}>Live site</ExternalLink>
      ) : (
        <span className="text-[13px] leading-[18px] text-text-tertiary">
          No live link yet
        </span>
      )}
    </>
  );
}

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-sm font-medium leading-[18px] text-primary hover:underline",
        className,
      )}
    >
      {children} <span className="hover-arrow-up">&#8599;</span>
    </a>
  );
}
