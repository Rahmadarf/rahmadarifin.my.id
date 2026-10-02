"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";
import { BRAND_NAME, MONOGRAM } from "@/lib/content/defaults";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useEntranceStage } from "@/components/site/entrance-context";
import { useNavEntrance } from "@/components/site/use-nav-entrance";

// Floating pill navbar: fixed top-centre, opaque `surface` fill, hairline
// border, no shadow and no blur — the design has exactly one shadow on the
// whole site and it belongs to the mobile sheet.
//
// No "Home" entry: the monogram already links to the home page. "Projects"
// points at the /projects route rather than the home section, which is what
// lets it render as the active link on /projects and /projects/[slug].
const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Journey", href: "/#journey" },
  { label: "Contact", href: "/#contact" },
] as const;

// The mobile pill is 53px tall: 35px controls plus 8px padding each side plus
// the 1px borders. Collapsing the sheet to exactly that height parks it behind
// the pill, so opening reads as the sheet unrolling out from under it.
const COLLAPSED_HEIGHT = 53;

// Enter: ease-out, 280ms. Exit: ease-in and shorter, per the house rule that
// exits run at roughly three quarters of the enter duration.
const ENTER = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const;
const EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const;

// Entrance, Dynamic Island style. The pill drops in as a circle, widens around
// the monogram, then its contents fade in — roughly 0.75s end to end.
//
//   0.00–0.28s  circle drops from above and fades in   (here)
//   0.26–0.58s  width expands from the circle          (useNavEntrance)
//   0.46–0.75s  links and controls fade in             (ITEM_VARIANTS)
//
// Width lives in the hook because its target has to be measured; everything
// else is declarative so Motion renders the hidden state into the server HTML
// and the full-width bar is never painted first.
const SHELL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -56 },
  shown: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
      delayChildren: 0.46,
      staggerChildren: 0.03,
    },
  },
};

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
};

