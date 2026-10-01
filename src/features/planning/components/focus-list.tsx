"use client";

import { motion } from "motion/react";
import { Check, Repeat, Target } from "lucide-react";
import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import { useLongPress } from "@/hooks/use-long-press";
import { cn } from "@/lib/utils";
import type { Task } from "../types";

type FocusListProps = {
  tasks: Task[];
  onToggle: (id: string) => void;
  /** Hold a task to open its options. */
  onOptions: (task: Task) => void;
};

export function FocusList({ tasks, onToggle, onOptions }: FocusListProps) {
  return (
    <AnimatedList className="divide-y divide-border">
      {tasks.map((task) => (
        <AnimatedListItem key={task.id}>
          <TaskRow task={task} onToggle={onToggle} onOptions={onOptions} />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}

function TaskRow({ task, onToggle, onOptions }: { task: Task } & Omit<FocusListProps, "tasks">) {
  const press = useLongPress(
    () => onOptions(task),
    () => onToggle(task.id),
  );

  return (
    <button
      type="button"
      {...press}
      aria-pressed={task.done}
      aria-label={`${task.title}. Tap to ${task.done ? "undo" : "complete"}, hold for options`}
      className="flex w-full touch-manipulation items-center gap-3 py-4 text-left text-[15px] select-none [-webkit-touch-callout:none]"
    >
      <motion.span
        whileTap={{ scale: 0.85 }}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          task.done ? "border-foreground bg-foreground text-background" : "border-foreground/40",
        )}
      >
        {task.done && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check className="size-3" strokeWidth={3} />
          </motion.span>
        )}
      </motion.span>
      <span className={cn("flex-1 transition-colors", task.done && "text-muted-foreground line-through")}>
        {task.title}
      </span>
      {task.goal_id && <Target className="size-3.5 shrink-0 text-muted-foreground" aria-label="Counts towards a goal" />}
      {task.recurring_id && <Repeat className="size-3.5 shrink-0 text-muted-foreground" aria-label="Repeats" />}
    </button>
  );
}
