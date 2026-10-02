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
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME, MONOGRAM } from "@/lib/content/defaults";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useEntranceStage } from "@/components/site/entrance-context";
import { useNavEntrance } from "@/components/site/use-nav-entrance";

// Floating pill navbar from the design: fixed top-centre, blurred glass.
// Section links resolve against the home page so they keep working from the
// projects routes.
// No "Home" entry: the monogram and name beside it already link to the home
// page. The entry that used to carry that label pointed at /#about, so it is
// named "About" now — the label matches the destination and no longer
// duplicates the brand link.
const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#journey" },
  { label: "Contact", href: "/#contact" },
] as const;

// The pill is 54px tall: 34px controls plus 10px padding each side. Collapsing
// the sheet to exactly that height parks it behind the pill, so opening reads
// as the sheet unrolling out from under it and closing tucks it back.
const COLLAPSED_HEIGHT = 54;

// Enter: ease-out, 280ms. Exit: ease-in and shorter, per the house rule that
// exits run at roughly three quarters of the enter duration.
const ENTER = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const;
const EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const;

// Entrance, Dynamic Island style. The pill drops in as a circle, widens around
// the monogram, then its contents fade in — roughly 0.75s end to end.
//
//   0.00–0.28s  circle drops from above and fades in   (here)
//   0.26–0.58s  width expands from the circle          (useNavEntrance)
//   0.46–0.75s  name, links, and controls fade in      (ITEM_VARIANTS)
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

// Five links plus the monogram and theme toggle stop fitting well below
// ~1024px — on a 375px phone the last link and the toggle were pushed off the
// pill entirely. Below `lg`, including iPad portrait at 768px, they move into
// this sheet instead.
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
    <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
      {/* Positioning is split off the pill so Motion owns the pill's transform
          outright. Sharing it with `-translate-x-1/2` would mean the entrance's
          `y` wiped out the centring. */}
      <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 sm:top-6">
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
            "flex w-[calc(100vw-1.5rem)] max-w-md items-center justify-between gap-3 rounded-full border border-border bg-background/75 py-2.5 pl-3 pr-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl lg:w-auto lg:max-w-none lg:justify-start lg:gap-7 lg:pl-5",
            // Clipped only while the pill is narrower than its contents.
            // Leaving it on would crop the focus rings of the links inside.
            !entered && "overflow-hidden",
          )}
        >
          {/* Monogram plus name. The monogram is decorative once the name is
              visible, so it is hidden from assistive tech and the link is named
              by its text. */}
          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-2.5 lg:shrink-0"
          >
            {/* Not wrapped in the fade: the monogram is the circle the
                entrance starts from, so it is visible from the first frame. */}
            <span
              ref={monogramRef}
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-accent font-mono text-[13px] font-semibold text-primary"
            >
              {MONOGRAM}
            </span>
            <motion.span
              variants={ITEM_VARIANTS}
              className="truncate text-sm font-semibold tracking-tight"
            >
              {BRAND_NAME}
            </motion.span>
          </Link>

          <motion.div
            variants={ITEM_VARIANTS}
            className="hidden items-center gap-7 lg:flex"
          >
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
          </motion.div>

          <motion.div
            variants={ITEM_VARIANTS}
            className="flex shrink-0 items-center gap-2"
          >
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
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden"
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
                className="fixed left-1/2 top-4 z-40 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 overflow-hidden rounded-[28px] border border-border bg-background shadow-[0_16px_44px_rgba(0,0,0,0.22)] sm:top-6 lg:hidden"
              >
                <Dialog.Title className="sr-only">Navigasi</Dialog.Title>

                {/* Sits behind the pill; nothing is drawn here. */}
                <div aria-hidden style={{ height: COLLAPSED_HEIGHT }} />

                <div className="flex flex-col divide-y divide-border border-t border-border pb-2 pt-2">
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
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
