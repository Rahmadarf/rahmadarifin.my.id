import Image from "next/image";
import { cn } from "@/lib/utils";

// Project thumbnails and covers. With no image set the design's flat
// `surface-alt` block stands in, captioned in mono, so the layout never
// collapses and the slot reads as deliberate rather than broken.
//
// Radius and border are left to the caller: inside a card the media is flush
// and the card clips it, while on the /projects rows and the detail cover it
// carries its own 8px radius and hairline.
export function MediaFrame({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(max-width: 1023px) 100vw, 640px",
  placeholderLabel = "Screenshot · 16:10",
  fallback,
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  placeholderLabel?: string;
  /** Rendered instead of the caption when there is no image. */
  fallback?: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-alt", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      ) : fallback ? (
        fallback
      ) : placeholderLabel ? (
        <span className="absolute inset-0 flex items-center justify-center px-4 text-center font-mono text-xs leading-4 text-text-tertiary">
          {placeholderLabel}
        </span>
      ) : null}
    </div>
  );
}
