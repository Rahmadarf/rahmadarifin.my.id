import { ArrowUp } from "lucide-react";

// Floating square button, bottom-right, on every public page.
export function BackToTop() {
  return (
    <a
      href="#page-top"
      aria-label="Kembali ke atas"
      className="fixed bottom-8 right-8 z-[60] flex size-[46px] items-center justify-center rounded-[10px] border border-input bg-background text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-colors hover:border-primary/40 hover:text-primary"
    >
      <ArrowUp className="size-[18px]" strokeWidth={2.2} />
    </a>
  );
}
