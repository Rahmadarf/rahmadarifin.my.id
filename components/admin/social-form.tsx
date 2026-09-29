"use client";

import { useActionState } from "react";
import { Field, SelectField, TextField } from "@/components/admin/field";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { saveSocialLinks } from "@/lib/actions/portfolio";
import { initialActionState } from "@/lib/actions/state";
import {
  SOCIAL_PLATFORMS,
  type SocialLinkRow,
  type SocialPlatform,
} from "@/lib/types/database";

const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; placeholder: string }
> = {
  email: {
    label: "Email",
    placeholder: "mailto:rahmadarifinsusilo17@gmail.com",
  },
  github: { label: "GitHub", placeholder: "https://github.com/Rahmadarf" },
  linkedin: { label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  instagram: {
    label: "Instagram",
    placeholder: "https://instagram.com/rahmad4rifin",
  },
  website: { label: "Website", placeholder: "https://..." },
};

export function SocialForm({ links }: { links: SocialLinkRow[] }) {
  const [state, formAction] = useActionState(
    saveSocialLinks,
    initialActionState,
  );
  const errors = state.errors ?? {};
  const byPlatform = new Map(links.map((link) => [link.platform, link]));

  return (
    <form
      action={formAction}
      className="flex max-w-[720px] flex-col gap-6 rounded-2xl border border-border bg-background p-7"
    >
      <FormFeedback state={state} />

      <p className="text-sm text-text-secondary">
        Kosongkan URL untuk menghapus link itu dari situs.
      </p>

      {SOCIAL_PLATFORMS.map((platform, index) => {
        const link = byPlatform.get(platform);
        const meta = PLATFORM_META[platform];

        return (
          <fieldset
            key={platform}
            className="flex flex-col gap-3 border-t border-border pt-5 first:border-t-0 first:pt-0"
          >
            <legend className="text-[13px] font-bold uppercase tracking-[0.04em] text-text-tertiary">
              {meta.label}
            </legend>

            <Field
              label="URL"
              htmlFor={`${platform}_url`}
              error={errors[`${platform}_url`]}
            >
              <TextField
                name={`${platform}_url`}
                placeholder={meta.placeholder}
                defaultValue={link?.url ?? ""}
                error={errors[`${platform}_url`]}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Label" htmlFor={`${platform}_label`}>
                <TextField
                  name={`${platform}_label`}
                  maxLength={120}
                  defaultValue={link?.label ?? ""}
                />
              </Field>

              <Field label="Sort Order" htmlFor={`${platform}_sort_order`}>
                <TextField
                  name={`${platform}_sort_order`}
                  type="number"
                  min={0}
                  step={10}
                  defaultValue={link?.sort_order ?? (index + 1) * 10}
                />
              </Field>

              <Field label="Status" htmlFor={`${platform}_status`}>
                <SelectField
                  name={`${platform}_status`}
                  defaultValue={link?.status ?? "published"}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </SelectField>
              </Field>
            </div>
          </fieldset>
        );
      })}

      <SubmitButton className="self-start">Save Changes</SubmitButton>
    </form>
  );
}
