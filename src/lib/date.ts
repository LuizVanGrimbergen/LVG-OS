/** Local calendar date as "YYYY-MM-DD" (no timezone shifts). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const offset = (date.getDay() + 6) % 7;
  return addDays(date, -offset);
}

/** Whole days between two calendar dates (b - a). */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((fromDateKey(toDateKey(b)).getTime() - fromDateKey(toDateKey(a)).getTime()) / 86_400_000);
}

/** Sunday of the week containing `date`. */
export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

/** First day of the month, `offset` months away from `date`. */
export function startOfMonth(date: Date, offset = 0): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

/** Last day of the month containing `date`. */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export const isDateKey = (value: string | null): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
