"use client";

import { useSyncExternalStore } from "react";
import { toDateKey } from "@/lib/date";

// Re-check the date when the app comes back to the foreground,
// so an installed PWA left open overnight rolls over to the new day.
function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** Today's date key on the device, or null during server rendering. */
export function useTodayKey(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => toDateKey(new Date()),
    () => null,
  );
}
