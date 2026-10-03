"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  CheckboxField,
  Field,
  StatusField,
  TextAreaField,
  TextField,
} from "@/components/admin/field";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { MediaUpload } from "@/components/admin/media-upload";
import { saveProject } from "@/lib/actions/portfolio";
import { initialActionState } from "@/lib/actions/state";
import type { ProjectView } from "@/lib/data/portfolio";

export function ProjectForm({
  ownerId,
  project,
}: {
  ownerId: string;
  project: ProjectView | null;
}) {
  const [state, formAction] = useActionState(saveProject, initialActionState);
  const errors = state.errors ?? {};
  const editing = Boolean(project);

  return (
    <div className="flex flex-col gap-4.5 rounded-2xl border border-border bg-background p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
          {editing ? `Edit — ${project!.title}` : "Add Project"}
        </h2>
        {editing ? (
          <Link
            href="/admin/projects"
            className="text-[13px] font-semibold text-text-secondary hover:text-foreground"
          >
            Batal edit
          </Link>
        ) : null}
      </div>

      {/* Remount on save so a successful create clears the fields, and
          switching rows loads that row's values. */}
      <form
        key={`${project?.id ?? "new"}-${state.resetKey ?? "0"}`}
        action={formAction}
        className="flex flex-col gap-4.5"
      >
        <input type="hidden" name="id" value={project?.id ?? ""} />

        <FormFeedback state={state} />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Project Name" htmlFor="title" error={errors.title}>
            <TextField
              name="title"
              required
              maxLength={120}
              placeholder="e.g. Arus"
              defaultValue={project?.title ?? ""}
              error={errors.title}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="slug"
            error={errors.slug}
            hint="Dipakai di URL /projects/… Biarkan kosong untuk dibuat dari nama."
          >
            <TextField
              name="slug"
              maxLength={80}
              placeholder="arus"
              defaultValue={project?.slug ?? ""}
              error={errors.slug}
            />
          </Field>
        </div>

        <Field
          label="Category"
          htmlFor="category"
          error={errors.category}
          hint="Muncul di baris meta kartu, mis. “Web app”. Kosongkan untuk memakai tag pertama."
        >
          <TextField
            name="category"
            maxLength={60}
            placeholder="Web app"
            defaultValue={project?.category ?? ""}
            error={errors.category}
          />
        </Field>

        <Field
          label="Tech Tags"
          htmlFor="tech_tags"
          error={errors.tech_tags}
          hint="Pisahkan dengan koma. Maksimal 12 tag."
        >
          <TextField
            name="tech_tags"
            placeholder="Next.js, Supabase, PostgreSQL"
            defaultValue={project?.tech_tags.join(", ") ?? ""}
            error={errors.tech_tags}
          />
        </Field>

        <Field
          label="Card Summary"
          htmlFor="summary"
          error={errors.summary}
          hint="Teks yang muncul di kartu proyek."
        >
          <TextAreaField
            name="summary"
            rows={3}
            placeholder="Short project description..."
            defaultValue={project?.summary ?? ""}
            error={errors.summary}
          />
        </Field>

        <Field
          label="Detail Intro"
          htmlFor="description"
          error={errors.description}
          hint="Paragraf pembuka di halaman detail."
        >
          <TextAreaField
            name="description"
            rows={3}
            defaultValue={project?.description ?? ""}
            error={errors.description}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Detail Heading"
            htmlFor="detail_heading"
            error={errors.detail_heading}
            hint="Contoh: Key Features, The Problem I Solved."
          >
            <TextField
              name="detail_heading"
              maxLength={120}
              placeholder="Key Features"
              defaultValue={project?.detail_heading ?? ""}
              error={errors.detail_heading}
            />
          </Field>

          <Field
            label="Sort Order"
            htmlFor="sort_order"
            error={errors.sort_order}
            hint="Angka kecil tampil lebih dulu."
          >
            <TextField
              name="sort_order"
              type="number"
              min={0}
              step={10}
              defaultValue={project?.sort_order ?? 0}
              error={errors.sort_order}
            />
          </Field>
        </div>

        <Field
          label="Detail Points"
          htmlFor="features"
          error={errors.features}
          hint="Satu poin per baris. Maksimal 24 baris."
        >
          <TextAreaField
            name="features"
            rows={5}
            defaultValue={project?.features.join("\n") ?? ""}
            error={errors.features}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <Field
            label="Side Card Label"
            htmlFor="note_label"
            error={errors.note_label}
          >
            <TextField
              name="note_label"
              maxLength={60}
              placeholder="Design System"
              defaultValue={project?.note_label ?? ""}
              error={errors.note_label}
            />
          </Field>

          <Field
            label="Side Card Text"
            htmlFor="note_body"
            error={errors.note_body}
          >
            <TextField
              name="note_body"
              maxLength={1000}
              defaultValue={project?.note_body ?? ""}
              error={errors.note_body}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Repo / GitHub Link"
            htmlFor="repo_url"
            error={errors.repo_url}
          >
            <TextField
              name="repo_url"
              type="url"
              placeholder="https://github.com/..."
              defaultValue={project?.repo_url ?? ""}
              error={errors.repo_url}
            />
          </Field>

          <Field
            label="Live Link (optional)"
            htmlFor="live_url"
            error={errors.live_url}
          >
            <TextField
              name="live_url"
              type="url"
              placeholder="https://..."
              defaultValue={project?.live_url ?? ""}
              error={errors.live_url}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MediaUpload
            name="thumbnail_path"
            ownerId={ownerId}
            kind="thumbnails"
            label="Thumbnail (kartu)"
            initialPath={project?.thumbnail_path ?? null}
            initialUrl={project?.thumbnailUrl ?? null}
          />
          <MediaUpload
            name="cover_path"
            ownerId={ownerId}
            kind="covers"
            label="Cover (halaman detail)"
            initialPath={project?.cover_path ?? null}
            initialUrl={project?.coverUrl ?? null}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatusField
            defaultValue={project?.status ?? "draft"}
            error={errors.status}
          />
          <div className="flex items-end">
            <CheckboxField
              name="is_featured"
              label="Tampilkan di Featured Projects"
              defaultChecked={project?.is_featured ?? false}
            />
          </div>
        </div>

        <div className="mt-1 flex gap-2.5">
          <SubmitButton>
            {editing ? "Update Project" : "Save Project"}
          </SubmitButton>
          {editing ? (
            <Link
              href="/admin/projects"
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
