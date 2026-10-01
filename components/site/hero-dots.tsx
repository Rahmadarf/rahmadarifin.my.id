"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { DOT_CELL, DOT_RADIUS, TAU } from "@/lib/dot-grid";
import { HERO_DOTS_CLOSE_MS } from "@/lib/splash";
import {
  useEntranceStage,
  type EntranceStage,
} from "@/components/site/entrance-context";

// Canvas repaint of the `.dot-grid` background used by the Hero, with the dots
// nearest the cursor drawn slightly pulled towards it.
//
// Grid geometry is shared with the splash background so the two patterns line
// up; see lib/dot-grid.ts.

// How far the cursor reaches, how far a dot may travel, and how close a dot is
// allowed to get. The gap is what keeps dots from piling onto the pointer.
// The fill-in: how far out the dots start, and how long they take to land.
const INTRO_REACH = 90;
const INTRO_MS = HERO_DOTS_CLOSE_MS;

const INFLUENCE = 130;
const MAX_PULL = 7;
const MIN_GAP = 16;

// Exponential ease, so dots drift back without overshooting.
const EASE = 0.16;
const SETTLED = 0.05;


// A fine pointer that can hover: mouse or trackpad, not a touchscreen.
const POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToEnvironment(onChange: () => void) {
  const pointer = window.matchMedia(POINTER_QUERY);
  const motion = window.matchMedia(REDUCED_MOTION_QUERY);

  pointer.addEventListener("change", onChange);
  motion.addEventListener("change", onChange);

  return () => {
    pointer.removeEventListener("change", onChange);
    motion.removeEventListener("change", onChange);
  };
}

