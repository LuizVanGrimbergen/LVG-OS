"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { useDayPart } from "@/hooks/use-day-part";
import { createClient } from "@/lib/supabase/client";
import type { DailyNote } from "./types";

type ReflectionContextValue = {
  notes: Record<string, DailyNote>;
  /** The day whose note has finished loading. */
  loadedDay: string | null;
  save: <F extends keyof DailyNote>(dateKey: string, field: F, value: NonNullable<DailyNote[F]>) => void;
};

const ReflectionContext = createContext<ReflectionContextValue | null>(null);

/** The current day's intention and reflection, stored in Supabase. */
export function ReflectionProvider({ children }: { children: ReactNode }) {
  const dateKey = useDayPart()?.dateKey;
  const [notes, setNotes] = useState<Record<string, DailyNote>>({});
  const [loadedDay, setLoadedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!dateKey) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("daily_notes")
        .select("intention, reflection, mood")
        .eq("day", dateKey)
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error("Loading notes failed", error);
      if (data) {
        const note: DailyNote = {
          intention: data.intention ?? undefined,
          reflection: data.reflection ?? undefined,
          mood: data.mood ?? undefined,
        };
        setNotes((prev) => ({ ...prev, [dateKey]: note }));
      }
      setLoadedDay(dateKey);
    })();
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  const save = async <F extends keyof DailyNote>(day: string, field: F, value: NonNullable<DailyNote[F]>) => {
    const before = notes[day];
    setNotes((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));

    // Upsert only touches the column we send, so the other half of the day stays.
    const { error } = await createClient()
      .from("daily_notes")
      .upsert({ day, [field]: value }, { onConflict: "user_id,day" });
    if (error) {
      console.error("Saving note failed", error);
      setNotes((prev) => ({ ...prev, [day]: before ?? {} }));
    }
  };

  return <ReflectionContext value={{ notes, loadedDay, save }}>{children}</ReflectionContext>;
}

export function useReflection(): ReflectionContextValue {
  const value = use(ReflectionContext);
  if (!value) throw new Error("useReflection must be used inside <ReflectionProvider>");
  return value;
}
