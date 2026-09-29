import Image from "next/image";
import { cn } from "@/lib/utils";

// Project thumbnails and covers. When no image is set the design's blue-to-grey
// gradient block stands in, so the layout never collapses.
export function MediaFrame({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 360px",
  placeholderLabel,
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  placeholderLabel?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] border border-border bg-[linear-gradient(135deg,oklch(0.64_0.19_257/0.22),var(--surface-alt))]",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : placeholderLabel ? (
        <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-[13px] text-text-tertiary">
          {placeholderLabel}
        </span>
      ) : null}
    </div>
  );
}
