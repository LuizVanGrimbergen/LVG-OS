import type { Goal, GoalCategory } from "./types";

// Placeholder data until Supabase is connected.

export const categories: { id: GoalCategory; label: string }[] = [
  { id: "sport", label: "Sport" },
  { id: "werk", label: "Werk" },
];

export const mockGoals: Goal[] = [
  { id: "1", title: "3x per week sporten", category: "sport", kind: "count", current: 2, target: 3, period: "week" },
  { id: "2", title: "Halve marathon lopen", category: "sport", kind: "percent", current: 40, target: 100 },
  { id: "3", title: "Mails naar bedrijven in Australië", category: "werk", kind: "count", current: 8, target: 30 },
  { id: "4", title: "Sollicitatiegesprekken", category: "werk", kind: "count", current: 1, target: 5 },
];
