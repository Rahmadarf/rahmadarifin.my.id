"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// The design draws one small control, "EN · ◐", in the navbar. The glyph is
// the same in both themes, so nothing here depends on the stored theme during
// render — no hydration mismatch and no mounted flag.
//
// "EN" sits beside it as a plain indicator rather than inside the button:
// there is no language switcher in this project yet, and labelling a
// theme button "EN" would promise one.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-surface-alt px-2.5 py-[7px] font-mono text-xs leading-[18px] text-text-secondary">
      <span>EN</span>
      <span aria-hidden>&middot;</span>

      <button
        type="button"
        aria-label="Ganti tema terang atau gelap"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className={cn(
          // Drawn at the design's size; the tappable area is grown to 44px
          // with a centred pseudo-element so the pill itself stays on-spec.
          "relative leading-[18px] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt",
          "after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] lg:after:hidden",
          className,
        )}
      >
        &#9680;
      </button>
    </div>
  );
}
