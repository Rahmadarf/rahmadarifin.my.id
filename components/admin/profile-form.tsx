"use client";

import { useActionState } from "react";
import {
  Field,
  StatusField,
  TextAreaField,
  TextField,
} from "@/components/admin/field";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { MediaUpload } from "@/components/admin/media-upload";
import { saveProfile } from "@/lib/actions/portfolio";
import { initialActionState } from "@/lib/actions/state";
import { DEFAULT_PROFILE } from "@/lib/content/defaults";
import type { ProfileRow } from "@/lib/types/database";

export function ProfileForm({
  ownerId,
  profile,
  photoUrl,
}: {
  ownerId: string;
  profile: ProfileRow | null;
  photoUrl: string | null;
}) {
  const [state, formAction] = useActionState(saveProfile, initialActionState);
  const errors = state.errors ?? {};

  return (
    <form
      action={formAction}
      className="flex max-w-[860px] flex-col gap-4.5 rounded-2xl border border-border bg-background p-7"
    >
      <FormFeedback state={state} />

      <p className="text-sm text-text-secondary">
        Selama baris ini masih draft atau belum ada, situs publik memakai teks
        bawaan dari desain.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nama lengkap" htmlFor="full_name" error={errors.full_name}>
          <TextField
            name="full_name"
            required
            maxLength={120}
            defaultValue={profile?.full_name ?? DEFAULT_PROFILE.full_name}
            error={errors.full_name}
          />
        </Field>

        <Field label="Alias" htmlFor="alias" error={errors.alias}>
          <TextField
            name="alias"
            maxLength={60}
            defaultValue={profile?.alias ?? ""}
            error={errors.alias}
          />
        </Field>
      </div>

      <Field
        label="Availability badge"
        htmlFor="availability_badge"
        error={errors.availability_badge}
      >
        <TextField
          name="availability_badge"
          maxLength={120}
          placeholder="Looking for an internship · 2027"
          defaultValue={profile?.availability_badge ?? ""}
          error={errors.availability_badge}
        />
      </Field>

      <Field
        label="Hero headline"
        htmlFor="hero_headline"
        error={errors.hero_headline}
      >
        <TextAreaField
          name="hero_headline"
          rows={2}
          defaultValue={profile?.hero_headline ?? ""}
          error={errors.hero_headline}
        />
      </Field>

      <Field label="Hero intro" htmlFor="hero_intro" error={errors.hero_intro}>
        <TextAreaField
          name="hero_intro"
          rows={3}
          defaultValue={profile?.hero_intro ?? ""}
          error={errors.hero_intro}
        />
      </Field>

      <Field
        label="Role title (kartu About)"
        htmlFor="role_title"
        error={errors.role_title}
      >
        <TextAreaField
          name="role_title"
          rows={2}
          defaultValue={profile?.role_title ?? ""}
          error={errors.role_title}
        />
      </Field>

      <Field label="Bio" htmlFor="bio" error={errors.bio}>
        <TextAreaField
          name="bio"
          rows={4}
          defaultValue={profile?.bio ?? ""}
          error={errors.bio}
        />
      </Field>

      <Field
        label="Certifications / Focus Areas"
        htmlFor="certifications"
        error={errors.certifications}
        hint="Kosong berarti kartu ini tetap menampilkan placeholder desain."
      >
        <TextAreaField
          name="certifications"
          rows={3}
          defaultValue={profile?.certifications ?? ""}
          error={errors.certifications}
        />
      </Field>

      <Field
        label="Education"
        htmlFor="education"
        error={errors.education}
        hint="Format bebas, contoh: Institusi · jurusan · 2024–2028."
      >
        <TextAreaField
          name="education"
          rows={3}
          defaultValue={profile?.education ?? ""}
          error={errors.education}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Contact heading"
          htmlFor="contact_heading"
          error={errors.contact_heading}
        >
          <TextField
            name="contact_heading"
            maxLength={120}
            defaultValue={profile?.contact_heading ?? ""}
            error={errors.contact_heading}
          />
        </Field>

        <Field
          label="Contact email"
          htmlFor="contact_email"
          error={errors.contact_email}
        >
          <TextField
            name="contact_email"
            type="email"
            defaultValue={profile?.contact_email ?? ""}
            error={errors.contact_email}
          />
        </Field>
      </div>

      <Field
        label="Contact body"
        htmlFor="contact_body"
        error={errors.contact_body}
      >
        <TextAreaField
          name="contact_body"
          rows={3}
          defaultValue={profile?.contact_body ?? ""}
          error={errors.contact_body}
        />
      </Field>

      <Field label="Footer note" htmlFor="footer_note" error={errors.footer_note}>
        <TextField
          name="footer_note"
          maxLength={300}
          defaultValue={profile?.footer_note ?? ""}
          error={errors.footer_note}
        />
      </Field>

      <MediaUpload
        name="photo_path"
        ownerId={ownerId}
        kind="photo"
        label="Professional photo"
        initialPath={profile?.photo_path ?? null}
        initialUrl={photoUrl}
      />

      <StatusField
        defaultValue={profile?.status ?? "draft"}
        error={errors.status}
      />

      <SubmitButton className="self-start">Save Profile</SubmitButton>
    </form>
  );
}
