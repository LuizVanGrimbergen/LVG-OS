import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Refreshes the Supabase session and sends signed-out visitors to /login. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static files, the PWA manifest, service worker and icons.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|serwist/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
