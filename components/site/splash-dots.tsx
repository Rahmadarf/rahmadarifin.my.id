"use client";

import { useEffect, useRef } from "react";
import { SPLASH_PRESS_MS as PRESS_MS } from "@/lib/splash";
import {
  DOT_CELL,
  DOT_RADIUS,
  TAU,
  sizeDotCanvas,
} from "@/lib/dot-grid";

// The roadmap asks for "a smooth wave with organic variation, not blinking or
// movement that is random per dot". So the field is deterministic: three sine
// waves crossing at different angles, speeds and wavelengths. Their sum never
// repeats on a timescale anyone will watch, which reads as organic, while
// neighbouring dots stay in step with each other — which is what separates a
// wave from noise.
const WAVES = [
  { dirX: 0.84, dirY: 0.54, length: 260, speed: 0.55, weight: 1 },
  { dirX: -0.42, dirY: 0.91, length: 170, speed: -0.38, weight: 0.62 },
  { dirX: 0.31, dirY: -0.95, length: 95, speed: 0.74, weight: 0.33 },
] as const;

// Summed weights, so the field is normalised to roughly -1..1.
const WAVE_TOTAL = WAVES.reduce((total, wave) => total + wave.weight, 0);

/** How far a dot drifts from home, in px. Small: this is a texture. */
const DRIFT = 2.6;

/** Dots dim and brighten with the crest, which gives the wave its depth. */
const MIN_ALPHA = 0.45;
const MAX_ALPHA = 1;

// The press: a beat before the gap opens, dots near the centre are pulled
// towards it, as if the middle of the field had been pushed in. It reaches
// furthest at the centre and fades out by PRESS_REACH, so the field does not
// visibly jerk at the edges.
const PRESS_REACH = 420;
const PRESS_DEPTH = 14;

/**
 * The splash background: the hero's dot pattern, moving as a wave.
 *
 * Painted on a canvas rather than animated in CSS because every dot needs its
 * own phase — a background-image cannot do that. It fills its own background
 * first so the static CSS `.dot-grid` underneath, which is what the visitor
 * sees before React has hydrated, is covered rather than showing through
 * behind the moving dots.
 */
export function SplashDots({
  active,
  pressing,
}: {
  active: boolean;
  /** The centre is being pushed in, ahead of the gap opening. */
  pressing: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read inside the draw loop, so turning the press on does not restart the
  // animation and reset the wave's clock. Mirrored in an effect rather than
  // assigned during render, which React forbids.
  const pressingRef = useRef(pressing);
  useEffect(() => {
    pressingRef.current = pressing;
  }, [pressing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !host || !context || !active) return;

    let grid = sizeDotCanvas(canvas, context, host);
    let frame = 0;
    const started = performance.now();
    let pressStarted = 0;

    const styles = getComputedStyle(canvas);
    // `color` carries --dot-grid-color and `backgroundColor` the page colour,
    // so the palette stays in CSS and follows the theme.
    const dotColour = styles.color;
    const backdrop = styles.backgroundColor;

    function draw(now: number) {
      if (!grid) {
        grid = sizeDotCanvas(canvas!, context!, host!);
        if (!grid) {
          frame = requestAnimationFrame(draw);
          return;
        }
      }

      const seconds = (now - started) / 1000;

      if (pressingRef.current && pressStarted === 0) pressStarted = now;
      // Eases in and then stays down: the gap opens over the pressed field
      // rather than letting it spring back first.
      const press = pressStarted
        ? Math.min(1, (now - pressStarted) / PRESS_MS) ** 0.6
        : 0;
      const centreX = grid.width / 2;
      const centreY = grid.height / 2;

      context!.fillStyle = backdrop;
      context!.fillRect(0, 0, grid.width, grid.height);
      context!.fillStyle = dotColour;

      for (let row = 0; row < grid.rows; row += 1) {
        for (let column = 0; column < grid.columns; column += 1) {
          const homeX = DOT_CELL / 2 + column * DOT_CELL;
          const homeY = DOT_CELL / 2 + row * DOT_CELL;

          let field = 0;
          for (const wave of WAVES) {
            const along = homeX * wave.dirX + homeY * wave.dirY;
            field +=
              wave.weight *
              Math.sin((along / wave.length) * TAU + seconds * wave.speed * TAU);
          }
          field /= WAVE_TOTAL;

          // Dots ride the wave along its dominant direction, so the motion
          // reads as one surface rather than each dot bobbing on its own.
          let x = homeX + field * DRIFT * WAVES[0].dirX;
          let y = homeY + field * DRIFT * WAVES[0].dirY;

          if (press > 0) {
            const toCentreX = centreX - homeX;
            const toCentreY = centreY - homeY;
            const distance = Math.hypot(toCentreX, toCentreY);
            if (distance > 0.001 && distance < PRESS_REACH) {
              const falloff = 1 - distance / PRESS_REACH;
              const pull = PRESS_DEPTH * falloff * falloff * press;
              x += (toCentreX / distance) * pull;
              y += (toCentreY / distance) * pull;
            }
          }

          context!.globalAlpha =
            MIN_ALPHA + ((field + 1) / 2) * (MAX_ALPHA - MIN_ALPHA);
          context!.beginPath();
          context!.arc(x, y, DOT_RADIUS, 0, TAU);
          context!.fill();
        }
      }

      context!.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => {
      grid = sizeDotCanvas(canvas, context, host);
    });
    observer.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ color: "var(--dot-grid-color)" }}
      className="pointer-events-none absolute inset-0 h-full w-full bg-background"
    />
  );
}
