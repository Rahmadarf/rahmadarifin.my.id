"use client";

import { useActionState } from "react";
import { Broom } from "lucide-react";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { cleanupMedia } from "@/lib/actions/portfolio";
import { initialActionState } from "@/lib/actions/state";

// Saves already sweep automatically. This covers the one case they cannot:
// an upload abandoned on a panel the owner never saves again.
export function CleanupMediaButton() {
  const [state, formAction] = useActionState(cleanupMedia, initialActionState);

  return (
    <form
      action={formAction}
      className="flex max-w-[860px] flex-col gap-3 rounded-2xl border border-border bg-background p-7"
    >
      <h2 className="text-[15px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
        Media tak terpakai
      </h2>

      <p className="text-sm text-text-secondary">
        Gambar yang terunggah tapi formnya tidak pernah disimpan akan tertinggal
        di bucket. Pembersihan ini berjalan otomatis setiap kali Anda menyimpan
        proyek atau profil; tombol ini menjalankannya sekarang. File yang lebih
        baru dari satu jam dilewati, supaya upload yang sedang dikerjakan di tab
        lain tidak ikut terhapus.
      </p>

      <FormFeedback state={state} />

      <SubmitButton variant="secondary" className="self-start">
        <Broom className="size-4" />
        Bersihkan sekarang
      </SubmitButton>
    </form>
  );
}
