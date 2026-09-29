"use client";

import { createContext, use, useState, type ReactNode } from "react";
import type { DailyNote } from "./types";

type ReflectionContextValue = {
  notes: Record<string, DailyNote>;
  save: (dateKey: string, field: keyof DailyNote, text: string) => void;
};

const ReflectionContext = createContext<ReflectionContextValue | null>(null);

/** Daily notes by date key. In-memory for now; Supabase will replace this. */
export function ReflectionProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Record<string, DailyNote>>({});

  const save = (dateKey: string, field: keyof DailyNote, text: string) =>
    setNotes((prev) => ({ ...prev, [dateKey]: { ...prev[dateKey], [field]: text } }));

  return <ReflectionContext value={{ notes, save }}>{children}</ReflectionContext>;
}

export function useReflection(): ReflectionContextValue {
  const value = use(ReflectionContext);
  if (!value) throw new Error("useReflection must be used inside <ReflectionProvider>");
  return value;
}
