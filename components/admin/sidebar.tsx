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
    <aside className="flex shrink-0 flex-col gap-7 border-b border-border bg-background p-5 md:h-dvh md:w-60 md:border-b-0 md:border-r md:sticky md:top-0 md:py-7">
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

      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
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

      <div className="flex flex-col gap-0.5 border-t border-border pt-4 md:mt-auto">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-text-secondary hover:text-foreground"
        >
          <ExternalLink className="size-3.5" strokeWidth={2.2} />
          View Site
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-text-secondary hover:text-foreground"
          >
            <LogOut className="size-3.5" strokeWidth={2.2} />
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}
