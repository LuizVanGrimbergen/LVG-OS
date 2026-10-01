"use client";

import { useEffect, useState } from "react";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import type { SmokingCost } from "./savings";

/** Your first smoke-free day ("YYYY-MM-DD") and what smoking cost, stored in the settings table. */
export function useSmokeFreeSince() {
  const [since, setSinceState, cached] = useCachedState<string | null>("smoke-free-since", null);
  const [cost, setCostState] = useCachedState<SmokingCost | null>("smoking-cost", null);
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("settings")
        .select("smoke_free_since, cigarettes_per_day, pack_price, pack_size")
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error("Loading settings failed", error);
      setSinceState(data?.smoke_free_since ?? null);
      if (data?.cigarettes_per_day && data.pack_price) {
        setCostState({
          cigarettesPerDay: data.cigarettes_per_day,
          packPrice: Number(data.pack_price),
          packSize: data.pack_size,
        });
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setSinceState, setCostState]);

  const setSince = async (day: string) => {
    const before = since;
    setSinceState(day);
    const { error } = await createClient().from("settings").upsert({ smoke_free_since: day }, { onConflict: "user_id" });
    if (error) {
      console.error("Saving quit date failed", error);
      setSinceState(before);
    }
  };

  const setCost = async (next: SmokingCost) => {
    const before = cost;
    setCostState(next);
    const { error } = await createClient()
      .from("settings")
      .upsert(
        { cigarettes_per_day: next.cigarettesPerDay, pack_price: next.packPrice, pack_size: next.packSize },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("Saving smoking cost failed", error);
      setCostState(before);
    }
  };

  return { since, cost, loaded, setSince, setCost };
}
