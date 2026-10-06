import { endOfWeek, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import type { Run } from "./types";

/** How many runs a week you're aiming for. */
export const WEEKLY_RUNS = 3;

/** "28:40" or "1:05:30" → seconds; null if it can't be read. */
export function parseDuration(input: string): number | null {
  const parts = input.trim().split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d{1,2}$/.test(p))) return null;
  const [s, m, h = 0] = parts.map(Number).reverse();
  if (s > 59 || (parts.length === 3 && m > 59)) return null;
  const total = h * 3600 + m * 60 + s;
  return total > 0 && total < 86_400 ? total : null;
}

/** "5,2" or "5.2" → km; null if it can't be read. */
export function parseDistance(input: string): number | null {
  const value = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const km = Number(value);
  return km > 0 && km < 1000 ? km : null;
}

/** 1720 → "28:40", 3930 → "1:05:30". */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** Minutes per km, e.g. "5:31 /km". */
export function formatPace(run: Pick<Run, "distance_km" | "duration_s">): string {
  return `${formatDuration(Math.round(run.duration_s / run.distance_km))} /km`;
}

export const km = (value: number) => `${value.toLocaleString("en-IE", { maximumFractionDigits: 1 })} km`;

/** Runs and kilometres in the Monday–Sunday week containing `today`. */
export function weekSummary(runs: Run[], today: string): { count: number; km: number } {
  const from = toDateKey(startOfWeek(fromDateKey(today)));
  const to = toDateKey(endOfWeek(fromDateKey(today)));
  const thisWeek = runs.filter((r) => r.day >= from && r.day <= to);
  return { count: thisWeek.length, km: thisWeek.reduce((sum, r) => sum + r.distance_km, 0) };
}