function isInteractive() {
  return (
    window.matchMedia(POINTER_QUERY).matches &&
    !window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

// The server cannot know either media query, so it renders the static grid and
// the client upgrades after hydration. useSyncExternalStore is what keeps that
// from being a hydration mismatch.
function isInteractiveOnServer() {
  return false;
}

export function HeroDots() {
  const interactive = useSyncExternalStore(
    subscribeToEnvironment,
    isInteractive,
    isInteractiveOnServer,
  );

  const stage = useEntranceStage();

  // Always the canvas, never a branch. Returning a <div> for one case and a
  // <canvas> for another changes the element type between the server and the
  // client, which React reports as a hydration mismatch and repairs by
  // throwing the tree away. `interactive` and `stage` change what the canvas
  // does, never what is rendered.
  //
  // It also means a touch visitor sees the dots fill in; they just never
  // follow a cursor afterwards.
  return <MagneticDots interactive={interactive} stage={stage} />;
}

function MagneticDots({
  interactive,
  stage,
}: {
  interactive: boolean;
  stage: EntranceStage;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read in the loop so a stage change never restarts the animation.
  // Mirrored in an effect rather than assigned during render, which React
  // forbids.
  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !host || !context) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    // Current offset from home for every dot, x and y interleaved.
    let offsets = new Float32Array(0);
    let colour = getComputedStyle(canvas).color;
    let backdrop = getComputedStyle(canvas).backgroundColor;

    const pointer = { x: 0, y: 0, active: false };
    let frame = 0;
    let running = false;

    // The hero's dots fill back in from the edges towards the centre — the
    // reverse of the gap that opened over the splash. `intro` runs 1 to 0; at
    // 1 every dot sits pushed out along the line from the centre through it.
    const wantsIntro = stageRef.current !== "ready";
    let intro = wantsIntro ? 1 : 0;
    let introStarted = 0;
    // Until the dots have landed the pointer is ignored, so the magnetic
    // effect cannot fight the arrival.
    let settled = !wantsIntro;

    function draw() {
      // Fill rather than clear: the section underneath keeps the CSS dot grid
      // so the pattern is there before hydration, and a transparent canvas
      // would let those static dots show through the moving ones.
      context!.fillStyle = backdrop;
      context!.fillRect(0, 0, width, height);
      context!.fillStyle = colour;
      context!.beginPath();

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = (row * columns + column) * 2;
          const x = DOT_CELL / 2 + column * DOT_CELL + offsets[index];
          const y = DOT_CELL / 2 + row * DOT_CELL + offsets[index + 1];
          // moveTo before arc, otherwise consecutive arcs are joined by a line.
          context!.moveTo(x + DOT_RADIUS, y);
          context!.arc(x, y, DOT_RADIUS, 0, TAU);
        }
      }

      // One fill for the whole grid rather than one per dot.
      context!.fill();
    }

    function step(now: number) {
      let moving = false;

      if (intro > 0) {
        if (stageRef.current === "waiting" || stageRef.current === "opening") {
          // Held out at full reach until the gap has finished opening.
          introStarted = 0;
        } else {
          if (introStarted === 0) introStarted = now;
          const progress = Math.min(1, (now - introStarted) / INTRO_MS);
          // Ease out: quick off the edge, gentle into place.
          intro = 1 - (1 - (1 - progress) ** 3);
          if (progress >= 1) {
            intro = 0;
            settled = true;
          }
        }
      }

      const centreX = width / 2;
      const centreY = height / 2;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = (row * columns + column) * 2;
          const homeX = DOT_CELL / 2 + column * DOT_CELL;
          const homeY = DOT_CELL / 2 + row * DOT_CELL;

          let targetX = 0;
          let targetY = 0;

          if (intro > 0) {
            // Pushed outward along the ray from the centre, so the pattern
            // reads as closing inward as `intro` falls to zero.
            const outX = homeX - centreX;
            const outY = homeY - centreY;
            const spread = Math.hypot(outX, outY) || 1;
            targetX = (outX / spread) * INTRO_REACH * intro;
            targetY = (outY / spread) * INTRO_REACH * intro;
          } else if (pointer.active && settled) {
            const dx = pointer.x - homeX;
            const dy = pointer.y - homeY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0.001 && distance < INFLUENCE) {
              const falloff = 1 - distance / INFLUENCE;
              const pull = MAX_PULL * falloff * falloff;
              // Never cross into the gap the pointer keeps around itself.
              const travel = Math.min(pull, Math.max(0, distance - MIN_GAP));
              targetX = (dx / distance) * travel;
              targetY = (dy / distance) * travel;
            }
          }

          const nextX = offsets[index] + (targetX - offsets[index]) * EASE;
          const nextY =
            offsets[index + 1] + (targetY - offsets[index + 1]) * EASE;

          offsets[index] = nextX;
          offsets[index + 1] = nextY;

          if (
            Math.abs(nextX - targetX) > SETTLED ||
            Math.abs(nextY - targetY) > SETTLED
          ) {
            moving = true;
          }
        }
      }

      draw();

      if (moving) {
        frame = requestAnimationFrame(step);
        return;
      }

      // The fill-in has not been released yet, so keep the loop alive even
      // though nothing is easing: the dots are parked out at full reach
      // waiting for the gap to finish opening.
      if (intro > 0) {
        frame = requestAnimationFrame(step);
        return;
      }

      // Nothing is easing any more. Stop even while the pointer is still over
      // the hero — targets only change on pointermove, which restarts the loop,
      // so a cursor resting in place costs nothing.
      if (!pointer.active) {
        // The easing stops within SETTLED of home, and even a 0.05px residue
        // anti-aliases slightly differently from the untouched grid. Snapping
        // to zero for the final paint keeps the idle canvas identical to the
        // CSS background it replaced.
        offsets.fill(0);
        draw();
      }

      running = false;
    }

    function run() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(step);
    }

    function resize() {
      const rect = host!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Cap the ratio: a 3x backing store buys nothing for 1.5px dots.
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);

      columns = Math.ceil(width / DOT_CELL);
      rows = Math.ceil(height / DOT_CELL);
      offsets = new Float32Array(columns * rows * 2);

      draw();
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      run();
    }

    function handlePointerLeave() {
      pointer.active = false;
      run();
    }

    resize();
    // Kicks the loop for the fill-in; without a pointer nothing else would
    // start it.
    if (intro > 0) run();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // next-themes swaps a class on <html>; re-read the custom property and
    // repaint so an idle grid picks up the new colour.
    const themeObserver = new MutationObserver(() => {
      colour = getComputedStyle(canvas).color;
      backdrop = getComputedStyle(canvas).backgroundColor;
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (interactive) {
      host.addEventListener("pointermove", handlePointerMove);
      host.addEventListener("pointerleave", handlePointerLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", handlePointerLeave);
      /* removeEventListener on a listener that was never added is a no-op. */
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // `color` carries the CSS custom property into the canvas, so the dots
      // follow the theme without the component knowing the palette.
      style={{ color: "var(--dot-grid-color)" }}
      className="pointer-events-none absolute inset-0 h-full w-full bg-background"
    />
  );
}
