"use client";

import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Task } from "../types";

type TaskOptionsSheetProps = {
  task: Task | null;
  today: string;
  onMove: (id: string, day: string) => void;
  onDelete: (id: string) => void;
  onStopRepeating: (ruleId: string) => void;
  onClose: () => void;
};

const big = "h-12 w-full rounded-xl text-base";

/**
 * Opened by holding a task. One-off tasks: move to today or delete.
 * Recurring tasks: skip this day or stop repeating.
 */
export function TaskOptionsSheet({ task, today, onMove, onDelete, onStopRepeating, onClose }: TaskOptionsSheetProps) {
  const recurringId = task?.recurring_id ?? null;
  const canMove = task !== null && !recurringId && task.day !== today;

  return (
    <BottomSheet
      open={task !== null}
      title={task?.title ?? ""}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (task) onDelete(task.id);
        onClose();
      }}
    >
      <div className="space-y-2">
        {canMove && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              onMove(task.id, today);
              onClose();
            }}
            className={big}
          >
            Move to today
          </Button>
        )}
        {recurringId && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              onStopRepeating(recurringId);
              onClose();
            }}
            className={big}
          >
            Stop repeating
          </Button>
        )}
        <Button type="submit" variant="destructive" size="lg" className={big}>
          {recurringId ? "Skip this day" : "Delete task"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose} className={big}>
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
