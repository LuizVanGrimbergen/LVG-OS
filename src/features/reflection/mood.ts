import { Angry, Frown, Laugh, Meh, Smile, type LucideIcon } from "lucide-react";

/** Mood 1 … 5, stored per day in daily_notes.mood. */
export const MOOD_LABELS = ["Rough", "Meh", "Okay", "Good", "Great"] as const;

export const MOOD_ICONS: LucideIcon[] = [Angry, Frown, Meh, Smile, Laugh];
