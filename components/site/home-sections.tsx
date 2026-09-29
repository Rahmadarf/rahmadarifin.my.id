import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, GraduationCap, Mail, Star } from "lucide-react";
import { SocialIcons } from "@/components/site/social-icons";
import { ProjectCard } from "@/components/site/project-card";
import {
  PLACEHOLDER_CERTIFICATIONS,
  PLACEHOLDER_EDUCATION,
} from "@/lib/content/defaults";
import type { PublicProfile, ProjectView } from "@/lib/data/portfolio";
import type { SocialLinkRow, TimelineEntryRow } from "@/lib/types/database";

export function HeroSection({
  profile,
  socialLinks,
}: {
  profile: PublicProfile;
  socialLinks: SocialLinkRow[];
}) {
  return (
    <section className="dot-grid flex w-full flex-col items-center px-6 pb-24 pt-32 md:pb-36 md:pt-52">
      <div className="flex max-w-[820px] flex-col items-center gap-7 text-center">
        {profile.availability_badge ? (
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-4 py-2">
            <span className="size-[7px] rounded-full bg-primary" />
            <span className="font-mono text-xs tracking-[0.02em] text-primary">
              {profile.availability_badge}
            </span>
          </div>
        ) : null}

        <h1 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[64px]">
          {profile.hero_headline}
        </h1>

        {profile.hero_intro ? (
          <p className="max-w-[680px] text-base leading-relaxed text-text-secondary md:text-[19px]">
            {profile.hero_intro}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap justify-center gap-3.5">
          <Link
            href="#projects"
            className="rounded-[10px] bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition hover:brightness-110"
          >
            View Projects
          </Link>
          <Link
            href="#contact"
            className="rounded-[10px] border border-input px-6 py-3.5 text-[15px] font-semibold transition-colors hover:border-primary/30 hover:bg-accent"
          >
            Get in Touch
          </Link>
        </div>

        <SocialIcons links={socialLinks} className="mt-3 flex gap-2.5" />
      </div>
    </section>
  );
}

export function AboutSection({ profile }: { profile: PublicProfile }) {
  return (
    <section
      id="about"
      className="mx-auto flex w-full max-w-[1080px] flex-col gap-12 px-6 pb-28 pt-14 md:px-0 md:pb-36"
    >
      <div className="flex flex-col gap-2.5">
        <h2 className="text-3xl font-bold tracking-[-0.02em] md:text-[34px]">
          About Me
        </h2>
        <p className="text-[15px] text-text-tertiary">
          A quick summary, educational background, and focus areas.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-8 md:p-10 lg:w-[420px] lg:shrink-0">
          {profile.photoUrl ? (
            <Image
              src={profile.photoUrl}
              alt={profile.full_name}
              width={128}
              height={128}
              className="size-32 rounded-2xl border border-border object-cover"
            />
          ) : (
            <div className="flex size-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-input bg-surface-alt text-text-tertiary">
              <Camera className="size-[26px]" strokeWidth={1.6} />
              <span className="text-[11px]">Professional Photo</span>
            </div>
          )}

          <div>
            <h3 className="text-[22px] font-bold tracking-[-0.02em]">
              {profile.full_name}
            </h3>
            {profile.alias ? (
              <p className="text-sm text-text-tertiary">{profile.alias}</p>
            ) : null}
          </div>

          {profile.role_title ? (
            <p className="text-[15px] leading-relaxed text-text-secondary">
              {profile.role_title}
            </p>
          ) : null}

          {profile.bio ? (
            <p className="text-sm leading-relaxed text-text-secondary">
              {profile.bio}
            </p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <AboutCard
            icon={<Star className="size-4 text-primary" strokeWidth={2} />}
            title="Certifications / Focus Areas"
            body={profile.certifications}
            placeholder={PLACEHOLDER_CERTIFICATIONS}
          />
          <AboutCard
            icon={
              <GraduationCap className="size-4 text-primary" strokeWidth={2} />
            }
            title="Education"
            body={profile.education}
            placeholder={PLACEHOLDER_EDUCATION}
          />
        </div>
      </div>
    </section>
  );
}

function AboutCard({
  icon,
  title,
  body,
  placeholder,
}: {
  icon: React.ReactNode;
  title: string;
  body: string | null;
  placeholder: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-7">
      <div className="mb-4 flex items-center gap-2.5">
        {icon}
        <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
          {title}
        </span>
      </div>

      {body ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
          {body}
        </p>
      ) : (
        <div className="rounded-xl border border-dashed border-input p-5 text-sm text-text-tertiary">
          {placeholder}
        </div>
      )}
    </div>
  );
}

export function FeaturedProjectsSection({
  projects,
}: {
  projects: ProjectView[];
}) {
  return (
    <section
      id="projects"
      className="mx-auto flex w-full max-w-[1080px] flex-col gap-10 px-6 pb-28 md:px-0 md:pb-36"
    >
      <div className="flex flex-col gap-2.5">
        <h2 className="text-3xl font-bold tracking-[-0.02em] md:text-[34px]">
          Featured Projects
        </h2>
        <p className="text-[15px] text-text-tertiary">
          Selected projects that show how I approach my work.
        </p>
      </div>

      {projects.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-input bg-surface p-7 text-sm text-text-tertiary">
          Belum ada proyek unggulan yang dipublikasikan.
        </p>
      )}

      <Link
        href="/projects"
        className="flex items-center gap-2 self-center rounded-[10px] border border-input px-7 py-3.5 text-[15px] font-semibold transition-colors hover:border-primary/30 hover:bg-accent"
      >
        View All Projects
        <ArrowRight className="size-3.5" strokeWidth={2.4} />
      </Link>
    </section>
  );
}

export function TimelineSection({
  entries,
}: {
  entries: TimelineEntryRow[];
}) {
  return (
    <section
      id="journey"
      className="mx-auto flex w-full max-w-[1080px] flex-col gap-10 px-6 pb-28 md:px-0 md:pb-36"
    >
      <div className="flex flex-col gap-2.5">
        <h2 className="text-3xl font-bold tracking-[-0.02em] md:text-[34px]">
          Activities &amp; Seminars
        </h2>
        <p className="text-[15px] text-text-tertiary">
          Seminars, workshops, competitions, and organizational involvement.
        </p>
      </div>

      {entries.length ? (
        <ol className="flex flex-col border-l border-border pl-8">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className={
                index === entries.length - 1 ? "relative" : "relative pb-9"
              }
            >
              <span
                className={`absolute -left-[37px] top-1 size-[9px] rounded-full ${
                  index === 0 ? "bg-primary" : "bg-input"
                }`}
              />
              <span className="font-mono text-xs tracking-[0.02em] text-text-tertiary">
                {entry.period_label}
              </span>
              <h3 className="my-1 text-[18px] font-bold tracking-[-0.02em]">
                {entry.title}
              </h3>
              {entry.role || entry.note ? (
                <p className="text-sm text-text-secondary">
                  {[entry.role, entry.note].filter(Boolean).join(" — ")}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-2xl border border-dashed border-input bg-surface p-7 text-sm text-text-tertiary">
          Belum ada kegiatan yang dipublikasikan.
        </p>
      )}
    </section>
  );
}

export function ContactSection({
  profile,
  socialLinks,
}: {
  profile: PublicProfile;
  socialLinks: SocialLinkRow[];
}) {
  const emailLink = socialLinks.find((link) => link.platform === "email");
  const email =
    emailLink?.url.replace(/^mailto:/i, "") ?? profile.contact_email ?? null;

  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-[1080px] px-6 pb-28 md:px-0 md:pb-30"
    >
      <div className="dot-grid flex flex-col items-center gap-4.5 rounded-2xl border border-border bg-gradient-to-b from-surface to-surface-alt p-10 text-center md:p-14">
        <h2 className="text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
          {profile.contact_heading}
        </h2>

        {profile.contact_body ? (
          <p className="max-w-[520px] text-[15px] leading-relaxed text-text-secondary">
            {profile.contact_body}
          </p>
        ) : null}

        {email ? (
          <a
            href={`mailto:${email}`}
            className="mt-2 flex items-center gap-2 rounded-[10px] bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Mail className="size-4" />
            {email}
          </a>
        ) : null}

        <SocialIcons links={socialLinks} className="mt-1.5 flex gap-2.5" />
      </div>
    </section>
  );
}
