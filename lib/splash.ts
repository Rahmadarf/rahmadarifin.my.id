// Shared between the blocking script that decides before paint and the React
// component that runs the splash, so the two cannot drift apart.

export const SPLASH_STORAGE_KEY = "portfolio:last-visit";

// "First visit, then again once the site has gone unopened for a week." Seven
// days is roughly where Safari's own storage eviction lands too, which keeps
// the behaviour from differing wildly between browsers.
export const SPLASH_STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export const SPLASH_ATTRIBUTE = "data-splash";

// The splash holds until the page behind it is actually ready to be looked at
// — fonts resolved and the images above the fold decoded — rather than for a
// fixed stretch. Two bounds keep that honest:
//
// The floor is a judgement call, not a roadmap requirement. On a warm cache
// the page is ready in well under 100ms, and a splash that appeared and left
// again inside a blink would read as a glitch, especially with a one-second
// exit scene behind it.
//
// The ceiling is the roadmap's: a stalled image or a dead network must not
// hold the splash open with no end.
export const SPLASH_MIN_MS = 2500;
export const SPLASH_MAX_MS = 2500;

// The exit is one scene: the dots at the centre are pressed in, then a
// circular gap opens from there to the edges and eats the overlay.
//
// The redesign dropped the hero's dot grid, so the beat where those dots
// filled back in from the edges is gone with it. The pause it occupied is
// kept — the navbar still arrives a beat after the gap finishes rather than
// on the same frame, which is what made the exit read as one movement.
export const SPLASH_PRESS_MS = 120;
export const SPLASH_OPEN_MS = 500;
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
