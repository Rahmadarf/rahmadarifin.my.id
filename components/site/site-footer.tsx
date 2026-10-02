import Link from "next/link";
import { FOOTER_BUILT_WITH } from "@/lib/content/defaults";

/**
 * Three mono items: copyright, what the site is built with, and a link back to
 * the top. One row on desktop, stacked and left-aligned on mobile. No top
 * border — the design separates the footer with whitespace only.
 *
 * The copyright is derived from the profile name and the current year. The
 * middle slot is `profile.footer_note`, which is the only CMS field the
 * design's footer has room for; it falls back to the design's own text.
 */
export function SiteFooter({
  note,
  name,
}: {
  note: string | null;
  name: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full px-6 pb-10 pt-4 lg:px-30 lg:pt-8">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-2.5 font-mono text-xs leading-4 lg:max-w-[1200px] lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <span className="text-text-tertiary">
          &copy; {year} {name}
        </span>

        <span className="text-text-tertiary">{note || FOOTER_BUILT_WITH}</span>

        <Link
          href="#page-top"
          className="self-start text-text-secondary transition-colors hover:text-primary"
        >
          Back to top <span aria-hidden>&uarr;</span>
        </Link>
      </div>
    </footer>
  );
}
