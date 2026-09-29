"use client";

import { useSyncExternalStore } from "react";
import { addDays, toDateKey } from "@/lib/date";

export type DayPart = "morning" | "day" | "evening";

/** The night until 05:00 still belongs to the previous day. */
const DAY_STARTS_AT = 5;

function read(): string {
  const now = new Date();
  const hour = now.getHours();
  const part: DayPart =
    hour >= DAY_STARTS_AT && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "day" : "evening";
  const day = hour < DAY_STARTS_AT ? addDays(now, -1) : now;
  // A string keeps the snapshot stable between renders.
  return `${part}|${toDateKey(day)}`;
}

// Re-check every minute and when the app comes back to the foreground.
function subscribe(onChange: () => void) {
  const interval = setInterval(onChange, 60_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** Current part of the day and the date it belongs to, or null during server rendering. */
export function useDayPart(): { part: DayPart; dateKey: string } | null {
  const snapshot = useSyncExternalStore(subscribe, read, () => null);
  if (!snapshot) return null;
  const [part, dateKey] = snapshot.split("|") as [DayPart, string];
  return { part, dateKey };
}
