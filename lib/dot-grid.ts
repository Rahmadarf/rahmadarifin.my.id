// Geometry of the dot pattern, shared by every canvas that repaints it.
//
// These have to match the CSS in globals.css exactly or the grid jumps the
// moment a canvas takes over: `radial-gradient(circle, var(--dot-grid-color)
// 1.5px, transparent 1.5px)` at `background-size: 24px 24px` puts a 1.5px dot
// in the middle of every 24px cell.
//
// The roadmap asks for the splash background to share the hero's rhythm and
// colour, so both read these rather than keeping their own copies.
export const DOT_CELL = 24;
export const DOT_RADIUS = 1.5;
export const TAU = Math.PI * 2;

/** Backing-store scale. Past 2x a 1.5px dot gains nothing. */
export function dotPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

/**
 * Lays out a canvas over its parent and returns the grid that fits it.
 *
 * Returns null while the parent has no size — a splash overlay is
 * `display: none` until it is needed, and measuring then would produce an
 * empty grid that never corrects itself.
 */
export function sizeDotCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  host: HTMLElement,
) {
  const rect = host.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const ratio = dotPixelRatio();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  return {
    width: rect.width,
    height: rect.height,
    columns: Math.ceil(rect.width / DOT_CELL),
    rows: Math.ceil(rect.height / DOT_CELL),
  };
}
