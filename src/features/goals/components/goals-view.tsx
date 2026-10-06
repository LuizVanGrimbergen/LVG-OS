"use client";

import { useState } from "react";
import { Briefcase, Dumbbell } from "lucide-react";
import { AddButton } from "@/components/layout/add-button";
import { DeleteSheet } from "@/components/layout/delete-sheet";
import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonRows } from "@/components/layout/skeleton-rows";
import { categories } from "../categories";
import type { Goal } from "../types";
import { useGoals } from "../use-goals";
import { AddGoalSheet } from "./add-goal-sheet";
import { GoalRow } from "./goal-row";

const categoryIcons = { sport: Dumbbell, work: Briefcase };

export function GoalsView() {
  const { goals, loaded, step, remove, add } = useGoals();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Goal | null>(null);

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

      <DeleteSheet
        item={selected && { id: selected.id, title: selected.title }}
        label="Delete goal"
        onDelete={remove}
        onClose={() => setSelected(null)}
      />
      <AddGoalSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
