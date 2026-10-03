import { MediaFrame } from "@/components/site/media-frame";
import { Section, SectionHeader } from "@/components/site/section";
import { cn } from "@/lib/utils";
import { publishedEducation } from "@/lib/profile-text";
import {
  FOCUS_AREAS,
  IDENTITY_ROLE,
  SECTION_TITLES,
  TIMEZONE_LABEL,
} from "@/lib/content/defaults";
import type { PublicProfile } from "@/lib/data/portfolio";

/**
 * About: a sticky portrait beside the lead paragraph, the status pill, and two
 * ruled lists.
 *
 * What comes from the profile row: `photo_path`, `full_name`, `alias`, `bio`,
 * `availability_badge` and `education`. The focus rows are constants — see
 * FOCUS_AREAS for why — and the timezone is one too.
 *
 * The decorative grid and glow belong to the hero; nothing here draws a
 * background.
 */
export function AboutSection({ profile }: { profile: PublicProfile }) {
  const education = publishedEducation(profile.education);
  const hasPhoto = Boolean(profile.photoUrl);

  return (
    <Section
      id="about"
      className="pb-18 pt-16 lg:pb-28 lg:pt-24"
      innerClassName="gap-8 lg:gap-12"
    >
      <SectionHeader number="01" label="About" title={SECTION_TITLES.about} />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-20">
        {/* With no portrait uploaded the column is dropped outright rather
            than holding a grey box open, and the copy takes the width back. */}
        {hasPhoto ? (
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:w-[400px] lg:shrink-0">
            <MediaFrame
              src={profile.photoUrl}
              alt={profile.full_name}
              className="aspect-[10/7] w-full rounded-md border border-border bg-surface transition-colors hover:border-input lg:aspect-[4/5]"
              sizes="(max-width: 1023px) 100vw, 400px"
            />

            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-medium leading-6">
                {profile.full_name}
              </p>
              <p className="font-mono text-[11px] leading-4 tracking-[0.06em] text-text-tertiary">
                {[
                  profile.alias ? `aka ${profile.alias}` : null,
                  IDENTITY_ROLE.toUpperCase(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            "flex min-w-0 flex-col gap-8 lg:flex-1 lg:gap-10",
            !hasPhoto && "lg:max-w-3xl",
          )}
        >
          {profile.bio ? (
            <p className="text-[18px] leading-7 tracking-[-0.01em] lg:text-2xl lg:leading-[34px]">
              {profile.bio}
            </p>
          ) : null}

          <StatusPill availability={profile.availability_badge} />

          <RuledList label="Focus areas">
            {FOCUS_AREAS.map((area, index) => (
              <Row key={area.title}>
                <div className="flex items-start gap-3 lg:contents">
                  <span
                    aria-hidden
                    className="shrink-0 font-mono text-xs leading-6 text-primary"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 text-[15px] leading-6 lg:flex-1 lg:text-base">
                    {area.title}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 lg:shrink-0">
                  {area.tags.map((tag) => (
                    <AboutTag key={tag}>{tag}</AboutTag>
                  ))}
                </div>
              </Row>
            ))}
          </RuledList>

          {/* Hidden entirely — label included — when nothing real is stored. */}
          {education.length ? (
            <RuledList label="Education">
              {education.map((entry) => (
                <Row key={entry.title}>
                  <p className="min-w-0 text-[15px] leading-6 lg:flex-1 lg:text-base">
                    {entry.title}
                  </p>
                  {entry.meta ? (
                    <p className="font-mono text-xs leading-[18px] text-text-tertiary lg:shrink-0 lg:text-right">
                      {entry.meta}
                    </p>
                  ) : null}
                </Row>
              ))}
            </RuledList>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

/**
 * Availability and timezone in one chip. The availability text is the profile
 * column the hero badge reads, so the two cannot drift apart.
 *
 * Side by side on desktop; stacked below `lg`, where the two strings together
 * are wider than a phone.
 */
function StatusPill({ availability }: { availability: string | null }) {
  return (
    <div className="flex w-full flex-col gap-1.5 self-start rounded-sm border border-border bg-surface px-3.5 py-2.5 font-mono text-xs leading-5 lg:w-auto lg:flex-row lg:items-center lg:gap-2.5">
      {availability ? (
        <span className="flex items-center gap-2.5">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-primary" />
          {availability}
        </span>
      ) : null}

      {availability ? (
        <span aria-hidden className="hidden text-text-tertiary lg:inline">
          ·
        </span>
      ) : null}

      <span className="text-text-tertiary">{TIMEZONE_LABEL}</span>
    </div>
  );
}

function RuledList({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col">
      <p className="mb-3 font-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-text-tertiary">
        {label}
      </p>
      {children}
    </div>
  );
}

/**
 * One ruled row. Stacked below `lg` so the tags wrap under the title; a single
 * line above it, with the trailing column pushed right.
 */
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-sm border-t border-border py-4 transition-colors hover:bg-surface/50 lg:flex-row lg:items-center lg:gap-4">
      {children}
    </div>
  );
}

/** Smaller than the shared TechTag: 11px on a 4px radius, per the frame. */
function AboutTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[4px] border border-border px-2 py-[3px] font-mono text-[11px] leading-4 text-text-secondary transition-colors hover:border-primary/40 hover:text-primary">
      {children}
    </span>
  );
}
