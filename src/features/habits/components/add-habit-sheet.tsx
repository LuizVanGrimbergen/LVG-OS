"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HABIT_ICONS } from "../icons";

type AddHabitSheetProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, icon: string) => void;
};

export function AddHabitSheet({ open, onClose, onAdd }: AddHabitSheetProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("water");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Give your habit a name.");
    onAdd(name.trim(), icon);
    setName("");
    setIcon("water");
    setError("");
    onClose();
  };

  return (
    <BottomSheet open={open} title="New habit" onClose={onClose} onSubmit={submit}>
      <input
        autoFocus
        value={name}
        maxLength={40}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        placeholder="Drink 2 litres of water"
        className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring"
      />

      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Icon">
        {Object.entries(HABIT_ICONS).map(([key, { icon: Icon, label }]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={icon === key}
            aria-label={label}
            onClick={() => setIcon(key)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-2xl border transition-colors",
              icon === key ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Add habit
      </Button>
    </BottomSheet>
  );
}
