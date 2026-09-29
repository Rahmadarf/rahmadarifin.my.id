import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";

// Cookie-free client for the public site. Public pages read only published
// content, so they do not need a session — and skipping cookies() keeps those
// routes cacheable instead of forcing every request to render dynamically.
//
// This client carries no user identity, so RLS treats it as `anon`: published
// rows only.
export function createAnonClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createSupabaseClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
