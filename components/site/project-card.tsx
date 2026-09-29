import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/site/media-frame";
import { TechTagList } from "@/components/site/tech-tag";
import type { ProjectView } from "@/lib/data/portfolio";

export function ProjectCard({
  project,
  variant = "featured",
}: {
  project: ProjectView;
  variant?: "featured" | "listing";
}) {
  const listing = variant === "listing";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 md:p-8">
      <MediaFrame
        src={project.thumbnailUrl}
        alt={`Pratinjau ${project.title}`}
        className={listing ? "h-[150px] w-full" : "h-[140px] w-full"}
        sizes="(max-width: 768px) 100vw, (max-width: 1080px) 50vw, 340px"
      />

      <h3 className="text-[19px] font-bold tracking-[-0.02em] md:text-[21px]">
        {project.title}
      </h3>

      {project.summary ? (
        <p className="text-sm leading-relaxed text-text-secondary">
          {project.summary}
        </p>
      ) : null}

      <TechTagList tags={project.tech_tags} />

      <Link
        href={`/projects/${project.slug}`}
        className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        {listing ? "View Details" : "View Project"}
        <ArrowRight className="size-[13px]" strokeWidth={2.4} />
      </Link>

      {listing ? (
        <ProjectLinks repo={project.repo_url} live={project.live_url} />
      ) : null}
    </article>
  );
}

function ProjectLinks({
  repo,
  live,
}: {
  repo: string | null;
  live: string | null;
}) {
  if (!repo && !live) {
    return (
      <span className="text-[13px] italic text-text-tertiary">
        Repo / live link belum ditambahkan.
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {[repo, live].filter(Boolean).map((url) => (
        <a
          key={url}
          href={url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium text-text-tertiary hover:text-primary"
        >
          {(url as string).replace(/^https?:\/\//, "")}
        </a>
      ))}
    </div>
  );
}
