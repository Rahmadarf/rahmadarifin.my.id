import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// The design ships exactly two buttons: a filled primary and a bordered
// secondary, both 6px radius with Inter Medium 14/18. The remaining variants
// are shadcn's and stay for the admin panel's future use.
//
// Figma draws them 40px (primary) and 42px (secondary) tall. Below `lg` the
// minimum is raised to 44px so every button clears the touch-target floor;
// the design has them full width on mobile anyway, so the extra height does
// not change the composition.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium leading-[18px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // `hover-lift` carries the 1px rise and its own transition; see
        // globals.css, where reduced motion removes the movement outright.
        primary:
          "hover-lift bg-primary text-primary-foreground hover:bg-primary-hover",
        // The design's "border → border-strong" is already this button's
        // resting border, so the hover that reads is the fill arriving.
        secondary:
          "border border-input text-foreground hover:bg-surface-alt",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-[18px] py-[11px] lg:min-h-0",
        sm: "h-9 px-3",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
