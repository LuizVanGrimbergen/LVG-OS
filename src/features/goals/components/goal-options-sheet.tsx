"use client";

import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Goal } from "../types";

type GoalOptionsSheetProps = {
  goal: Goal | null;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export function GoalOptionsSheet({ goal, onClose, onDelete }: GoalOptionsSheetProps) {
  return (
    <BottomSheet
      open={goal !== null}
      title={goal?.title ?? ""}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (goal) onDelete(goal.id);
        onClose();
      }}
    >
      <div className="space-y-2">
        <Button type="submit" variant="destructive" size="lg" className="h-12 w-full rounded-xl text-base">
          Delete goal
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose} className="h-12 w-full rounded-xl text-base">
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
