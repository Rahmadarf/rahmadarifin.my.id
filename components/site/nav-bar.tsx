"use client";

import { useEffect, useRef, useState } from "react";
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

// The pill is 54px tall (34px controls + 10px padding each side). The menu
// sheet starts at the same top offset as the pill and pads its content past
// that height, so it reads as sliding out from behind the pill rather than
// turning the pill into a tall panel.
const SHEET_TOP_PADDING = "pt-[62px]";

// Five links plus the monogram and theme toggle stop fitting well below
// ~1024px — on a 375px phone the last link and the toggle were pushed off the
// pill entirely. Below `lg`, including iPad portrait at 768px, they move into
// this sheet instead.
export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onProjects = pathname.startsWith("/projects");

  const isActive = (href: string) =>
    href === "/projects" ? onProjects : false;

  // The sheet is non-modal so the pill above it stays live — that is the whole
  // point of it sitting behind the pill. Non-modal means Radix does not lock
  // scrolling either, so do it here.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
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

          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={open}
            aria-controls="site-nav-menu"
            onClick={() => setOpen((value) => !value)}
            className="flex size-[34px] items-center justify-center rounded-full border border-input bg-surface-alt text-foreground transition-colors hover:border-primary/40 hover:text-primary lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      <Dialog.Portal>
        {/* Rendered by hand: Radix only ships an Overlay for modal dialogs.
            DialogPortal mounts each child only while the dialog is open, so
            this needs no presence handling of its own. */}
        <div
          aria-hidden
          onPointerDown={() => setOpen(false)}
          className="fixed inset-0 z-30 animate-in bg-black/40 fade-in backdrop-blur-[2px] lg:hidden"
        />

        <Dialog.Content
          id="site-nav-menu"
          onInteractOutside={(event) => {
            // The pill's own button toggles this sheet. Without the guard the
            // dismissable layer would close on pointer-down and the click
            // would immediately reopen it.
            if (triggerRef.current?.contains(event.target as Node)) {
              event.preventDefault();
            }
          }}
          className={cn(
            "fixed left-1/2 top-4 z-40 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 overflow-hidden rounded-[28px] border border-border bg-background pb-2 shadow-[0_16px_44px_rgba(0,0,0,0.22)] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-4 sm:top-6 lg:hidden",
            SHEET_TOP_PADDING,
          )}
        >
          <Dialog.Title className="sr-only">Navigasi</Dialog.Title>

          <div className="flex flex-col divide-y divide-border border-t border-border">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  // 48px rows keep every item a comfortable tap target.
                  "flex min-h-12 items-center px-5 text-[15px] font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-accent font-semibold text-primary"
                    : "text-text-secondary hover:bg-surface hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
