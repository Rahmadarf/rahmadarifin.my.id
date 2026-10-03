import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/site/project-card";
import {
  Section,
  SectionHeader,
  SectionLabel,
} from "@/components/site/section";
import { TechTag } from "@/components/site/tech-tag";
import { SOCIAL_LABELS, socialHandle } from "@/lib/social";
import {
  HERO_PRIMARY_CTA,
  HERO_SECONDARY_CTA,
  PROFILE_READOUT,
  PROFILE_READOUT_PATH,
  SECTION_TITLES,
  SKILL_GROUPS,
} from "@/lib/content/defaults";
import type { PublicProfile, ProjectView } from "@/lib/data/portfolio";
import type {
  SkillCategory,
  SkillRow,
  SocialLinkRow,
  TimelineEntryRow,
} from "@/lib/types/database";

/** Shared look for "nothing published yet" placeholders. */
function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-input bg-surface p-5 text-sm leading-[22px] text-text-tertiary">
      {children}
    </p>
  );
}

/**
 * Left-aligned two-column hero.
 *
 * The top padding clears the fixed navbar — 69px of nav on mobile and 74px on
 * desktop, plus the design's own 56/112px.
 */
export function HeroSection({
  profile,
  socialLinks,
}: {
  profile: PublicProfile;
  socialLinks: SocialLinkRow[];
}) {
  const iconLinks = socialLinks.filter((link) => link.platform !== "email");

  return (
    <section className="relative isolate w-full px-6 pb-10 pt-[125px] lg:px-30 lg:pb-18 lg:pt-[186px]">
      {/* The whole backdrop. `isolate` on the section keeps -z-10 from sinking
          behind the page, and the wrapper's overflow is what stops the glow
          widening the document on a narrow screen. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="hero-glow absolute left-1/2 top-[30%] h-[560px] w-[620px] -translate-x-1/2 -translate-y-1/2 md:left-[62%] md:top-[45%] md:h-[640px] md:w-[1000px]" />
        <div className="hero-grid absolute inset-0" />
        <div className="hero-hairline absolute inset-x-0 bottom-0 h-px" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[640px] flex-col gap-7 lg:max-w-[1200px] lg:flex-row lg:items-end lg:gap-20">
        <div className="flex flex-col items-start gap-7 lg:w-[740px] lg:shrink-0">
          {profile.availability_badge ? (
            <p className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 font-mono text-[11px] leading-4 text-primary lg:text-xs">
              <span aria-hidden className="size-[7px] rounded-full bg-primary" />
              {profile.availability_badge}
            </p>
          ) : null}

          <h1 className="text-[40px] leading-[44px] tracking-[-0.03em] lg:text-[64px] lg:leading-[68px]">
            {profile.hero_headline}
          </h1>

          {profile.hero_intro ? (
            <p className="text-base leading-[26px] text-text-secondary lg:text-[18px] lg:leading-7">
              {profile.hero_intro}
            </p>
          ) : null}

          <div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:gap-3">
            <Button asChild className="w-full lg:w-auto">
              <Link href="#projects">{HERO_PRIMARY_CTA}</Link>
            </Button>
            <Button variant="secondary" asChild className="w-full lg:w-auto">
              <Link href="#contact">{HERO_SECONDARY_CTA}</Link>
            </Button>
          </div>

          {iconLinks.length ? (
            <ul className="flex flex-wrap gap-x-[18px] gap-y-2 font-mono text-xs leading-[18px] lg:gap-x-5 lg:text-[13px]">
              {iconLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary transition-colors hover:text-foreground"
                  >
                    {SOCIAL_LABELS[link.platform]}{" "}
                    <span className="hover-arrow-up">&#8599;</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <ProfileReadout />
      </div>
    </section>
  );
}

/**
 * The terminal-style card beside the hero copy.
 *
 * Every row is hardcoded in lib/content/defaults.ts: the design introduced
 * this card and the database has no columns for it.
 */
function ProfileReadout() {
  return (
    <div className="w-full overflow-hidden rounded-md border border-border bg-surface transition-colors hover:border-input lg:flex-1">
      <p className="px-4 py-3 font-mono text-xs leading-4 text-text-tertiary lg:px-5 lg:py-3.5">
        {PROFILE_READOUT_PATH}
      </p>

      <div aria-hidden className="h-px w-full bg-border" />

      <dl className="flex flex-col gap-3 p-4 font-mono text-xs leading-[18px] lg:px-5 lg:py-[18px]">
        {PROFILE_READOUT.map((row) => (
          // The hover fill reaches past the text on all four sides, and the
          // negative margins hand that space back to the layout so the rows
          // keep their resting rhythm.
          <div
            key={row.key}
            className="-mx-3 -my-2 flex gap-3 rounded-sm px-3 py-2 transition-colors hover:bg-surface-alt/50 lg:gap-4"
          >
            <dt className="w-16 shrink-0 text-text-tertiary lg:w-[72px]">
              {row.key}
            </dt>
            <dd className="min-w-0 flex-1 lg:text-[13px]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ProjectsSection({
  lead,
  grid,
}: {
  lead: ProjectView | null;
  grid: ProjectView[];
}) {
  const allProjects = (
    <>
      All projects <span aria-hidden>&rarr;</span>
    </>
  );

  return (
    <Section id="projects">
      <SectionHeader
        number="02"
        label="Projects"
        title={SECTION_TITLES.projects}
        action={
          <Link
            href="/projects"
            className="text-sm font-medium leading-[18px] text-primary hover:underline"
          >
            {allProjects}
          </Link>
        }
      />

      {lead ? (
        <ProjectCard project={lead} variant="featured" />
      ) : (
        <EmptyState>Belum ada proyek yang dipublikasikan.</EmptyState>
      )}

      {grid.length ? (
        <div className="grid gap-7 md:grid-cols-2 md:gap-6">
          {grid.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : null}

      {/* The header's action moves down here below `lg`, as a full-width
          secondary button — the mobile frame has no link in the header. */}
      <Button variant="secondary" asChild className="w-full lg:hidden">
        <Link href="/projects">{allProjects}</Link>
      </Button>
    </Section>
  );
}

export function SkillsSection({ skills }: { skills: SkillRow[] }) {
  const groups = SKILL_GROUPS.map((group) => ({
    ...group,
    skills: skills.filter((skill) =>
      (group.categories as readonly SkillCategory[]).includes(skill.category),
    ),
  })).filter((group) => group.skills.length > 0);

  return (
    <Section id="skills">
      <SectionHeader number="03" label="Skills" title={SECTION_TITLES.skills} />

      {groups.length ? (
        <div className="grid gap-7 lg:grid-cols-3 lg:gap-6">
          {groups.map((group) => (
            <article
              key={group.label}
              className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5 lg:gap-3.5 lg:p-6"
            >
              <h3 className="text-[18px] leading-6 tracking-[-0.02em] lg:text-[20px] lg:leading-[26px]">
                {group.label}
              </h3>
              <p className="text-sm leading-[22px] text-text-secondary">
                {group.blurb}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <TechTag key={skill.id}>{skill.name}</TechTag>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Belum ada skill yang dipublikasikan.</EmptyState>
      )}
    </Section>
  );
}

/**
 * The vertical timeline.
 *
 * No new columns: the date is `period_label`, the status chip is `role` and
 * the sentence underneath is `note`.
 */
export function JourneySection({ entries }: { entries: TimelineEntryRow[] }) {
  return (
    <Section id="journey">
      <SectionHeader
        number="04"
        label="Journey"
        title={SECTION_TITLES.journey}
      />

      {entries.length ? (
        <ol className="flex flex-col divide-y divide-border">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-2 py-[22px] lg:flex-row lg:gap-10 lg:py-7"
            >
              <p className="font-mono text-xs leading-[18px] text-text-secondary lg:w-40 lg:shrink-0 lg:text-[13px] lg:leading-5">
                {entry.period_label}
              </p>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2.5 lg:gap-3">
                  <h3 className="text-[20px] leading-[26px] tracking-[-0.02em] lg:text-[22px] lg:leading-7">
                    {entry.title}
                  </h3>
                  {entry.role ? <TechTag>{entry.role}</TechTag> : null}
                </div>

                {entry.note ? (
                  <p className="text-[15px] leading-6 text-text-secondary">
                    {entry.note}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState>Belum ada kegiatan yang dipublikasikan.</EmptyState>
      )}
    </Section>
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
  const rows = socialLinks.filter((link) => link.platform !== "email");

  return (
    <Section id="contact" className="pb-10 pt-16 lg:pb-18 lg:pt-24">
      <div className="flex flex-col gap-5 rounded-md border border-border bg-surface px-6 py-7 lg:flex-row lg:items-end lg:gap-16 lg:p-12">
        <div className="flex flex-col gap-5 lg:flex-1">
          <SectionLabel number="05">Contact</SectionLabel>

          <h2 className="text-[32px] leading-[38px] tracking-[-0.03em] lg:text-[44px] lg:leading-[50px]">
            {profile.contact_heading}
          </h2>

          {profile.contact_body ? (
            <p className="text-base leading-[26px] text-text-secondary lg:text-[17px] lg:leading-[27px]">
              {profile.contact_body}
            </p>
          ) : null}

          {/* "Download CV" from the design is not rendered: there is no CV
              URL anywhere in the data, and the brief says to hide it rather
              than invent one. */}
          {email ? (
            <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-3">
              <Button asChild className="w-full lg:w-auto">
                <a href={`mailto:${email}`}>Send an email</a>
              </Button>
            </div>
          ) : null}
        </div>

        {rows.length ? (
          <>
            <div aria-hidden className="h-px w-full bg-border lg:hidden" />

            <div className="flex flex-col divide-y divide-border lg:w-[380px] lg:shrink-0 lg:divide-y">
              {rows.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 flex-col justify-center gap-1 py-3 font-mono transition-colors hover:text-primary lg:min-h-0 lg:flex-row lg:gap-4 lg:py-3.5"
                >
                  <span className="text-[11px] leading-4 tracking-[0.06em] text-text-tertiary lg:w-[76px] lg:shrink-0 lg:text-xs lg:leading-[18px] lg:tracking-normal">
                    {link.platform}
                  </span>
                  <span className="min-w-0 break-all text-xs leading-[18px] lg:flex-1">
                    {socialHandle(link.url)}
                  </span>
                </a>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Section>
  );
}
