"use client";

import { BottomSheet } from "./bottom-sheet";
import { Button } from "@/components/ui/button";

type DeleteSheetProps = {
  /** The item to delete; the sheet is open while this is set. */
  item: { id: string; title: string } | null;
  /** Button text, e.g. "Delete goal". */
  label: string;
  onDelete: (id: string) => void;
  onClose: () => void;
};

/** Opened by holding an item: confirm deleting it. */
export function DeleteSheet({ item, label, onDelete, onClose }: DeleteSheetProps) {
  return (
    <BottomSheet
      open={item !== null}
      title={item?.title ?? ""}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (item) onDelete(item.id);
        onClose();
      }}
    >
      <div className="space-y-2">
        <Button type="submit" variant="destructive" size="lg" className="h-12 w-full rounded-xl text-base">
          {label}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose} className="h-12 w-full rounded-xl text-base">
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
