"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "../tasks-context";

const dismissedKey = (today: string) => `lvg-os:carry-over-dismissed:${today}`;

function readDismissed(today: string): boolean {
  try {
    return localStorage.getItem(dismissedKey(today)) === "1";
  } catch {
    return false;
  }
}

/** "3 unfinished tasks from earlier": move them to today in one tap, or hide it for today. */
export function CarryOverCard({ today }: { today: string }) {
  const { overdue, moveOverdueToToday } = useTasks();
  const [dismissed, setDismissed] = useState(() => readDismissed(today));

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(dismissedKey(today), "1");
    } catch {
      // Storage unavailable: it just shows again next time.
    }
  };

  const show = !dismissed && overdue.length > 0;
  const count = overdue.length;

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl bg-card px-4 py-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="size-3.5" />
              Unfinished from earlier
            </p>
            <p className="mt-1 text-[15px]">
              {count} {count === 1 ? "task wasn't" : "tasks weren't"} finished.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {overdue.slice(0, 3).map((t) => (
                <li key={t.id} className="truncate">
                  · {t.title}
                </li>
              ))}
              {count > 3 && <li>· and {count - 3} more</li>}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button type="button" onClick={moveOverdueToToday} className="h-10 flex-1 rounded-xl">
                Move to today
                <ArrowRight className="size-4" />
              </Button>
              <Button type="button" variant="ghost" onClick={dismiss} className="h-10 rounded-xl">
                Not now
              </Button>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
