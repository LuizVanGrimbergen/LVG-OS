import { Angry, Frown, Laugh, Meh, Smile, type LucideIcon } from "lucide-react";

/** Mood 1 … 5, stored per day in daily_notes.mood. */
export const MOOD_LABELS = ["Rough", "Meh", "Okay", "Good", "Great"] as const;

export const MOOD_ICONS: LucideIcon[] = [Angry, Frown, Meh, Smile, Laugh];

export type MoodDay = { day: string; mood: number };

/** Average mood, or null without data. */
export function averageMood(days: MoodDay[]): number | null {
  if (days.length === 0) return null;
  return days.reduce((sum, d) => sum + d.mood, 0) / days.length;
}

/** Minimum days on each side before a habit's effect on mood is shown. */
export const MIN_DAYS_FOR_PATTERN = 3;

export type HabitMoodPattern = {
  habitId: string;
  /** Average mood on days you did the habit. */
  withHabit: number;
  /** Average mood on days you didn't. */
  without: number;
  difference: number;
};

/**
 * Per habit, how your mood differs on days you did it vs days you didn't,
 * using only days with a mood. Habits with too few days on either side are left out.
 * Strongest difference first.
 */
export function habitMoodPatterns(moods: MoodDay[], habitDays: Map<string, ReadonlySet<string>>): HabitMoodPattern[] {
  const patterns: HabitMoodPattern[] = [];
  for (const [habitId, days] of habitDays) {
    const on = moods.filter((m) => days.has(m.day));
    const off = moods.filter((m) => !days.has(m.day));
    if (on.length < MIN_DAYS_FOR_PATTERN || off.length < MIN_DAYS_FOR_PATTERN) continue;
    const withHabit = averageMood(on)!;
    const without = averageMood(off)!;
    patterns.push({ habitId, withHabit, without, difference: withHabit - without });
  }
  return patterns.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}
