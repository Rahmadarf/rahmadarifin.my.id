"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate } from "motion/react";
import { EntranceProvider } from "@/components/site/entrance-context";
import { SplashDots } from "@/components/site/splash-dots";
import { SplashRoles } from "@/components/site/splash-roles";
import { BRAND_NAME } from "@/lib/content/defaults";
import {
  NAVBAR_AFTER_CLOSE_MS,
  SPLASH_ATTRIBUTE,
  SPLASH_MAX_MS,
  SPLASH_MIN_MS,
  SPLASH_OPEN_MS,
  SPLASH_PRESS_MS,
  SPLASH_STORAGE_KEY,
} from "@/lib/splash";
import { whenPageReady } from "@/lib/page-ready";

// showing  the splash holds, bars bouncing and roles cycling
// pressing the dots at the centre are pushed in, a beat before the gap opens
// opening  a circular gap grows from the centre until the overlay is gone
// closing  the overlay is already invisible; the hero's dots are filling in
// done     settled
type Phase = "showing" | "pressing" | "opening" | "closing" | "done";

const BAR_DELAYS = [0, 0.15, 0.3, 0.45, 0.6];

const STAGE_FOR_PHASE = {
  showing: "waiting",
  pressing: "waiting",
  opening: "opening",
  closing: "closing",
  done: "ready",
} as const;

function markVisit() {
  try {
    window.localStorage.setItem(SPLASH_STORAGE_KEY, String(Date.now()));
  } catch {
    // Storage can be unavailable or full. A splash on the next visit is a
    // better failure than a broken page.
  }
}

/**
 * Wraps the public site with the opening splash.
 *
 * The blocking script in the layout has already decided whether this visit
 * gets one; this reads that decision, runs the timer, and hands the entrance
 * over to the navbar on the way out.
 */
export function SplashScreen({ children }: { children: React.ReactNode }) {
  // Read during render rather than in an effect: an effect would run after the
  // first paint and the overlay would appear on top of a page the visitor had
  // already seen.
  //
  // Nothing this renders may depend on it, or the server and client disagree
  // and React refuses to patch the difference up. So no attribute or class
  // here is derived from `phase`: the overlay's markup is fixed, visibility is
  // the CSS rule keyed on <html>, and `phase` only drives Motion's `animate`
  // (never server-rendered) and the entrance stage (context, not markup).
  const [phase, setPhase] = useState<Phase>(() =>
    typeof document !== "undefined" &&
    document.documentElement.getAttribute(SPLASH_ATTRIBUTE) === "show"
      ? "showing"
      : "done",
  );

  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const live = phase !== "done" && phase !== "closing";

  useEffect(() => {
    if (phase === "done") {
      // The single place the clock is reset, covering both cases: a visit
      // with no splash, and the moment a splash has finished. It has to be
      // every visit or the threshold would measure the gap between splashes
      // rather than the gap between visits — and it has to be after the
      // splash, so a tab closed midway still counts the next visit as fresh.
      markVisit();
      return;
    }

    if (phase === "showing") {
      // Warm the page most visitors go to next. Deliberately not awaited and
      // kept out of the readiness condition below: the roadmap excludes route
      // prefetches from it, a slow or failing one must not hold the splash,
      // and /projects has to work when opened directly regardless.
      router.prefetch("/projects");

      // The splash holds for the page behind it, not for a fixed stretch —
      // but never shorter than the floor, and never past the ceiling.
      let finished = false;
      const startedAt = performance.now();
      let floorTimer = 0;

      const advance = () => {
        if (finished) return;
        finished = true;
        setPhase("pressing");
      };

      const ceiling = window.setTimeout(advance, SPLASH_MAX_MS);

      void whenPageReady().then(() => {
        if (finished) return;
        const remaining =
          SPLASH_MIN_MS - (performance.now() - startedAt);
        if (remaining <= 0) advance();
        else floorTimer = window.setTimeout(advance, remaining);
      });

      return () => {
        finished = true;
        window.clearTimeout(ceiling);
        window.clearTimeout(floorTimer);
      };
    }

    // The exit beats are animation, not waiting, so they keep fixed lengths.
    const next: Record<"pressing" | "opening" | "closing", [Phase, number]> = {
      pressing: ["opening", SPLASH_PRESS_MS],
      opening: ["closing", SPLASH_OPEN_MS],
      closing: ["done", NAVBAR_AFTER_CLOSE_MS],
    };

    const [to, delay] = next[phase];
    const timer = window.setTimeout(() => {
      // The overlay is fully eaten away by the time the gap finishes growing,
      // so this is where it stops being painted at all — which also stops its
      // dot canvas.
      if (to === "closing") {
        document.documentElement.removeAttribute(SPLASH_ATTRIBUTE);
      }
      setPhase(to);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [phase, router]);

  // The gap is animated imperatively because its end radius has to reach the
  // far corner, which is only knowable at run time. Motion writes the custom
  // property every frame; the mask in globals.css reads it.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || phase !== "opening") return;

    const corner = Math.hypot(window.innerWidth, window.innerHeight) / 2;
    const controls = animate(
      overlay,
      { "--splash-hole": ["0px", `${Math.ceil(corner) + 40}px`] },
      { duration: SPLASH_OPEN_MS / 1000, ease: [0.4, 0, 0.2, 1] },
    );

    return () => controls.stop();
  }, [phase]);

  return (
    // The stage is what ties the three pieces together: the gap opening, the
    // hero's dots filling in behind it, and the navbar arriving last.
    <EntranceProvider stage={STAGE_FOR_PHASE[phase]}>
      {children}

      {/* Always rendered, never unmounted. The server has to emit this markup
          for the pre-paint CSS rule to have something to match, and leaving it
          in place afterwards costs nothing: `display: none` stops the bars
          animating. */}
      <div
          ref={overlayRef}
          className="splash-overlay dot-grid fixed inset-0 z-[100] flex-col items-center justify-center gap-7 bg-background"
          aria-hidden
        >
          {/* Kept drawing through the press and the opening, so the wave is
              still alive in whatever the growing gap has not eaten yet. */}
          <SplashDots active={live} pressing={phase === "pressing" || phase === "opening"} />

          {/* `relative` puts these above the canvas, which is positioned and
              would otherwise paint over them. */}
          <div className="relative flex h-12 items-end gap-2">
            {BAR_DELAYS.map((delay) => (
              <span
                key={delay}
                className="splash-bar"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>

          <div className="relative flex w-full flex-col items-center gap-2 text-center">
            <SplashRoles active={live} />
            <p className="text-sm text-text-tertiary">
              {BRAND_NAME} · Portfolio
            </p>
          </div>
      </div>
    </EntranceProvider>
  );
}
