import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Refreshes the Supabase session and sends signed-out visitors to /login. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static files, the PWA manifest, service worker, icons and cron jobs (they check CRON_SECRET).
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|serwist/|icons/|api/cron/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
