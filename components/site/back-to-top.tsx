import { ArrowUp } from "lucide-react";

// Floating square button, bottom-right, on every public page.
//
// z-30 keeps it under the nav menu overlay; at a higher layer it stayed lit
// over the dimmed page while the mobile menu was open. It also sits closer to
// the corner on small screens, where the old 32px inset crowded the content.
export function BackToTop() {
  return (
    <a
      href="#page-top"
      aria-label="Kembali ke atas"
      className="fixed bottom-5 right-5 z-30 flex size-11 items-center justify-center rounded-md border border-input bg-surface text-foreground transition-colors hover:border-primary/40 hover:text-primary sm:bottom-8 sm:right-8 sm:size-[46px]"
    >
      <ArrowUp className="size-[18px]" strokeWidth={2.2} />
    </a>
  );
}
