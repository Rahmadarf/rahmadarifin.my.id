import { cn } from "@/lib/utils";

// Shared page shell for every public section.
//
// The design's grid: 120px gutters and a 1200px content column on desktop
// (which is exactly 1440 at the frame width), 24px gutters and a single column
// on mobile. Figma has no frame between 768 and 1023px, so that range keeps
// the mobile stack and caps the column at 640px, centred — the same trick the
// navbar already uses to switch at `lg` rather than `md`.
//
// Every section opens with a 1px divider spanning the content column; that is
// the only separator in the design, which carries no shadows.
export function Section({
  id,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  /** Vertical rhythm overrides; the default is the design's section spacing. */
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("w-full px-6 pb-6 pt-16 lg:px-30 lg:pb-10 lg:pt-24", className)}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[640px] flex-col gap-7 lg:max-w-[1200px] lg:gap-10",
          innerClassName,
        )}
      >
        <div aria-hidden className="h-px w-full shrink-0 bg-border" />
        {children}
      </div>
    </section>
  );
}

/** The numbered mono label above every section heading. */
export function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex gap-2.5 font-mono text-xs leading-4">
      <span className="text-primary">{number}</span>
      <span className="uppercase tracking-[0.08em] text-text-tertiary">
        {children}
      </span>
    </p>
  );
}

/**
 * Label, H2 and an optional action on the right.
 *
 * The action is desktop-only by design: on mobile the "All projects" link
 * becomes a full-width secondary button at the end of the section instead.
 */
export function SectionHeader({
  number,
  label,
  title,
  action,
}: {
  number: string;
  label: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
      <div className="flex flex-col gap-2.5 lg:gap-3">
        <SectionLabel number={number}>{label}</SectionLabel>
        <h2 className="text-[32px] leading-9 tracking-[-0.03em] lg:text-[40px] lg:leading-[44px]">
          {title}
        </h2>
      </div>

      {action ? <div className="hidden lg:block">{action}</div> : null}
    </div>
  );
}
