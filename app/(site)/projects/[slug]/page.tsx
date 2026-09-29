import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MediaFrame } from "@/components/site/media-frame";
import { TechTagList } from "@/components/site/tech-tag";
import { SiteFooter } from "@/components/site/site-footer";
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

  const links = [
    project.repo_url ? { label: "Repository", url: project.repo_url } : null,
    project.live_url ? { label: "Live site", url: project.live_url } : null,
  ].filter((link): link is { label: string; url: string } => Boolean(link));

  return (
    <>
      <section className="mx-auto flex w-full max-w-[900px] flex-col gap-4.5 px-6 pt-32 md:px-0 md:pt-44">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2.4} />
          Back to Projects
        </Link>

        <h1 className="text-4xl font-extrabold tracking-[-0.02em] md:text-[42px]">
          {project.title}
        </h1>

        <TechTagList tags={project.tech_tags} />

        {project.description ? (
          <p className="mt-2 max-w-[760px] text-base leading-relaxed text-text-secondary md:text-[17px]">
            {project.description}
          </p>
        ) : null}
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pt-10 md:px-0">
        <MediaFrame
          src={project.coverUrl ?? project.thumbnailUrl}
          alt={`Pratinjau ${project.title}`}
          className="h-[220px] w-full rounded-2xl sm:h-[300px] md:h-[340px]"
          sizes="(max-width: 900px) 100vw, 900px"
          placeholderLabel="[ Screenshot / preview placeholder ]"
          priority
        />
      </section>

      <section className="mx-auto flex w-full max-w-[900px] flex-col gap-12 px-6 pt-14 md:flex-row md:px-0">
        <div className="flex flex-1 flex-col gap-5">
          <h2 className="text-[22px] font-bold tracking-[-0.02em]">
            {project.detail_heading ?? "Key Features"}
          </h2>

          {project.features.length ? (
            <ul className="flex flex-col gap-3.5">
              {project.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-text-secondary"
                >
                  <span className="mt-0.5 text-primary">&bull;</span>
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] text-text-tertiary">
              Detail proyek belum ditambahkan.
            </p>
          )}
        </div>

        <aside className="flex flex-col gap-5 md:w-[280px] md:shrink-0">
          {project.note_label || project.note_body ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <span className="text-xs font-bold uppercase tracking-[0.04em] text-text-tertiary">
                {project.note_label ?? "Notes"}
              </span>
              <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                {project.note_body}
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-surface p-6">
            <span className="text-xs font-bold uppercase tracking-[0.04em] text-text-tertiary">
              Links
            </span>
            {links.length ? (
              <ul className="mt-2.5 flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {link.label}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2.5 text-sm italic text-text-tertiary">
                Repo / live link belum ditambahkan.
              </p>
            )}
          </div>
        </aside>
      </section>

      <div className="mt-24 w-full">
        <SiteFooter note={profile.footer_note} variant="compact" />
      </div>
    </>
  );
}
