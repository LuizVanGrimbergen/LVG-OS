"use client";

import { useEffect, useState } from "react";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import { currentStreak } from "./streaks";

export type Habit = { id: string; name: string; icon: string; created_at: string };

const HISTORY_DAYS = 400;

/** Your habits and the days you did them (last ~year), stored in Supabase. */
export function useHabits(today: string) {
  const [habits, setHabits, cached] = useCachedState<Habit[]>("habits", []);
  // habitId -> set of "YYYY-MM-DD"
  const [logs, setLogs] = useCachedState<Map<string, Set<string>>>("habit-logs", new Map());
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const since = toDateKey(addDays(fromDateKey(today), -HISTORY_DAYS));
      const [habitsRes, logsRes] = await Promise.all([
        supabase.from("habits").select("id, name, icon, created_at").order("created_at"),
        supabase.from("habit_logs").select("habit_id, day").gte("day", since),
      ]);
      if (cancelled) return;
      if (habitsRes.error || logsRes.error) {
        // Offline or a server problem: keep showing what we had instead of empty habits and streaks.
        if (habitsRes.error) console.error("Loading habits failed", habitsRes.error);
        if (logsRes.error) console.error("Loading habit logs failed", logsRes.error);
        setLoaded(true);
        return;
      }
      const map = new Map<string, Set<string>>();
      for (const { habit_id, day } of logsRes.data ?? []) {
        if (!map.has(habit_id)) map.set(habit_id, new Set());
        map.get(habit_id)!.add(day);
      }
      setHabits(habitsRes.data ?? []);
      setLogs(map);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [today, setHabits, setLogs]);

  const doneToday = (habitId: string) => logs.get(habitId)?.has(today) ?? false;

  /** Days in a row, counting from today if done, otherwise from yesterday. */
  const streak = (habitId: string) => currentStreak(logs.get(habitId) ?? new Set(), today);

  const setLogged = (habitId: string, on: boolean) =>
    setLogs((prev) => {
      const next = new Map(prev);
      const days = new Set(next.get(habitId));
      if (on) days.add(today);
      else days.delete(today);
      next.set(habitId, days);
      return next;
    });

  /** Tick or untick today. Returns the new streak (after ticking). */
  const toggleToday = async (habitId: string): Promise<number | null> => {
    const on = !doneToday(habitId);
    setLogged(habitId, on);
    const table = createClient().from("habit_logs");
    const { error } = on
      ? await table.insert({ habit_id: habitId, day: today })
      : await table.delete().eq("habit_id", habitId).eq("day", today);
    if (error) {
      console.error("Updating habit failed", error);
      setLogged(habitId, !on);
      return null;
    }
    // `logs` here is still from before the tap, so today isn't counted yet.
    return on ? streak(habitId) + 1 : null;
  };

  const add = async (name: string, icon: string) => {
    const habit: Habit = { id: crypto.randomUUID(), name, icon, created_at: new Date().toISOString() };
    setHabits((prev) => [...prev, habit]);
    const { error } = await createClient().from("habits").insert(habit);
    if (error) {
      console.error("Adding habit failed", error);
      setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    }
  };

  const remove = async (id: string) => {
    const before = habits;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    const { error } = await createClient().from("habits").delete().eq("id", id);
    if (error) {
      console.error("Deleting habit failed", error);
      setHabits(before);
    }
  };

  return { habits, logs, loaded, doneToday, streak, toggleToday, add, remove };
}
