"use client";

import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import { useLongPress } from "@/hooks/use-long-press";
import { cn } from "@/lib/utils";
import type { Goal } from "../types";

type GoalRowProps = {
  goal: Goal;
  onStep: (id: string) => void;
  /** Hold the row to open its options. */
  onOptions: (goal: Goal) => void;
};

export function GoalRow({ goal, onStep, onOptions }: GoalRowProps) {
  const progress = Math.min(goal.current / goal.target, 1);
  const done = progress >= 1;
  const value = goal.kind === "percent" ? `${goal.current}%` : `${goal.current}/${goal.target}`;
  const step = goal.kind === "percent" ? "+10%" : "+1";
  const press = useLongPress(
    () => onOptions(goal),
    () => onStep(goal.id),
  );

  return (
    <motion.button
      type="button"
      {...press}
      whileTap={{ scale: 0.98 }}
      aria-label={`${goal.title}, ${value}. Tap for ${step}, hold for options`}
      className="block w-full touch-manipulation py-4 text-left select-none [-webkit-touch-callout:none]"
    >
      <div className="flex items-baseline justify-between gap-3 text-[15px]">
        <span className={cn(done && "text-muted-foreground")}>
          {goal.title}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
          {done && <Trophy className="size-3.5 text-emerald-400" aria-label="Completed" />}
          {value}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
        <motion.div
          className={cn("h-full rounded-full", done ? "bg-emerald-400" : "bg-foreground")}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </motion.button>
  );
}
