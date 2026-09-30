"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { MONOGRAM } from "@/lib/content/defaults";
import { signOut } from "@/lib/actions/auth";

const TABS = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/timeline", label: "Timeline" },
  { href: "/admin/skills", label: "Tech Stack" },
  { href: "/admin/social", label: "Social Links" },
  { href: "/admin/profile", label: "Profile" },
] as const;

export function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    // The fixed 240px rail only pays for itself once there is room left for the
    // forms beside it. At iPad-portrait width it left ~528px, so the rail now
    // starts at `lg` and smaller screens get a top bar instead — the same
    // breakpoint the public navbar switches at.
    <aside className="sticky top-0 z-20 flex shrink-0 flex-col gap-4 border-b border-border bg-background p-5 lg:h-dvh lg:w-60 lg:gap-7 lg:border-b-0 lg:border-r lg:py-7">
      <div className="flex items-center gap-2.5">
        <div className="flex size-[34px] items-center justify-center rounded-full border border-primary/30 bg-accent font-mono text-[13px] font-semibold text-primary">
          {MONOGRAM}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">Admin</span>
          {email ? (
            <span className="max-w-36 truncate text-[11px] text-text-tertiary">
              {email}
            </span>
          ) : null}
        </div>
      </div>

      {/* Five tabs do not fit across a phone, so they scroll sideways below
          `lg`. The scrollbar itself is hidden because it would sit on top of
          the tab labels on macOS. */}
      <nav className="-mx-5 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0 [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold transition-colors",
                active
                  ? "bg-accent text-primary"
                  : "text-text-secondary hover:bg-surface hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-row gap-3 border-t border-border pt-3 lg:mt-auto lg:flex-col lg:gap-0.5 lg:pt-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 px-3 text-[13px] font-medium text-text-secondary hover:text-foreground"
        >
          <ExternalLink className="size-3.5" strokeWidth={2.2} />
          View Site
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-2 px-3 text-[13px] font-medium text-text-secondary hover:text-foreground"
          >
            <LogOut className="size-3.5" strokeWidth={2.2} />
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}
