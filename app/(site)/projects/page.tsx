import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/site/project-card";
import { SectionLabel } from "@/components/site/section";
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
      {/* 88px of design padding on top of the fixed navbar's 74px. */}
      <section className="w-full px-6 pb-10 pt-[125px] lg:px-30 lg:pb-18 lg:pt-[162px]">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 lg:max-w-[1200px]">
          <Link
            href="/"
            className="text-sm font-medium leading-[18px] text-text-secondary transition-colors hover:text-foreground"
          >
            <span aria-hidden>&larr;</span> Back to home
          </Link>

          {/* The number is the published count, not a fixed label. */}
          <SectionLabel number={String(projects.length).padStart(2, "0")}>
            All projects
          </SectionLabel>

          <h1 className="text-[40px] leading-[44px] tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">
            All projects
          </h1>

          <p className="max-w-[640px] text-base leading-[26px] text-text-secondary lg:text-[18px] lg:leading-7">
            Everything I&apos;ve built or contributed to, across web and mobile.
          </p>
        </div>
      </section>

      <section className="w-full px-6 pb-16 lg:px-30 lg:pb-24">
        <div className="mx-auto w-full max-w-[640px] lg:max-w-[1200px]">
          {projects.length ? (
            // Mobile stacks bordered cards with their own spacing; desktop is
            // a divided list, so the rules between rows come from `divide-y`
            // plus the hairline that closes the list off at both ends.
            <div className="flex flex-col gap-7 lg:gap-0 lg:divide-y lg:divide-border lg:border-y lg:border-border">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  variant="row"
                  index={index + 1}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-input bg-surface p-5 text-sm leading-[22px] text-text-tertiary">
              Belum ada proyek yang dipublikasikan.
            </p>
          )}
        </div>
      </section>

      <SiteFooter note={profile.footer_note} name={profile.full_name} />
    </>
  );
}
