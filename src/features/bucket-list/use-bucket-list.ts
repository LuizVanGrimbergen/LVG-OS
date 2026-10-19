"use client";

import { useEffect, useState } from "react";
import { celebrate } from "@/lib/celebrate";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import type { BucketItem } from "./types";

/** Your bucket list from Supabase, oldest first. */
export function useBucketList() {
  const [items, setItems, cached] = useCachedState<BucketItem[]>("bucket-list", []);
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("bucket_list")
        .select("id, title, section, planned, done")
        .order("created_at");
      if (cancelled) return;
      if (error) {
        // Offline or a server problem: keep showing what we had instead of an empty list.
        console.error("Loading bucket list failed", error);
      } else {
        setItems((data as BucketItem[] | null) ?? []);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setItems]);

  const update = async (id: string, fields: Partial<Pick<BucketItem, "planned" | "done">>) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...fields } : i)));

    const { error } = await createClient().from("bucket_list").update(fields).eq("id", id);
    if (error) {
      console.error("Updating bucket list item failed", error);
      setItems((prev) => prev.map((i) => (i.id === id ? item : i)));
    }
  };

  const toggle = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!item.done) void celebrate();
    void update(id, { done: !item.done });
  };

  const plan = (id: string, planned: string) => update(id, { planned: planned.trim() || null });

  const remove = async (id: string) => {
    const before = items;
    setItems((prev) => prev.filter((i) => i.id !== id));

    const { error } = await createClient().from("bucket_list").delete().eq("id", id);
    if (error) {
      console.error("Deleting bucket list item failed", error);
      setItems(before);
    }
  };

  const add = async (fields: Omit<BucketItem, "id" | "done">) => {
    const item: BucketItem = { ...fields, id: crypto.randomUUID(), done: false };
    setItems((prev) => [...prev, item]);

    const { error } = await createClient().from("bucket_list").insert(item);
    if (error) {
      console.error("Adding bucket list item failed", error);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  return { items, loaded, toggle, plan, remove, add };
}
