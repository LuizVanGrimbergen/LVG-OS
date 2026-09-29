"use client";

import { useEffect, useState } from "react";
import { Briefcase, Dumbbell } from "lucide-react";
import { AddButton } from "@/components/layout/add-button";
import { PageHeader } from "@/components/layout/page-header";
import { celebrate } from "@/lib/celebrate";
import { createClient } from "@/lib/supabase/client";
import { categories } from "../categories";
import type { Goal } from "../types";
import { AddGoalSheet } from "./add-goal-sheet";
import { GoalOptionsSheet } from "./goal-options-sheet";
import { GoalRow } from "./goal-row";

const categoryIcons = { sport: Dumbbell, work: Briefcase };

export function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Goal | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("goals")
        .select("id, title, category, kind, current, target")
        .order("created_at");
      if (cancelled) return;
      if (error) console.error("Loading goals failed", error);
      setGoals((data as Goal[] | null) ?? []);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const add = async (fields: Omit<Goal, "id">) => {
    const goal: Goal = { ...fields, id: crypto.randomUUID() };
    setGoals((prev) => [...prev, goal]);

    const { error } = await createClient().from("goals").insert(goal);
    if (error) {
      console.error("Adding goal failed", error);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        action={<AddButton label="New goal" onClick={() => setAdding(true)} />}
      />

      {loaded && goals.length === 0 && <p className="py-4 text-sm text-muted-foreground">Add goals with the +.</p>}

      {categories.map(({ id, label }) => {
        const Icon = categoryIcons[id];
        const inCategory = goals.filter((g) => g.category === id);
        if (inCategory.length === 0) return null;
        return (
          <section key={id}>
            <h2 className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3.5" />
              {label}
            </h2>
            <div className="divide-y divide-border">
              {inCategory.map((goal) => (
                <GoalRow key={goal.id} goal={goal} onStep={step} onOptions={setSelected} />
              ))}
            </div>
          </section>
        );
      })}

      <GoalOptionsSheet goal={selected} onClose={() => setSelected(null)} onDelete={remove} />
      <AddGoalSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
