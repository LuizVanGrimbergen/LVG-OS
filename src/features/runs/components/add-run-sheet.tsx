"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { parseDistance, parseDuration } from "../runs";
import type { Run } from "../types";

type AddRunSheetProps = {
  open: boolean;
  today: string;
  onClose: () => void;
  onAdd: (run: Omit<Run, "id">) => void;
};

const field =
  "h-10 w-32 rounded-xl border border-input bg-transparent px-3 text-right text-base text-foreground outline-none focus:border-ring";

export function AddRunSheet({ open, today, onClose, onAdd }: AddRunSheetProps) {
  const [day, setDay] = useState(today);
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const close = () => {
    setDay(today);
    setDistance("");
    setTime("");
    setError("");
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const distance_km = parseDistance(distance);
    const duration_s = parseDuration(time);
    if (distance_km === null) return setError("Fill in the distance in km, like 5.2.");
    if (duration_s === null) return setError("Fill in the time as minutes:seconds, like 28:40.");
    if (!day || day > today) return setError("Pick today or a day before.");

    onAdd({ day, distance_km, duration_s });
    close();
  };

  return (
    <BottomSheet open={open} title="New run" onClose={close} onSubmit={submit}>
      <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        Distance (km)
        <input
          autoFocus
          inputMode="decimal"
          value={distance}
          onChange={(e) => {
            setDistance(e.target.value);
            setError("");
          }}
          placeholder="5.2"
          className={field}
        />
      </label>

      <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        Time
        {/* Plain keyboard: the number pad on iPhone has no ":". */}
        <input
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
            setError("");
          }}
          placeholder="28:40"
          className={field}
        />
      </label>

      <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        Day
        <input
          type="date"
          max={today}
          value={day}
          onChange={(e) => {
            setDay(e.target.value);
            setError("");
          }}
          className={field}
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Add run
      </Button>
    </BottomSheet>
  );
}
