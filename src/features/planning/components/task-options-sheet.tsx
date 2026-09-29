"use client";

import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Task } from "../types";

type TaskOptionsSheetProps = {
  task: Task | null;
  today: string;
  onMove: (id: string, day: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

/** Opened by holding a task: move it to today, or delete it. */
export function TaskOptionsSheet({ task, today, onMove, onDelete, onClose }: TaskOptionsSheetProps) {
  const canMove = task !== null && task.day !== today;

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
            className="h-12 w-full rounded-xl text-base"
          >
            Move to today
          </Button>
        )}
        <Button type="submit" variant="destructive" size="lg" className="h-12 w-full rounded-xl text-base">
          Delete task
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose} className="h-12 w-full rounded-xl text-base">
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
