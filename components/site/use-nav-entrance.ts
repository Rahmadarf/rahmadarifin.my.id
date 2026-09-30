"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate } from "motion/react";

// The pill is 54px tall, so a 54px-wide pill is a circle — the shape the
// monogram arrives in before the bar widens around it.
export const NAV_CIRCLE_WIDTH = 54;

const WIDTH_DELAY = 0.26;
const WIDTH_DURATION = 0.32;
const WIDTH_EASE = [0.22, 1, 0.36, 1] as const;

// useLayoutEffect warns when React renders this component on the server. The
// measurement has to happen before paint, so fall back to useEffect there
// rather than moving the work.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Widens the navbar from a circle to its full width.
 *
 * Width is animated rather than clipped so the pill's drop shadow follows the
 * edge that is moving, and rather than scaled so the name and icons are never
 * stretched.
 *
 * The natural width cannot be written as a constant: on mobile it is
 * `calc(100vw - 1.5rem)` capped at `max-w-md`, and on desktop it is whatever
 * the links add up to. So it is measured from the element before the start
 * value is applied, and the inline width is cleared afterwards so the
 * responsive classes govern again — including across a resize.
 */
export function useNavEntrance({
  ref,
  enabled,
  instant,
  onComplete,
}: {
  ref: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  /** prefers-reduced-motion: finish immediately instead of animating. */
  instant: boolean;
  onComplete: () => void;
}) {
  // The target survives re-runs of the effect. React invokes effects twice in
  // development, and by the second run the element is already pinned to the
  // circle width — measuring again would make the circle its own target and
  // leave the navbar stuck as a dot.
  const targetWidth = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // The server cannot know the motion preference, so the hidden state is
    // rendered either way and reduced motion is honoured by finishing here
    // rather than by rendering different markup. Branching the markup produced
    // a hydration mismatch that React refused to patch up, which left the
    // navbar clipped.
    if (instant) {
      onComplete();
      return;
    }

    if (targetWidth.current === null) {
      // The element is still laid out by its classes here, and Motion's
      // `initial` has it at opacity 0, so nothing is visible yet.
      targetWidth.current = element.getBoundingClientRect().width;
    }

    // Applied before paint, so the full-width bar is never shown.
    element.style.width = `${NAV_CIRCLE_WIDTH}px`;

    let cancelled = false;
    let frame = 0;
    const controls = animate(
      element,
      { width: [`${NAV_CIRCLE_WIDTH}px`, `${targetWidth.current}px`] },
      {
        delay: WIDTH_DELAY,
        duration: WIDTH_DURATION,
        ease: WIDTH_EASE,
        // The option, not the returned promise: Motion writes the final
        // keyframe before calling this. Clearing the width from `.then()`
        // instead lost the race, and the measured pixel value stayed inline —
        // which would freeze the navbar at whatever width it was built at and
        // survive a resize.
        onComplete: () => {
          // A stopped animation must not report success; the replacement run
          // owns the finish from here.
          if (cancelled) return;

          onComplete();

          // Deferred by a frame: Motion commits the final keyframe around this
          // callback, so clearing the width inline here is overwritten. The
          // value it writes equals the natural width, so the extra frame is
          // invisible — but it has to go, or the navbar keeps the pixel width
          // it was built at and stops responding to a resize.
          frame = requestAnimationFrame(() => {
            if (!cancelled) element.style.width = "";
          });
        },
      },
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      controls.stop();
    };
  }, [enabled, instant, onComplete, ref]);
}