// Five links plus the monogram and the toggle stop fitting well below
// ~1024px, so below `lg` — including iPad portrait at 768px — they move into
// the sheet instead.
export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const onProjects = pathname.startsWith("/projects");

  const isActive = (href: string) =>
    href === "/projects" ? onProjects : false;

  const enter = reduceMotion ? { duration: 0 } : ENTER;
  const exit = reduceMotion ? { duration: 0 } : EXIT;

  // AnimatePresence owns the sheet's unmount, so Radix's own close-time focus
  // restore never runs — closing with Escape dropped focus on <body>. Put it
  // back on the trigger here instead.
  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) triggerRef.current?.focus();
  }, []);

  const navRef = useRef<HTMLElement | null>(null);
  const monogramRef = useRef<HTMLSpanElement | null>(null);
  const entranceStage = useEntranceStage();
  const [widthSettled, setWidthSettled] = useState(false);
  const onEntranceComplete = useCallback(() => setWidthSettled(true), []);

  // `entered` starts false on the server and on the client alike, and only
  // flips after mount. Deriving it from the motion preference during render
  // would change the markup the server produced, which React reports as a
  // hydration mismatch and then refuses to repair.
  const entered = widthSettled;

  useNavEntrance({
    ref: navRef,
    monogramRef,
    enabled: entranceStage === "ready",
    // prefers-reduced-motion lands on the finished state without animating.
    instant: reduceMotion === true,
    onComplete: onEntranceComplete,
  });

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
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      {/* Positioning is split off the pill so Motion owns the pill's transform
          outright. Sharing it with `-translate-x-1/2` would mean the entrance's
          `y` wiped out the centring. */}
      <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 lg:top-6">
        <motion.nav
          ref={navRef}
          data-nav-shell
          aria-label="Navigasi utama"
          // Always "hidden": the server renders this markup and has no way to
          // know the visitor's motion preference. Reduced motion is handled by
          // the zero-duration transition below, not by a different initial.
          initial="hidden"
          animate={entranceStage === "ready" ? "shown" : "hidden"}
          variants={SHELL_VARIANTS}
          transition={reduceMotion ? { duration: 0 } : undefined}
          className={cn(
            "flex w-[calc(100vw-2rem)] max-w-md items-center justify-between gap-1 rounded-full border border-border bg-surface py-2 pl-[18px] pr-2 lg:w-auto lg:max-w-none lg:justify-start lg:pl-2.5",
            // Clipped only while the pill is narrower than its contents.
            // Leaving it on would crop the focus rings of the links inside.
            !entered && "overflow-hidden",
          )}
        >
          {/* The monogram is the circle the entrance opens from, so it is
              visible from the first frame and is not wrapped in the fade.
              Its visible text is an abbreviation, so the link carries the
              full name for assistive tech. */}
          <Link
            href="/"
            aria-label={`${MONOGRAM} — ${BRAND_NAME}, halaman utama`}
            className="shrink-0 rounded-full pr-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:pl-2.5"
          >
            <span
              ref={monogramRef}
              className="block font-mono text-[13px] font-medium leading-[18px] tracking-[0.06em]"
            >
              {MONOGRAM}
            </span>
          </Link>

          <motion.div
            variants={ITEM_VARIANTS}
            className="hidden items-center gap-1 lg:flex"
          >
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3 py-[7px] text-sm leading-[18px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive(link.href)
                    ? "font-medium text-primary"
                    : "text-text-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          <motion.div
            variants={ITEM_VARIANTS}
            className="flex shrink-0 items-center gap-1.5 lg:ml-1 lg:gap-0"
          >
            <ThemeToggle />

            <button
              ref={triggerRef}
              type="button"
              aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={open}
              aria-controls="site-nav-menu"
              onClick={() => setOpen((value) => !value)}
              className="relative flex h-[35px] shrink-0 flex-col items-center justify-center gap-1 rounded-full bg-surface-alt px-[11px] text-sm leading-4 text-foreground transition-colors after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              {open ? (
                <span aria-hidden>&#10005;</span>
              ) : (
                <>
                  <span
                    aria-hidden
                    className="h-[1.5px] w-3.5 rounded-full bg-current"
                  />
                  <span
                    aria-hidden
                    className="h-[1.5px] w-3.5 rounded-full bg-current"
                  />
                </>
              )}
            </button>
          </motion.div>
        </motion.nav>
      </div>

      {/* AnimatePresence drives mounting, so the Radix portal is force-mounted
          and its own presence handling stays out of the way. */}
      <AnimatePresence>
        {open ? (
          <Dialog.Portal key="site-nav-menu" forceMount>
            {/* Hand-rolled: Radix only ships an Overlay for modal dialogs. */}
            <motion.div
              aria-hidden
              onPointerDown={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: exit }}
              transition={enter}
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            />

            <Dialog.Content
              asChild
              forceMount
              id="site-nav-menu"
              onInteractOutside={(event) => {
                // The pill's own button toggles this sheet. Without the guard
                // the dismissable layer would close on pointer-down and the
                // click would immediately reopen it.
                if (triggerRef.current?.contains(event.target as Node)) {
                  event.preventDefault();
                }
              }}
            >
              <motion.div
                // Animating height rather than clipping keeps the sheet's drop
                // shadow attached to the edge that is moving. A clip-path would
                // have cut the shadow off for as long as it stayed applied.
                initial={{ height: COLLAPSED_HEIGHT }}
                animate={{ height: "auto" }}
                exit={{ height: COLLAPSED_HEIGHT, transition: exit }}
                transition={enter}
                className="fixed left-1/2 top-4 z-40 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 overflow-hidden rounded-[28px] border border-border bg-background shadow-[0_16px_44px_rgba(0,0,0,0.22)] lg:hidden"
              >
                <Dialog.Title className="sr-only">Navigasi</Dialog.Title>

                {/* The pill row in the design. Nothing is drawn here: the real
                    pill sits above this spacer and already carries the
                    monogram, the toggle and the close button. */}
                <div aria-hidden style={{ height: COLLAPSED_HEIGHT }} />

                <div className="flex flex-col divide-y divide-border border-t border-border py-2">
                  {LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn(
                        // 48px rows, as the design draws them.
                        "flex h-12 items-center justify-between px-5 text-[15px] font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        isActive(link.href)
                          ? "bg-accent font-semibold text-primary"
                          : "text-text-secondary hover:bg-surface hover:text-foreground",
                      )}
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className={cn(
                          "font-mono text-xs leading-4",
                          isActive(link.href)
                            ? "text-primary"
                            : "text-text-tertiary",
                        )}
                      >
                        {isActive(link.href) ? "●" : "→"}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
