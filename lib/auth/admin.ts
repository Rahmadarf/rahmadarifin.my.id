import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin/projects";

export function adminUserIds() {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export type AdminCheck =
  | { ok: true; user: User }
  | { ok: false; reason: "unconfigured" | "no-owner-list" | "signed-out" | "forbidden" };

// Reads the session without redirecting. Use from the login page, which must
// stay reachable while signed out.
export async function checkAdmin(): Promise<AdminCheck> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }

  const allowed = adminUserIds();
  if (!allowed.length) {
    return { ok: false, reason: "no-owner-list" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { ok: false, reason: "signed-out" };
  }

  if (!allowed.includes(data.user.id)) {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, user: data.user };
}

// Call in every admin page and Server Action; a hidden button is not
// authorization. This is the app-level gate. It does not replace RLS: the
// database independently restricts every write to the row's owner_id, so a
// UUID added here still cannot touch another owner's rows.
export async function requireAdmin() {
  const check = await checkAdmin();

  if (!check.ok) {
    if (check.reason === "forbidden") {
      redirect(`${LOGIN_PATH}?error=forbidden`);
    }
    if (check.reason === "no-owner-list") {
      redirect(`${LOGIN_PATH}?error=no-owner-list`);
    }
    if (check.reason === "unconfigured") {
      redirect(`${LOGIN_PATH}?error=unconfigured`);
    }
    redirect(LOGIN_PATH);
  }

  const supabase = await createClient();
  return { supabase, user: check.user };
}
