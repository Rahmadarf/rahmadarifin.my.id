import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Call in every admin page/data action; a hidden button is not authorization.
export async function requireAdmin() {
  const allowedUserIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!allowedUserIds.length) {
    throw new Error("Isi ADMIN_USER_IDS sebelum mengaktifkan fitur admin.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/admin/login");
  }

  if (!allowedUserIds.includes(data.user.id)) {
    throw new Error("Akun ini tidak memiliki akses admin.");
  }

  return { supabase, user: data.user };
}
