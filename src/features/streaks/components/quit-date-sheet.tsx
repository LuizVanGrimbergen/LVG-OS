"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";

type QuitDateSheetProps = {
  open: boolean;
  /** Current quit date, if any. */
  value: string | null;
  today: string;
  onClose: () => void;
  onSave: (day: string) => void;
};

export function QuitDateSheet({ open, value, today, onClose, onSave }: QuitDateSheetProps) {
  const [day, setDay] = useState(value ?? today);
  const [error, setError] = useState("");

  return (
    <BottomSheet
      open={open}
      title="Your first smoke-free day"
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (!day) return setError("Pick a date.");
        if (day > today) return setError("That day hasn't happened yet.");
        onSave(day);
        onClose();
      }}
    >
      <input
        type="date"
        value={day}
        max={today}
        onChange={(e) => {
          setDay(e.target.value);
          setError("");
        }}
        aria-label="First smoke-free day"
        className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base text-foreground outline-none [color-scheme:dark] focus:border-ring"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Save
      </Button>
    </BottomSheet>
  );
}
