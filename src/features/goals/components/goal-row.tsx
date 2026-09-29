"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Goal } from "../types";

type GoalRowProps = {
  goal: Goal;
  onStep: (id: string) => void;
};

export function GoalRow({ goal, onStep }: GoalRowProps) {
  const progress = Math.min(goal.current / goal.target, 1);
  const done = progress >= 1;
  const value = goal.kind === "percent" ? `${goal.current}%` : `${goal.current}/${goal.target}`;
  const step = goal.kind === "percent" ? "+10%" : "+1";

  return (
    <motion.button
      type="button"
      onClick={() => onStep(goal.id)}
      whileTap={{ scale: 0.98 }}
      aria-label={`${goal.title}, ${value}. Tap for ${step}`}
      className="block w-full py-4 text-left"
    >
      <div className="flex items-baseline justify-between gap-3 text-[15px]">
        <span className={cn(done && "text-muted-foreground")}>
          {goal.title}
          {goal.period === "week" && <span className="ml-2 text-xs text-muted-foreground">this week</span>}
        </span>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{value}</span>
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
