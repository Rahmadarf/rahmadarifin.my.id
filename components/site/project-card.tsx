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

  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
      <MediaFrame
        src={project.thumbnailUrl}
        alt={`Pratinjau ${project.title}`}
        className="h-[190px] w-full"
        sizes="(max-width: 1023px) 100vw, 588px"
      />

      <div className="flex flex-col gap-2.5 p-5">
        <Meta project={project} />

        <h3 className="text-[20px] leading-[26px] tracking-[-0.02em]">
          {project.title}
        </h3>

        {project.summary ? (
          <p className="text-sm leading-[22px] text-text-secondary">
            {project.summary}
          </p>
        ) : null}

        <Stack tags={project.tech_tags} />

        <Link
          href={`/projects/${project.slug}`}
          className="text-sm font-medium leading-[18px] text-primary hover:underline"
        >
          View project &rarr;
        </Link>
      </div>
    </article>
  );
}

/**
 * The lead project: media and copy side by side on desktop, stacked on mobile,
 * with a larger title than the grid cards so the hierarchy reads at a glance.
 */
function FeaturedCard({ project }: { project: ProjectView }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-border bg-surface lg:flex-row">
      <MediaFrame
        src={project.thumbnailUrl ?? project.coverUrl}
        alt={`Pratinjau ${project.title}`}
        className="h-[210px] w-full shrink-0 lg:h-[420px] lg:w-[640px]"
        sizes="(max-width: 1023px) 100vw, 640px"
      />

      <div className="flex flex-1 flex-col gap-3.5 p-5 lg:gap-4 lg:p-10">
        <Meta project={project} lead />

        <h2 className="text-[28px] leading-[34px] tracking-[-0.03em] lg:text-[36px] lg:leading-[42px]">
          {project.title}
        </h2>

        {project.summary ? (
          <p className="text-[15px] leading-6 text-text-secondary lg:text-base lg:leading-[26px]">
            {project.summary}
          </p>
        ) : null}

        <Stack tags={project.tech_tags} />

        <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-3">
          <Button asChild className="w-full lg:w-auto">
            <Link href={`/projects/${project.slug}`}>View case study</Link>
          </Button>

          {project.live_url ? (
            <Button variant="secondary" asChild className="w-full lg:w-auto">
              <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                Live demo &#8599;
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
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
      <article className="flex flex-col overflow-hidden rounded-md border border-border bg-surface lg:hidden">
        <MediaFrame
          src={project.thumbnailUrl}
          alt={`Pratinjau ${project.title}`}
          className="h-[200px] w-full"
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
      <article className="hidden gap-10 py-8 lg:flex">
        <p className="w-10 shrink-0 font-mono text-[13px] leading-[18px] text-text-secondary">
          {position}
        </p>

        <MediaFrame
          src={project.thumbnailUrl}
          alt={`Pratinjau ${project.title}`}
          className="h-[180px] w-[300px] shrink-0 rounded-md border border-border"
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
      {children} &#8599;
    </a>
  );
}
