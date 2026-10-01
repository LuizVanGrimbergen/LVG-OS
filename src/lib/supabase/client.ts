import { createBrowserClient } from "@supabase/ssr";
import { createOfflineFetch } from "@/lib/offline-queue";

const offlineFetch = typeof window === "undefined" ? undefined : createOfflineFetch();

/** Supabase client for Client Components (runs in the browser). Database writes made offline are queued. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { fetch: offlineFetch } },
  );
}
