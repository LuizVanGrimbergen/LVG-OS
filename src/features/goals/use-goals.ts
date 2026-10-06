"use client";

import { useEffect, useState } from "react";
import { celebrate } from "@/lib/celebrate";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "./types";

/** Your goals from Supabase, oldest first. */
export function useGoals() {
  const [goals, setGoals, cached] = useCachedState<Goal[]>("goals", []);
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("goals")
        .select("id, title, category, kind, current, target")
        .order("created_at");
      if (cancelled) return;
      if (error) {
        // Offline or a server problem: keep showing what we had instead of an empty list.
        console.error("Loading goals failed", error);
      } else {
        setGoals((data as Goal[] | null) ?? []);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setGoals]);

  const step = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal || goal.current >= goal.target) return;
    const current = Math.min(goal.current + (goal.kind === "percent" ? 10 : 1), goal.target);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current } : g)));
    if (current === goal.target) void celebrate();

    const { error } = await createClient().from("goals").update({ current }).eq("id", id);
    if (error) {
      console.error("Updating goal failed", error);
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: goal.current } : g)));
    }
  };

  const remove = async (id: string) => {
    const before = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id));

    const { error } = await createClient().from("goals").delete().eq("id", id);
    if (error) {
      console.error("Deleting goal failed", error);
      setGoals(before);
    }
  };

  const add = async (fields: Omit<Goal, "id">): Promise<Goal | null> => {
    const goal: Goal = { ...fields, id: crypto.randomUUID() };
    setGoals((prev) => [...prev, goal]);

    const { error } = await createClient().from("goals").insert(goal);
    if (error) {
      console.error("Adding goal failed", error);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
      return null;
    }
    return goal;
  };

  return { goals, loaded, step, remove, add };
}
