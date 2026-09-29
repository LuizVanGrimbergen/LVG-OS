"use client";

import { useState } from "react";
import { Briefcase, Dumbbell } from "lucide-react";
import { AddButton } from "@/components/layout/add-button";
import { PageHeader } from "@/components/layout/page-header";
import { categories, mockGoals } from "../mock-data";
import type { Goal } from "../types";
import { AddGoalSheet } from "./add-goal-sheet";
import { GoalRow } from "./goal-row";

const categoryIcons = { sport: Dumbbell, work: Briefcase };

export function GoalsView() {
  const [goals, setGoals] = useState(mockGoals);
  const [adding, setAdding] = useState(false);

  const step = (id: string) =>
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, current: Math.min(g.current + (g.kind === "percent" ? 10 : 1), g.target) } : g,
      ),
    );

  const add = (goal: Omit<Goal, "id">) => setGoals((prev) => [...prev, { ...goal, id: crypto.randomUUID() }]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        action={<AddButton label="New goal" onClick={() => setAdding(true)} />}
      />

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
                <GoalRow key={goal.id} goal={goal} onStep={step} />
              ))}
            </div>
          </section>
        );
      })}

      <AddGoalSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
