"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MONOGRAM } from "@/lib/content/defaults";
import { ThemeToggle } from "@/components/site/theme-toggle";

// Floating pill navbar from the design: fixed top-centre, blurred glass.
// Section links resolve against the home page so they keep working from the
// projects routes.
const LINKS = [
  { label: "Home", href: "/#about", match: "/" },
  { label: "Projects", href: "/projects", match: "/projects" },
  { label: "Skills", href: "/#skills", match: "/" },
  { label: "Experience", href: "/#journey", match: "/" },
  { label: "Contact", href: "/#contact", match: "/" },
] as const;

export function NavBar() {
  const pathname = usePathname();
  const onProjects = pathname.startsWith("/projects");

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed left-1/2 top-4 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-3 overflow-x-auto rounded-full border border-border bg-background/75 py-2.5 pl-3 pr-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:top-6 sm:gap-7 sm:pl-5"
    >
      <Link
        href="/"
        aria-label="Home"
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-accent font-mono text-[13px] font-semibold text-primary"
      >
        {MONOGRAM}
      </Link>

      {LINKS.map((link) => {
        const active = link.match === "/projects" ? onProjects : false;
        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 text-sm font-medium transition-colors",
              active
                ? "font-semibold text-primary"
                : "text-text-secondary hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}

      <ThemeToggle />
    </nav>
  );
}
