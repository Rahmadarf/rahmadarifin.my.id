"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { initialActionState, type ActionState } from "@/lib/actions/state";

type DeleteAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

// Destructive actions get an explicit confirmation step, and the result comes
// back as a toast rather than a native alert.
//
// The dialog is left uncontrolled: on success the row is revalidated away and
// this component unmounts with it, so there is nothing to close. On failure the
// dialog stays open with the error in place.
export function DeleteRow({
  id,
  action,
  entityLabel,
  name,
}: {
  id: number;
  action: DeleteAction;
  entityLabel: string;
  name: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Hapus ${entityLabel} ${name}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-colors hover:border-destructive/40 hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus {entityLabel}?</DialogTitle>
          <DialogDescription>
            &ldquo;{name}&rdquo; akan dihapus permanen, termasuk gambar yang
            menempel padanya. Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="contents">
          <input type="hidden" name="id" value={id} />
          <FormFeedback state={state} />
          <DialogFooter>
            <DialogClose className="rounded-[10px] border border-input px-[22px] py-2.5 text-sm font-semibold">
              Batal
            </DialogClose>
            <SubmitButton variant="destructive">Hapus</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
