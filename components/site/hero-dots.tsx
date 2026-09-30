"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// Canvas repaint of the `.dot-grid` background used by the Hero, with the dots
// nearest the cursor drawn slightly pulled towards it.
//
// These constants have to match the CSS in globals.css exactly, or the grid
// shifts the moment the canvas takes over: `radial-gradient(circle,
// var(--dot-grid-color) 1.5px, transparent 1.5px)` at `background-size: 24px
// 24px` puts a 1.5px dot in the middle of every 24px cell.
const CELL = 24;
const DOT_RADIUS = 1.5;

// How far the cursor reaches, how far a dot may travel, and how close a dot is
// allowed to get. The gap is what keeps dots from piling onto the pointer.
const INFLUENCE = 130;
const MAX_PULL = 7;
const MIN_GAP = 16;

// Exponential ease, so dots drift back without overshooting.
const EASE = 0.16;
const SETTLED = 0.05;

const TAU = Math.PI * 2;

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

  if (!interactive) {
    return <div aria-hidden className="dot-grid absolute inset-0" />;
  }

  return <MagneticDots />;
}

function MagneticDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const pointer = { x: 0, y: 0, active: false };
    let frame = 0;
    let running = false;

    function draw() {
      context!.clearRect(0, 0, width, height);
      context!.fillStyle = colour;
      context!.beginPath();

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = (row * columns + column) * 2;
          const x = CELL / 2 + column * CELL + offsets[index];
          const y = CELL / 2 + row * CELL + offsets[index + 1];
          // moveTo before arc, otherwise consecutive arcs are joined by a line.
          context!.moveTo(x + DOT_RADIUS, y);
          context!.arc(x, y, DOT_RADIUS, 0, TAU);
        }
      }

      // One fill for the whole grid rather than one per dot.
      context!.fill();
    }

    function step() {
      let moving = false;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = (row * columns + column) * 2;
          const homeX = CELL / 2 + column * CELL;
          const homeY = CELL / 2 + row * CELL;

          let targetX = 0;
          let targetY = 0;

          if (pointer.active) {
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

      columns = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
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

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // next-themes swaps a class on <html>; re-read the custom property and
    // repaint so an idle grid picks up the new colour.
    const themeObserver = new MutationObserver(() => {
      colour = getComputedStyle(canvas).color;
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    host.addEventListener("pointermove", handlePointerMove);
    host.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // `color` carries the CSS custom property into the canvas, so the dots
      // follow the theme without the component knowing the palette.
      style={{ color: "var(--dot-grid-color)" }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
