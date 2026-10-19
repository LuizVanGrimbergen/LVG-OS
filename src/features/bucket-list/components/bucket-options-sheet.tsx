"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { BucketItem } from "../types";

type BucketOptionsSheetProps = {
  /** The item to edit; the sheet is open while this is set. */
  item: BucketItem | null;
  onPlan: (id: string, planned: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

/** Opened by holding an item: set when, or delete it. */
export function BucketOptionsSheet({ item, onPlan, onDelete, onClose }: BucketOptionsSheetProps) {
  // Keyed by item below, so this starts fresh for every item.
  const [planned, setPlanned] = useState(item?.planned ?? "");

  return (
    <BottomSheet
      open={item !== null}
      title={item?.title ?? ""}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (item) onPlan(item.id, planned);
        onClose();
      }}
    >
      <input
        value={planned}
        onChange={(e) => setPlanned(e.target.value)}
        placeholder="When?"
        className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring"
      />
      <div className="space-y-2">
        <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
          Save
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={() => {
            if (item) onDelete(item.id);
            onClose();
          }}
          className="h-12 w-full rounded-xl text-base"
        >
          Delete
        </Button>
      </div>
    </BottomSheet>
  );
}
