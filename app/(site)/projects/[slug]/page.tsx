import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaFrame } from "@/components/site/media-frame";
import { ExternalLink } from "@/components/site/project-card";
import { SectionLabel } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { TechTagList } from "@/components/site/tech-tag";
import {
  getPublicProfile,
  getPublishedProject,
  getPublishedProjectSlugs,
} from "@/lib/data/portfolio";

export const revalidate = 300;

// params is a Promise in Next 16; PageProps resolves the slug type from the
// route itself.
export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getPublishedProject(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary || project.description || undefined,
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const [project, profile] = await Promise.all([
    getPublishedProject(slug),
    getPublicProfile(),
  ]);

  if (!project) notFound();

  const hasLinks = Boolean(project.repo_url || project.live_url);

  return (
    <>
      <section className="w-full px-6 pt-[125px] lg:px-30 lg:pt-[162px]">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 lg:max-w-[1200px]">
          <Link
            href="/projects"
            className="text-sm font-medium leading-[18px] text-text-secondary transition-colors hover:text-foreground"
          >
            <span aria-hidden>&larr;</span> Back to projects
          </Link>

          <SectionLabel number="01">Project</SectionLabel>

          <h1 className="text-[40px] leading-[44px] tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
            {project.title}
          </h1>

          <TechTagList tags={project.tech_tags} />

          {project.description ? (
            <p className="max-w-[760px] text-base leading-[26px] text-text-secondary lg:text-[18px] lg:leading-[30px]">
              {project.description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="w-full px-6 pt-7 lg:px-30 lg:pt-12">
        <div className="mx-auto w-full max-w-[640px] lg:max-w-[1200px]">
          <MediaFrame
            src={project.coverUrl ?? project.thumbnailUrl}
            alt={`Pratinjau ${project.title}`}
            className="h-[220px] w-full rounded-md border border-border lg:h-[480px]"
            sizes="(max-width: 1023px) 100vw, 1200px"
            placeholderLabel="Cover · 16:10"
            priority
          />
        </div>
      </section>

      <section className="w-full px-6 pt-10 lg:px-30 lg:pt-18">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-10 lg:max-w-[1200px] lg:flex-row lg:items-start lg:gap-20">
          <div className="flex min-w-0 flex-1 flex-col gap-5 lg:gap-6">
            <h2 className="text-[24px] leading-8 tracking-[-0.03em] lg:text-[28px] lg:leading-[34px]">
              {project.detail_heading ?? "Key features"}
            </h2>

            {project.features.length ? (
              // Dividers above the first row and below the last, as in the
              // design, with `divide-y` handling the ones in between.
              <ol className="flex flex-col divide-y divide-border border-y border-border">
                {project.features.map((feature, index) => (
                  <li key={feature} className="flex gap-4 py-4 lg:gap-6 lg:py-[18px]">
                    <span
                      aria-hidden
                      className="w-8 shrink-0 font-mono text-xs leading-[26px] text-primary"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="min-w-0 flex-1 text-[15px] leading-6 lg:text-base lg:leading-[26px]">
                      {feature}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[15px] leading-6 text-text-tertiary">
                Detail proyek belum ditambahkan.
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-4 lg:w-[340px] lg:shrink-0">
            {project.note_label || project.note_body ? (
              <DetailCard label={project.note_label ?? "Notes"}>
                <p className="text-sm leading-[22px] text-text-secondary">
                  {project.note_body}
                </p>
              </DetailCard>
            ) : null}

            <DetailCard label="Links">
              {hasLinks ? (
                <div className="flex flex-col gap-3">
                  {project.repo_url ? (
                    <ExternalLink href={project.repo_url}>
                      Repository
                    </ExternalLink>
                  ) : null}
                  {project.live_url ? (
                    <ExternalLink href={project.live_url}>
                      Live site
                    </ExternalLink>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm leading-[22px] text-text-tertiary">
                  Repo / live link belum ditambahkan.
                </p>
              )}
            </DetailCard>
          </aside>
        </div>
      </section>

      <div className="h-16 w-full lg:h-25" />

      <SiteFooter note={profile.footer_note} name={profile.full_name} />
    </>
  );
}

/** `surface` panel with the design's mono 11px uppercase label. */
function DetailCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface px-6 py-5 lg:py-[22px]">
      <p className="font-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-text-tertiary">
        {label}
      </p>
      {children}
    </div>
  );
}
