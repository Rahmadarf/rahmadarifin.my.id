"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MONOGRAM } from "@/lib/content/defaults";
import { ThemeToggle } from "@/components/site/theme-toggle";

// Floating pill navbar from the design: fixed top-centre, blurred glass.
// Section links resolve against the home page so they keep working from the
// projects routes.
const LINKS = [
  { label: "Home", href: "/#about" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#journey" },
  { label: "Contact", href: "/#contact" },
] as const;

// Five links plus the monogram and theme toggle stop fitting well below
// ~1024px — on a 375px phone the last link and the toggle were pushed off the
// pill entirely. Below `lg`, including iPad portrait at 768px, they move into a
// hamburger panel instead.
export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onProjects = pathname.startsWith("/projects");

  const isActive = (href: string) =>
    href === "/projects" ? onProjects : false;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed left-1/2 top-4 z-50 flex w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-border bg-background/75 py-2.5 pl-3 pr-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl sm:top-6 lg:w-auto lg:max-w-none lg:justify-start lg:gap-7 lg:pl-5"
    >
      <Link
        href="/"
        aria-label="Home"
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-accent font-mono text-[13px] font-semibold text-primary"
      >
        {MONOGRAM}
      </Link>

      <div className="hidden items-center gap-7 lg:flex">
        {LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={cn(
              "shrink-0 text-sm font-medium transition-colors",
              isActive(link.href)
                ? "font-semibold text-primary"
                : "text-text-secondary hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            aria-label="Buka menu navigasi"
            className="flex size-[34px] items-center justify-center rounded-full border border-input bg-surface-alt text-foreground transition-colors hover:border-primary/40 hover:text-primary lg:hidden"
          >
            <Menu className="size-4" />
          </Dialog.Trigger>

          <Dialog.Portal>
            {/* Radix handles focus trapping, Escape, and outside clicks. The
                panel closes on link click, which also covers same-page hash
                links where the route never changes. */}
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />

            <Dialog.Content className="fixed left-1/2 top-4 z-[60] flex w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 flex-col gap-1 rounded-3xl border border-border bg-background p-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] sm:top-6">
              <Dialog.Title className="sr-only">Navigasi</Dialog.Title>

              <div className="flex items-center justify-between pb-1 pl-1">
                <span className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-accent font-mono text-[13px] font-semibold text-primary">
                  {MONOGRAM}
                </span>
                <Dialog.Close
                  aria-label="Tutup menu navigasi"
                  className="flex size-[34px] items-center justify-center rounded-full border border-input bg-surface-alt text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <X className="size-4" />
                </Dialog.Close>
              </div>

              {LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    // 44px minimum tap target.
                    "flex min-h-11 items-center rounded-2xl px-4 text-[15px] font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-accent font-semibold text-primary"
                      : "text-text-secondary hover:bg-surface hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </nav>
  );
}
