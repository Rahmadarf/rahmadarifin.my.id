"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate } from "motion/react";

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
type Measurements = {
  /** Natural width the pill settles at. */
  width: number;
  /** Diameter of the opening circle: the pill's own height, borders included. */
  diameter: number;
  /** Horizontal padding that centres the monogram inside that circle. */
  startPadding: number;
  paddingLeft: string;
  paddingRight: string;
};

export function useNavEntrance({
  ref,
  monogramRef,
  enabled,
  instant,
  onComplete,
}: {
  ref: React.RefObject<HTMLElement | null>;
  /** The circle is sized and centred around this element. */
  monogramRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  /** prefers-reduced-motion: finish immediately instead of animating. */
  instant: boolean;
  onComplete: () => void;
}) {
  // Measurements survive re-runs of the effect. React invokes effects twice in
  // development, and by the second run the element is already pinned to the
  // circle — measuring again would make the circle its own target and leave
  // the navbar stuck as a dot.
  const measured = useRef<Measurements | null>(null);

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

    if (measured.current === null) {
      // The element is still laid out by its classes here, and Motion's
      // `initial` has it at opacity 0, so nothing is visible yet.
      const rect = element.getBoundingClientRect();
      const styles = getComputedStyle(element);

      // The diameter is the pill's own height rather than a constant. Height
      // is content plus padding plus the 1px borders, so hard-coding it got
      // the borders wrong and opened on a 54x56 ellipse.
      const diameter = rect.height;

      // Centre the monogram in that circle. The pill's resting padding is
      // deliberately lopsided — pl-3 against pr-2.5 — which left the monogram
      // 4px right of centre while the pill was still a circle. Both sides
      // start even and ease to their resting values as it widens.
      const monogramWidth =
        monogramRef.current?.getBoundingClientRect().width ?? 0;
      const borders =
        parseFloat(styles.borderLeftWidth) +
        parseFloat(styles.borderRightWidth);

      measured.current = {
        width: rect.width,
        diameter,
        startPadding: Math.max(0, (diameter - borders - monogramWidth) / 2),
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
      };
    }

    const { width, diameter, startPadding, paddingLeft, paddingRight } =
      measured.current;

    // Applied before paint, so the full-width bar is never shown.
    element.style.width = `${diameter}px`;
    element.style.paddingLeft = `${startPadding}px`;
    element.style.paddingRight = `${startPadding}px`;

    let cancelled = false;
    let frame = 0;
    const controls = animate(
      element,
      {
        width: [`${diameter}px`, `${width}px`],
        paddingLeft: [`${startPadding}px`, paddingLeft],
        paddingRight: [`${startPadding}px`, paddingRight],
      },
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
            if (cancelled) return;
            element.style.width = "";
            element.style.paddingLeft = "";
            element.style.paddingRight = "";
          });
        },
      },
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      controls.stop();
    };
  }, [enabled, instant, monogramRef, onComplete, ref]);
}
