import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MediaFrame } from "@/components/site/media-frame";
import { SiteFooter } from "@/components/site/site-footer";
import {
  getPublicProfile,
  getPublishedProject,
  getPublishedProjectSlugs,
  getPublishedProjects,
} from "@/lib/data/portfolio";
import type { ProjectView } from "@/lib/data/portfolio";

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

  const description = project.summary || project.description || undefined;
  // The cover is a signed, time-limited URL. Good enough for a crawl that
  // happens while the page is warm; see the note in the PR about how long
  // these live relative to the revalidate window.
  const image = project.coverUrl ?? project.thumbnailUrl;

  return {
    title: project.title,
    description,
    openGraph: {
      type: "article",
      title: project.title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const [project, profile, all] = await Promise.all([
    getPublishedProject(slug),
    getPublicProfile(),
    getPublishedProjects(),
  ]);

  if (!project) notFound();

  // Display order, wrapping past the end. Undefined when this is the only
  // published project, which hides the block.
  const position = all.findIndex((row) => row.id === project.id);
  const next =
    all.length > 1 && position !== -1
      ? all[(position + 1) % all.length]
      : undefined;

  const cover = project.coverUrl ?? project.thumbnailUrl;

  const metaCells = [
    { label: "Category", value: project.category },
    { label: "Year", value: project.year },
    { label: "Role", value: project.role },
    { label: "Status", value: project.status_label },
  ].filter((cell): cell is { label: string; value: string } =>
    Boolean(cell.value?.trim()),
  );

  return (
    <>
      <article className="w-full px-6 pb-16 pt-[101px] lg:px-30 lg:pb-24 lg:pt-[130px]">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-10 lg:max-w-[1200px] lg:gap-14">
          <header className="flex flex-col gap-4 lg:gap-5">
            <Link
              href="/projects"
              className="w-fit rounded-sm text-sm text-text-secondary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span aria-hidden>&larr;</span> Back to projects
            </Link>

            {project.category ? (
              <p className="mt-1 font-mono text-xs uppercase leading-4 tracking-[0.08em] text-text-tertiary lg:mt-2">
                {project.category}
              </p>
            ) : null}

            <h1 className="text-[40px] leading-[44px] tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
              {project.title}
            </h1>

            {project.description ? (
              <p className="max-w-[720px] text-base leading-[25px] text-text-secondary lg:text-xl lg:leading-[30px]">
                {project.description}
              </p>
            ) : null}

            {/* Each button appears only when its URL is stored. */}
            {project.live_url || project.repo_url ? (
              <div className="flex flex-col gap-2.5 lg:flex-row">
                {project.live_url ? (
                  <Button asChild className="w-full lg:w-auto">
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live site <span className="hover-arrow-up inline-block">&#8599;</span>
                    </a>
                  </Button>
                ) : null}

                {project.repo_url ? (
                  <Button
                    variant="secondary"
                    asChild
                    className="w-full lg:w-auto"
                  >
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Repository <span className="hover-arrow-up inline-block">&#8599;</span>
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </header>

          {/* The whole strip goes when every cell is empty. */}
          {metaCells.length ? (
            <dl className="grid grid-cols-2 border-y border-border lg:grid-cols-4">
              {metaCells.map((cell) => (
                <div key={cell.label} className="flex flex-col gap-1.5 py-4">
                  <dt className="font-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-text-tertiary">
                    {cell.label}
                  </dt>
                  <dd className="text-[15px] leading-[18px]">{cell.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {cover ? (
            <MediaFrame
              src={cover}
              alt={`${project.title} cover`}
              className="aspect-[15/8] w-full rounded-md border border-border"
              imageClassName="object-top"
              sizes="(max-width: 1023px) 100vw, 1200px"
              priority
            />
          ) : null}

          {project.features.length ? (
            <TwoColumn heading={project.detail_heading ?? "Key features"}>
              <ol className="flex flex-col border-b border-border">
                {project.features.map((feature, index) => (
                  <li
                    key={feature}
                    className="flex gap-4 border-t border-border py-4 lg:gap-[31px]"
                  >
                    <span
                      aria-hidden
                      className="shrink-0 font-mono text-xs leading-[22px] text-primary lg:leading-[26px]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="min-w-0 flex-1 text-[15px] leading-[22px] lg:text-[17px] lg:leading-[26px]">
                      {feature}
                    </p>
                  </li>
                ))}
              </ol>
            </TwoColumn>
          ) : null}

          {project.galleryUrls.length ? (
            <TwoColumn heading="Screens">
              <div className="grid gap-4 sm:grid-cols-2">
                {project.galleryUrls.map((url, index) => (
                  <MediaFrame
                    key={url}
                    src={url}
                    alt={`${project.title} screenshot ${index + 1}`}
                    className="aspect-[16/10] w-full rounded-md border border-border transition-colors hover:border-input"
                    imageClassName="object-top"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 392px"
                  />
                ))}
              </div>
            </TwoColumn>
          ) : null}

          {next ? <NextProject project={next} /> : null}
        </div>
      </article>

      <SiteFooter note={profile.footer_note} name={profile.full_name} />
    </>
  );
}

/** Heading on the left, content on the right above `lg`; stacked below it. */
function TwoColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:gap-20">
      <h2 className="text-2xl leading-[29px] tracking-[-0.02em] lg:w-80 lg:shrink-0 lg:text-[28px] lg:leading-[34px]">
        {heading}
      </h2>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

function NextProject({ project }: { project: ProjectView }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`Next project: ${project.title}`}
      className="group flex items-center justify-between gap-6 border-y border-border py-7 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:py-10"
    >
      <span className="flex min-w-0 flex-col gap-2">
        <span className="font-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-text-tertiary">
          Next project
        </span>
        <span className="truncate text-[28px] leading-[34px] tracking-[-0.03em] lg:text-[40px] lg:leading-[48px]">
          {project.title}
        </span>
      </span>

      <span
        aria-hidden
        className="hover-arrow-next inline-block shrink-0 font-mono text-[22px] leading-none text-text-secondary lg:text-[28px]"
      >
        &rarr;
      </span>
    </Link>
  );
}
