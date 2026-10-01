"use client";

import { useState } from "react";
import { Briefcase, Dumbbell } from "lucide-react";
import { AddButton } from "@/components/layout/add-button";
import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonRows } from "@/components/layout/skeleton-rows";
import { useTasks } from "@/features/planning/tasks-context";
import { useTodayKey } from "@/hooks/use-today";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import { categories } from "../categories";
import type { Goal } from "../types";
import { useGoals } from "../use-goals";
import { AddGoalSheet } from "./add-goal-sheet";
import { GoalOptionsSheet } from "./goal-options-sheet";
import { GoalRow } from "./goal-row";

const categoryIcons = { sport: Dumbbell, work: Briefcase };

export function GoalsView() {
  const todayKey = useTodayKey();
  const { add: addTask } = useTasks();
  const { goals, loaded, step, remove, add } = useGoals();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Goal | null>(null);

  /** One task per day from today, each counting towards the goal. */
  const addSteps = (goal: Goal, steps: string[]) => {
    if (!todayKey) return;
    steps.forEach((title, i) => addTask(title, toDateKey(addDays(fromDateKey(todayKey), i)), goal.id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        action={<AddButton label="New goal" onClick={() => setAdding(true)} />}
      />

      {!loaded && <SkeletonRows lines={2} />}
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
            <AnimatedList className="divide-y divide-border">
              {inCategory.map((goal) => (
                <AnimatedListItem key={goal.id}>
                  <GoalRow goal={goal} onStep={step} onOptions={setSelected} />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </section>
        );
      })}

      <GoalOptionsSheet goal={selected} onAddSteps={addSteps} onDelete={remove} onClose={() => setSelected(null)} />
      <AddGoalSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
