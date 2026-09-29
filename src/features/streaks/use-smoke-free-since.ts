"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Your first smoke-free day ("YYYY-MM-DD"), stored in the settings table. */
export function useSmokeFreeSince() {
  const [since, setSinceState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient().from("settings").select("smoke_free_since").maybeSingle();
      if (cancelled) return;
      if (error) console.error("Loading settings failed", error);
      setSinceState(data?.smoke_free_since ?? null);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSince = async (day: string) => {
    const before = since;
    setSinceState(day);
    const { error } = await createClient().from("settings").upsert({ smoke_free_since: day }, { onConflict: "user_id" });
    if (error) {
      console.error("Saving quit date failed", error);
      setSinceState(before);
    }
  };

  return { since, loaded, setSince };
}
