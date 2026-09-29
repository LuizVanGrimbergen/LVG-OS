"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { fromDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Repeat } from "../types";

type AddTaskSheetProps = {
  open: boolean;
  title: string;
  /** The day the task is added to ("YYYY-MM-DD"); also where a repeat starts. */
  day: string;
  onClose: () => void;
  onAdd: (title: string, repeat: Repeat) => void;
};

type Mode = "once" | "weekly" | "monthly";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function ordinal(n: number): string {
  const suffix = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th";
  return `${n}${suffix}`;
}

const chip = (active: boolean) =>
  cn(
    "h-9 rounded-full border px-4 text-sm transition-colors",
    active ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground",
  );

export function AddTaskSheet({ open, title: sheetTitle, day, onClose, onAdd }: AddTaskSheetProps) {
  const date = fromDateKey(day);
  const isoWeekday = ((date.getDay() + 6) % 7) + 1;

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<Mode>("once");
  const [weekdays, setWeekdays] = useState<number[]>([isoWeekday]);
  const [error, setError] = useState("");

  const toggleWeekday = (d: number) =>
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("What do you want to do?");
    if (mode === "weekly" && weekdays.length === 0) return setError("Pick at least one day.");

    const repeat: Repeat =
      mode === "weekly"
        ? { kind: "weekly", weekdays }
        : mode === "monthly"
          ? { kind: "monthly", monthDay: date.getDate() }
          : null;
    onAdd(title.trim(), repeat);
    setTitle("");
    setMode("once");
    setWeekdays([isoWeekday]);
    setError("");
    onClose();
  };

  return (
    <BottomSheet open={open} title={sheetTitle} onClose={onClose} onSubmit={submit}>
      <input
        autoFocus
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError("");
        }}
        placeholder="Read for 30 min"
        className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring"
      />

      <div className="space-y-3">
        <div className="flex gap-2" role="radiogroup" aria-label="Repeat">
          {(["once", "weekly", "monthly"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={chip(mode === m)}
            >
              {m === "once" ? "Once" : m === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>

        {mode === "weekly" && (
          <div className="flex justify-between">
            {WEEKDAYS.map((label, i) => {
              const d = i + 1;
              const on = weekdays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  aria-label={WEEKDAY_NAMES[i]}
                  onClick={() => {
                    toggleWeekday(d);
                    setError("");
                  }}
                  className={cn(
                    "size-10 rounded-full border text-sm transition-colors",
                    on ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {mode === "monthly" && (
          <p className="text-sm text-muted-foreground">Every month on the {ordinal(date.getDate())}.</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Add task
      </Button>
    </BottomSheet>
  );
}
