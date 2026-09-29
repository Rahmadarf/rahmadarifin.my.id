"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  CheckboxField,
  Field,
  SelectField,
  StatusField,
  TextField,
} from "@/components/admin/field";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { saveSkill } from "@/lib/actions/portfolio";
import { initialActionState } from "@/lib/actions/state";
import { SKILL_CATEGORIES, type SkillRow } from "@/lib/types/database";

const CATEGORY_LABELS: Record<(typeof SKILL_CATEGORIES)[number], string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  database: "Database",
  tools: "Tools",
};

export function SkillForm({ skill }: { skill: SkillRow | null }) {
  const [state, formAction] = useActionState(saveSkill, initialActionState);
  const errors = state.errors ?? {};
  const editing = Boolean(skill);

  return (
    <div className="flex flex-col gap-4.5 rounded-2xl border border-border bg-background p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
          {editing ? `Edit — ${skill!.name}` : "Add Skill"}
        </h2>
        {editing ? (
          <Link
            href="/admin/skills"
            className="text-[13px] font-semibold text-text-secondary hover:text-foreground"
          >
            Batal edit
          </Link>
        ) : null}
      </div>

      <form
        key={`${skill?.id ?? "new"}-${state.resetKey ?? "0"}`}
        action={formAction}
        className="flex flex-col gap-4.5"
      >
        <input type="hidden" name="id" value={skill?.id ?? ""} />

        <FormFeedback state={state} />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Skill Name" htmlFor="name" error={errors.name}>
            <TextField
              name="name"
              required
              maxLength={60}
              placeholder="e.g. Docker"
              defaultValue={skill?.name ?? ""}
              error={errors.name}
            />
          </Field>

          <Field label="Category" htmlFor="category" error={errors.category}>
            <SelectField
              name="category"
              defaultValue={skill?.category ?? "frontend"}
              error={errors.category}
            >
              {SKILL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </SelectField>
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
              defaultValue={skill?.sort_order ?? 0}
              error={errors.sort_order}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatusField
            defaultValue={skill?.status ?? "draft"}
            error={errors.status}
          />
          <div className="flex items-end">
            <CheckboxField
              name="is_core"
              label="Masuk tab Main"
              defaultChecked={skill?.is_core ?? false}
              hint="Tab Main memotong semua kategori, jadi jumlahnya tumpang tindih."
            />
          </div>
        </div>

        <div className="mt-1 flex gap-2.5">
          <SubmitButton>{editing ? "Update Skill" : "Add Skill"}</SubmitButton>
          {editing ? (
            <Link
              href="/admin/skills"
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
