"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { EntranceProvider } from "@/components/site/entrance-context";
import { SplashDots } from "@/components/site/splash-dots";
import { SplashRoles } from "@/components/site/splash-roles";
import { BRAND_NAME } from "@/lib/content/defaults";
import {
  SPLASH_ATTRIBUTE,
  SPLASH_DURATION_MS,
  SPLASH_STORAGE_KEY,
} from "@/lib/splash";

const BAR_DELAYS = [0, 0.15, 0.3, 0.45, 0.6];

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
  const [phase, setPhase] = useState<"showing" | "leaving" | "done">(() =>
    typeof document !== "undefined" &&
    document.documentElement.getAttribute(SPLASH_ATTRIBUTE) === "show"
      ? "showing"
      : "done",
  );

  const router = useRouter();
  const live = phase !== "done";

  useEffect(() => {
    if (phase !== "showing") {
      // The single place the clock is reset, covering both cases: a visit
      // with no splash, and the moment a splash has finished. It has to be
      // every visit or the threshold would measure the gap between splashes
      // rather than the gap between visits — and it has to be after the
      // splash, so a tab closed midway still counts the next visit as fresh.
      if (phase === "done") markVisit();
      return;
    }

    // Warm the page most visitors go to next. Deliberately not awaited and
    // given no failure path: a slow or failing prefetch must not hold the
    // splash, and /projects has to work when opened directly regardless.
    router.prefetch("/projects");

    const timer = window.setTimeout(
      () => setPhase("leaving"),
      SPLASH_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase, router]);

  const onFaded = useCallback(() => {
    if (phase !== "leaving") return;

    // Hiding is the attribute's job right to the end, so it comes off only
    // now — removing it earlier would have cut the fade short.
    document.documentElement.removeAttribute(SPLASH_ATTRIBUTE);
    setPhase("done");
  }, [phase]);

  return (
    // "waiting" holds the navbar back until the splash has gone, so the two
    // read as one movement instead of overlapping.
    <EntranceProvider stage={live ? "waiting" : "ready"}>
      {children}

      {/* Always rendered, never unmounted. The server has to emit this markup
          for the pre-paint CSS rule to have something to match, and leaving it
          in place afterwards costs nothing: `display: none` stops the bars
          animating. */}
      <motion.div
          className="splash-overlay dot-grid fixed inset-0 z-[100] flex-col items-center justify-center gap-7 bg-background"
          aria-hidden
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "leaving" ? 0 : 1 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 1, 1] }}
          onAnimationComplete={onFaded}
        >
          {/* Kept animating through the fade-out so the wave does not freeze
              on its last frame while the layer is still visible. */}
          <SplashDots active={phase !== "done"} />

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
            <SplashRoles active={phase !== "done"} />
            <p className="text-sm text-text-tertiary">
              {BRAND_NAME} · Portfolio
            </p>
          </div>
      </motion.div>
    </EntranceProvider>
  );
}
