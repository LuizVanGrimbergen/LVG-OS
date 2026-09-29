"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "../types";

type FocusListProps = {
  tasks: Task[];
  onToggle: (id: string) => void;
};

export function FocusList({ tasks, onToggle }: FocusListProps) {
  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            type="button"
            onClick={() => onToggle(task.id)}
            aria-pressed={task.done}
            className="flex w-full items-center gap-3 py-4 text-left text-[15px]"
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
            <span className={cn("transition-colors", task.done && "text-muted-foreground line-through")}>
              {task.title}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
