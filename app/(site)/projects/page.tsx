import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectCard } from "@/components/site/project-card";
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
      <section className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 px-6 pb-14 pt-32 md:px-0 md:pt-44">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2.4} />
          Back to home
        </Link>
        <h1 className="text-4xl font-extrabold tracking-[-0.02em] md:text-[44px]">
          All Projects
        </h1>
        <p className="max-w-[640px] text-base leading-relaxed text-text-secondary">
          Every project I&apos;ve built or contributed to, across web and mobile.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1080px] px-6 pb-28 md:px-0 md:pb-36">
        {projects.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant="listing"
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-input bg-surface p-7 text-sm text-text-tertiary">
            Belum ada proyek yang dipublikasikan.
          </p>
        )}
      </section>

      <SiteFooter note={profile.footer_note} />
    </>
  );
}
