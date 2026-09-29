"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Field,
  StatusField,
  TextAreaField,
  TextField,
} from "@/components/admin/field";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { saveTimelineEntry } from "@/lib/actions/portfolio";
import { initialActionState } from "@/lib/actions/state";
import type { TimelineEntryRow } from "@/lib/types/database";

export function TimelineForm({ entry }: { entry: TimelineEntryRow | null }) {
  const [state, formAction] = useActionState(
    saveTimelineEntry,
    initialActionState,
  );
  const errors = state.errors ?? {};
  const editing = Boolean(entry);

  return (
    <div className="flex flex-col gap-4.5 rounded-2xl border border-border bg-background p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
          {editing ? "Edit Timeline Entry" : "Add Timeline Entry"}
        </h2>
        {editing ? (
          <Link
            href="/admin/timeline"
            className="text-[13px] font-semibold text-text-secondary hover:text-foreground"
          >
            Batal edit
          </Link>
        ) : null}
      </div>

      <form
        key={`${entry?.id ?? "new"}-${state.resetKey ?? "0"}`}
        action={formAction}
        className="flex flex-col gap-4.5"
      >
        <input type="hidden" name="id" value={entry?.id ?? ""} />

        <FormFeedback state={state} />

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Month / Year"
            htmlFor="period_label"
            error={errors.period_label}
          >
            <TextField
              name="period_label"
              required
              maxLength={60}
              placeholder="e.g. March 2027"
              defaultValue={entry?.period_label ?? ""}
              error={errors.period_label}
            />
          </Field>

          <Field
            label="Event / Seminar / Competition Name"
            htmlFor="title"
            error={errors.title}
            className="md:col-span-2"
          >
            <TextField
              name="title"
              required
              maxLength={200}
              placeholder="e.g. GTNIC 2027"
              defaultValue={entry?.title ?? ""}
              error={errors.title}
            />
          </Field>
        </div>

        <Field label="Role" htmlFor="role" error={errors.role}>
          <TextField
            name="role"
            maxLength={200}
            placeholder="Participant / Committee / Speaker / Team Member"
            defaultValue={entry?.role ?? ""}
            error={errors.role}
          />
        </Field>

        <Field label="Note" htmlFor="note" error={errors.note}>
          <TextAreaField
            name="note"
            rows={2}
            placeholder="One-line note about this entry..."
            defaultValue={entry?.note ?? ""}
            error={errors.note}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Tanggal (opsional)"
            htmlFor="occurred_on"
            error={errors.occurred_on}
            hint="Dipakai untuk pengurutan."
          >
            <TextField
              name="occurred_on"
              type="date"
              defaultValue={entry?.occurred_on ?? ""}
              error={errors.occurred_on}
            />
          </Field>

          <Field
            label="Sort Order"
            htmlFor="sort_order"
            error={errors.sort_order}
          >
            <TextField
              name="sort_order"
              type="number"
              min={0}
              step={10}
              defaultValue={entry?.sort_order ?? 0}
              error={errors.sort_order}
            />
          </Field>

          <StatusField
            defaultValue={entry?.status ?? "draft"}
            error={errors.status}
          />
        </div>

        <div className="mt-1 flex gap-2.5">
          <SubmitButton>{editing ? "Update Entry" : "Save Entry"}</SubmitButton>
          {editing ? (
            <Link
              href="/admin/timeline"
              className="rounded-[10px] border border-input px-[22px] py-2.5 text-sm font-semibold"
            >
              Cancel
            </Link>
          ) : null}
        </div>
      </form>
    </div>
  );
}
