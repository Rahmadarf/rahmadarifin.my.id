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
 */
export function splashDecisionScript() {
  return `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var v=localStorage.getItem('${SPLASH_STORAGE_KEY}');
if(v&&Date.now()-Number(v)<${SPLASH_STALE_AFTER_MS})return;
document.documentElement.setAttribute('${SPLASH_ATTRIBUTE}','show');
}catch(e){}})();`;
}
