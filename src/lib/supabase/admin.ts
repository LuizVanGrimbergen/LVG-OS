import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client with the secret key. Bypasses row level security,
 * so only use it in trusted jobs like the reminder cron.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
