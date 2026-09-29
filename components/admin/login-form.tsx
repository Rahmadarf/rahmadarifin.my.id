"use client";

import { useActionState } from "react";
import { Field, TextField } from "@/components/admin/field";
import { FormFeedback, SubmitButton } from "@/components/admin/form-feedback";
import { signIn } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/state";

export function LoginForm({ notice }: { notice: string | null }) {
  const [state, formAction] = useActionState(signIn, initialActionState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      {notice ? (
        <p
          role="alert"
          className="rounded-[10px] border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          {notice}
        </p>
      ) : null}

      <FormFeedback state={state} />

      <Field label="Email" htmlFor="email" error={errors.email}>
        <TextField
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="rahmadarifinsusilo17@gmail.com"
          error={errors.email}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password}>
        <TextField
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
        />
      </Field>

      <SubmitButton className="mt-1.5 w-full py-3.5">Log In</SubmitButton>
    </form>
  );
}
