"use client";

import { useEffect, useState } from "react";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import type { Run } from "./types";

const newestFirst = (a: Run, b: Run) => b.day.localeCompare(a.day);

/** Your runs from Supabase, newest first. */
export function useRuns() {
  const [runs, setRuns, cached] = useCachedState<Run[]>("runs", []);
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("runs")
        .select("id, day, distance_km, duration_s")
        .order("day", { ascending: false })
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        // Offline or a server problem: keep showing what we had instead of an empty list.
        console.error("Loading runs failed", error);
      } else {
        // numeric columns arrive as strings.
        setRuns(((data as Run[] | null) ?? []).map((r) => ({ ...r, distance_km: Number(r.distance_km) })));
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setRuns]);

  const add = async (fields: Omit<Run, "id">) => {
    const run: Run = { ...fields, id: crypto.randomUUID() };
    setRuns((prev) => [run, ...prev].sort(newestFirst));

    const { error } = await createClient().from("runs").insert(run);
    if (error) {
      console.error("Adding run failed", error);
      setRuns((prev) => prev.filter((r) => r.id !== run.id));
    }
  };

  const remove = async (id: string) => {
    const before = runs;
    setRuns((prev) => prev.filter((r) => r.id !== id));

    const { error } = await createClient().from("runs").delete().eq("id", id);
    if (error) {
      console.error("Deleting run failed", error);
      setRuns(before);
    }
  };

  return { runs, loaded, add, remove };
}
