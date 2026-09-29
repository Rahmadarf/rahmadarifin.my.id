"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FormFeedback } from "@/components/admin/form-feedback";
import { setProjectStatus } from "@/lib/actions/portfolio";
import { initialActionState } from "@/lib/actions/state";
import type { ContentStatus } from "@/lib/types/database";

// One-click publish / unpublish for a project row.
export function ProjectStatusToggle({
  id,
  status,
}: {
  id: number;
  status: ContentStatus;
}) {
  const [state, formAction] = useActionState(
    setProjectStatus,
    initialActionState,
  );
  const next: ContentStatus = status === "published" ? "draft" : "published";

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <FormFeedback state={state} />
      <ToggleButton next={next} />
    </form>
  );
}

function ToggleButton({ next }: { next: ContentStatus }) {
  const { pending } = useFormStatus();
  const publishing = next === "published";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={publishing ? "Publikasikan" : "Kembalikan ke draft"}
      title={publishing ? "Publikasikan" : "Kembalikan ke draft"}
      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : publishing ? (
        <Eye className="size-3.5" />
      ) : (
        <EyeOff className="size-3.5" />
      )}
    </button>
  );
}
