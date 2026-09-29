"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/actions/state";

// Surfaces a Server Action result as a toast. Field-level messages stay next to
// their input; this is only the summary.
export function FormFeedback({ state }: { state: ActionState }) {
  const lastShown = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) return;

    const signature = `${state.status}:${state.message}:${state.resetKey ?? ""}`;
    if (lastShown.current === signature) return;
    lastShown.current = signature;

    if (state.status === "success") toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  if (state.status !== "error" || !state.message) return null;

  return (
    <p
      role="alert"
      className="rounded-[10px] border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
    >
      {state.message}
    </p>
  );
}

export function SubmitButton({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "destructive";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-[22px] py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:brightness-110",
        variant === "secondary" &&
          "border border-input hover:border-primary/30 hover:bg-accent",
        variant === "destructive" &&
          "bg-destructive text-white hover:brightness-110",
        className,
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
