/**
 * Resolves once the page behind the splash is worth revealing.
 *
 * "Ready" is deliberately narrow: the fonts the page asked for, and the images
 * that are already above the fold. Those are what would otherwise reflow or
 * pop in a moment after the splash left, which is the thing worth waiting for.
 *
 * What it does not wait for:
 *
 * - Content data. The public pages are server-rendered, so by the time this
 *   runs their copy is already in the document.
 * - Images below the fold. next/image leaves those lazy, so they do not even
 *   begin loading until they are scrolled towards — waiting on one would mean
 *   waiting forever.
 * - Prefetches of other routes. The roadmap excludes them explicitly, and
 *   /projects has to work when opened cold regardless.
 *
 * Never rejects: a broken image resolves the same as a loaded one. The caller
 * still caps the wait, because this makes no promise about when it settles.
 */
export function whenPageReady(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  const waits: Promise<unknown>[] = [];

  // Guarded: the Font Loading API is absent in some embedded browsers.
  if (document.fonts?.ready) waits.push(document.fonts.ready);

  const viewportHeight = window.innerHeight;
  const images = document.querySelectorAll<HTMLImageElement>("main img");

  for (const image of images) {
    if (image.complete) continue;

    // Above the fold only. `top` is measured against the document as it is
    // now, which is the view the splash is covering.
    const { top } = image.getBoundingClientRect();
    if (top > viewportHeight) continue;

    waits.push(
      new Promise<void>((resolve) => {
        const settle = () => resolve();
        image.addEventListener("load", settle, { once: true });
        image.addEventListener("error", settle, { once: true });
      }),
    );
  }

  return Promise.all(waits).then(() => undefined);
}
