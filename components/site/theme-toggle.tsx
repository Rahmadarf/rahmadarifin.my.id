"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

// Both icons are rendered and swapped with the `dark` class variant. The server
// cannot know the stored theme, so deciding in CSS avoids both a hydration
// mismatch and a mounted-flag state update inside an effect.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Ganti tema terang atau gelap"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={
        className ??
        "flex size-[34px] shrink-0 items-center justify-center rounded-full border border-input bg-surface-alt text-foreground transition-colors hover:border-primary/40 hover:text-primary"
      }
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  );
}
