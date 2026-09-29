"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ADMIN_HOME_PATH, LOGIN_PATH, adminUserIds } from "@/lib/auth/admin";
import { fieldErrors, formValues, signInSchema } from "@/lib/validation/portfolio";
import {
  actionError,
  type ActionState,
} from "@/lib/actions/state";

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return actionError(
      "Supabase belum dikonfigurasi. Isi .env.local lalu restart dev server.",
    );
  }

  const allowed = adminUserIds();
  if (!allowed.length) {
    return actionError(
      "ADMIN_USER_IDS masih kosong, jadi tidak ada akun yang boleh masuk.",
    );
  }

  const parsed = signInSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return actionError("Periksa email dan password.", fieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    // Deliberately vague: a precise message would confirm which emails exist.
    return actionError("Email atau password salah.");
  }

  // The credentials were valid but this user is not an owner. Drop the session
  // straight away so no admin cookie survives the attempt.
  if (!allowed.includes(data.user.id)) {
    await supabase.auth.signOut();
    return actionError("Akun ini tidak memiliki akses admin.");
  }

  redirect(ADMIN_HOME_PATH);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(LOGIN_PATH);
}
