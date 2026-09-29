import { addDays, endOfMonth, fromDateKey, toDateKey } from "@/lib/date";
import type { RecurringRule } from "./types";

/** Days ("YYYY-MM-DD") between `from` and `to` (inclusive) on which the rule creates a task. */
export function occurrences(rule: RecurringRule, from: string, to: string): string[] {
  const start = from > rule.start_date ? from : rule.start_date;
  const days: string[] = [];
  for (let d = fromDateKey(start); toDateKey(d) <= to; d = addDays(d, 1)) {
    if (rule.kind === "weekly") {
      const isoWeekday = ((d.getDay() + 6) % 7) + 1;
      if (rule.weekdays.includes(isoWeekday)) days.push(toDateKey(d));
    } else if (rule.month_day) {
      // The 31st falls on the last day in shorter months.
      const lastDay = endOfMonth(d).getDate();
      if (d.getDate() === Math.min(rule.month_day, lastDay)) days.push(toDateKey(d));
    }
  }
  return days;
}

/**
 * The same id for a rule's task on a given day, on every device,
 * so two devices creating it at once end up with one task.
 */
export async function occurrenceId(ruleId: string, day: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(`${ruleId}:${day}`)));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = [...bytes.slice(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
