"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories } from "../categories";
import type { Goal, GoalCategory } from "../types";

type AddGoalSheetProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, "id">) => void;
};

export function AddGoalSheet({ open, onClose, onAdd }: AddGoalSheetProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("sport");
  const [target, setTarget] = useState("10");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNumber = Number(target);
    if (!title.trim()) return setError("Give your goal a name.");
    if (!Number.isInteger(targetNumber) || targetNumber < 1) return setError("The number must be at least 1.");

    onAdd({ title: title.trim(), category, kind: "count", current: 0, target: targetNumber });
    setTitle("");
    setTarget("10");
    setError("");
    onClose();
  };

  return (
    <BottomSheet open={open} title="New goal" onClose={onClose} onSubmit={submit}>
      <input
        autoFocus
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError("");
        }}
        placeholder="Email companies in Australia"
        className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring"
      />

      <div className="flex gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
            className={cn(
              "h-9 rounded-full border px-4 text-sm transition-colors",
              category === c.id ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        How many times?
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setError("");
          }}
          className="h-10 w-24 rounded-xl border border-input bg-transparent px-3 text-right text-base text-foreground outline-none focus:border-ring"
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Add goal
      </Button>
    </BottomSheet>
  );
}
