import { addDays, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";

/** Days in a row up to `today`, counting from today if done, otherwise from yesterday. */
export function currentStreak(days: ReadonlySet<string>, today: string): number {
  let d = fromDateKey(today);
  if (!days.has(today)) d = addDays(d, -1);
  let count = 0;
  while (days.has(toDateKey(d))) {
    count++;
    d = addDays(d, -1);
  }
  return count;
}

/** The longest run of consecutive days. */
export function longestStreak(days: ReadonlySet<string>): number {
  let best = 0;
  for (const day of days) {
    // Only start counting at the first day of a run.
    if (days.has(toDateKey(addDays(fromDateKey(day), -1)))) continue;
    let length = 0;
    for (let d = fromDateKey(day); days.has(toDateKey(d)); d = addDays(d, 1)) length++;
    best = Math.max(best, length);
  }
  return best;
}

/**
 * Columns of a calendar heatmap: `weeks` weeks ending with the one containing `today`,
 * each column Monday … Sunday as "YYYY-MM-DD".
 */
export function heatmapWeeks(today: string, weeks: number): string[][] {
  const lastMonday = startOfWeek(fromDateKey(today));
  return Array.from({ length: weeks }, (_, w) => {
    const monday = addDays(lastMonday, (w - weeks + 1) * 7);
    return Array.from({ length: 7 }, (_, d) => toDateKey(addDays(monday, d)));
  });
}
