import type { AgendaItem, Task } from "./types";

// Placeholder data until Supabase is connected.

export const mockTodayTasks: Task[] = [
  { id: "1", title: "LVG OS basis opzetten", done: true },
  { id: "2", title: "Supabase-project aanmaken", done: false },
  { id: "3", title: "30 min lezen", done: false },
];

export const mockNextUp: AgendaItem = { title: "Sport", time: "18:00" };

// Past days on which all focus tasks were completed, as "days ago".
const completedDaysAgo = new Set([1, 2, 4, 5]);

export function wasDayCompleted(daysAgo: number): boolean {
  return completedDaysAgo.has(daysAgo);
}
