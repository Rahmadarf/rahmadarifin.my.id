// Shared between the blocking script that decides before paint and the React
// component that runs the splash, so the two cannot drift apart.

export const SPLASH_STORAGE_KEY = "portfolio:last-visit";

// "First visit, then again once the site has gone unopened for a week." Seven
// days is roughly where Safari's own storage eviction lands too, which keeps
// the behaviour from differing wildly between browsers.
export const SPLASH_STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export const SPLASH_ATTRIBUTE = "data-splash";

// Long enough for one cycle of the equaliser, short enough that the content
// underneath is not held back for long. The splash is an overlay, never a
// gate, so this delays nothing but itself.
export const SPLASH_DURATION_MS = 1400;

// The exit is one scene in four beats, with the roadmap's reference rhythm:
// the dots at the centre are pressed in, a circular gap opens from there to
// the edges, the hero's own dots then fill back in from the edges inward, and
// the navbar arrives as that filling finishes.
export const SPLASH_PRESS_MS = 120;
export const SPLASH_OPEN_MS = 500;
export const HERO_DOTS_CLOSE_MS = 400;

// How far into the hero's fill-in the navbar starts. Short of
// HERO_DOTS_CLOSE_MS on purpose: the roadmap asks for it to begin as that
// transition nears its end, so the two overlap instead of queueing.
export const NAVBAR_AFTER_CLOSE_MS = 300;

/**
 * Runs before first paint, inline in the document.
 *
 * It only sets an attribute; the overlay markup is always present and CSS
 * keyed on that attribute decides whether it is painted. Deciding in a React
 * effect instead would flash the page first and then cover it.
 *
 * Reduced motion opts out of the splash entirely rather than showing a still
 * version of it: without the animation the splash is just a delay, and the
 * navbar entrance behaves the same way.
 *
 * It lives in the root layout, which is the only place next/script honours
 * `beforeInteractive`, so it guards the admin routes itself rather than
 * relying on where it is mounted.
 */
export function splashDecisionScript() {
  return `(function(){try{
if(location.pathname.indexOf('/admin')===0)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var v=localStorage.getItem('${SPLASH_STORAGE_KEY}');
if(v&&Date.now()-Number(v)<${SPLASH_STALE_AFTER_MS})return;
document.documentElement.setAttribute('${SPLASH_ATTRIBUTE}','show');
}catch(e){}})();`;
}
