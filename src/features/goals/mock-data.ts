import type { Goal, GoalCategory } from "./types";

// Placeholder data until Supabase is connected.

export const categories: { id: GoalCategory; label: string }[] = [
  { id: "sport", label: "Sport" },
  { id: "work", label: "Work" },
];

export const mockGoals: Goal[] = [
  { id: "1", title: "Work out 3x a week", category: "sport", kind: "count", current: 2, target: 3, period: "week" },
  { id: "2", title: "Run a half marathon", category: "sport", kind: "percent", current: 40, target: 100 },
  { id: "3", title: "Email companies in Australia", category: "work", kind: "count", current: 8, target: 30 },
  { id: "4", title: "Job interviews", category: "work", kind: "count", current: 1, target: 5 },
];
