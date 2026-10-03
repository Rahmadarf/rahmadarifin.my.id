import type { Metadata } from "next";
import Link from "next/link";
import { ProjectRow } from "@/components/site/project-row";
import { SiteFooter } from "@/components/site/site-footer";
import { getPublicProfile, getPublishedProjects } from "@/lib/data/portfolio";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All Projects",
  description:
    "Every project Rahmad Arifin Susilo has built or contributed to, across web and mobile.",
};

export default async function ProjectsPage() {
  const [projects, profile] = await Promise.all([
    getPublishedProjects(),
    getPublicProfile(),
  ]);

  return (
    <>
      {/* 32px of design padding on mobile and 56px on desktop, on top of the
          fixed navbar's 69/74px. */}
      <section className="w-full px-6 pb-16 pt-[101px] lg:px-30 lg:pb-24 lg:pt-[130px]">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8 lg:max-w-[1200px] lg:gap-12">
          <header className="flex flex-col gap-4 lg:gap-5">
            <Link
              href="/"
              className="w-fit rounded-sm text-sm text-text-secondary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span aria-hidden>&larr;</span> Back to home
            </Link>

            {/* The frame puts extra air under the back link, before the label
                starts the page proper. */}
            <p className="mt-2 font-mono text-xs uppercase leading-4 tracking-[0.08em] text-text-tertiary lg:mt-3">
              Projects
            </p>

            <h1 className="text-[40px] leading-[44px] tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
              All projects
            </h1>

            <p className="max-w-[720px] text-base leading-6 text-text-secondary lg:text-[18px] lg:leading-7">
              Everything I&apos;ve built or contributed to, across web and
              mobile.
            </p>
          </header>

          {projects.length ? (
            // Each row draws its own top rule; the list closes itself off at
            // the bottom.
            <div className="flex flex-col border-b border-border">
              {projects.map((project, index) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  index={index + 1}
                />
              ))}
            </div>
          ) : (
            <p className="text-[15px] leading-6 text-text-secondary">
              Projects will appear here soon.
            </p>
          )}
        </div>
      </section>

      <SiteFooter note={profile.footer_note} name={profile.full_name} />
    </>
  );
}
