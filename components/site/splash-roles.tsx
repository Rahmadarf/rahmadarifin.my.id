"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SPLASH_ROLES } from "@/lib/content/defaults";

// How long each role holds before the next one is asked for. It has to clear
// the swap itself — the old line leaves before the new one arrives — or a role
// would be replaced while it was still arriving.
const HOLD_MS = 750;

const LEAVE = { duration: 0.22, ease: [0.4, 0, 1, 1] } as const;
const ARRIVE = { duration: 0.26, ease: [0.22, 1, 0.36, 1] } as const;

// 21px text at the design's leading. The box is fixed and clipped so the bars
// above and the byline below never move, however long a role is.
const LINE_HEIGHT = 32;

/**
 * The rotating role line on the splash.
 *
 * `mode="wait"` is what produces the described order: the old line rises out
 * of the box, and only then does the next one come up from below. Running them
 * together would cross two lines in a box only tall enough for one.
 *
 * The rotation is decoration — it never gates the splash. Whatever role is on
 * screen when the splash is dismissed simply fades out with it, which is why
 * the roadmap allows for not every role being seen.
 */
export function SplashRoles({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Guarded on `active`, not left to run: the overlay stays mounted for the
    // life of the page so the pre-paint CSS rule has something to match, and
    // an unguarded interval would tick every 750ms forever, re-rendering a
    // component nobody can see — on every visit, splash or not.
    if (!active) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % SPLASH_ROLES.length),
      HOLD_MS,
    );
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: LINE_HEIGHT }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={SPLASH_ROLES[index]}
          // Percentages, not pixels: the travel then matches the box height
          // whatever the type scale does.
          initial={{ y: "100%" }}
          animate={{ y: "0%", transition: ARRIVE }}
          exit={{ y: "-100%", transition: LEAVE }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-[21px] font-bold tracking-[-0.01em]"
        >
          {SPLASH_ROLES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
