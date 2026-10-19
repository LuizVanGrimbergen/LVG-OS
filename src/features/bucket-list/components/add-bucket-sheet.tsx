"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sections } from "../sections";
import type { BucketItem, BucketSection } from "../types";

type AddBucketSheetProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<BucketItem, "id" | "done">) => void;
};

export function AddBucketSheet({ open, onClose, onAdd }: AddBucketSheetProps) {
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<BucketSection>("sydney");
  const [planned, setPlanned] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Give it a name.");

    onAdd({ title: title.trim(), section, planned: planned.trim() || null });
    setTitle("");
    setPlanned("");
    setError("");
    onClose();
  };

  return (
    <BottomSheet open={open} title="New adventure" onClose={onClose} onSubmit={submit}>
      <input
        autoFocus
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError("");
        }}
        placeholder="Bondi to Coogee coastal walk"
        className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring"
      />

      <div className="flex gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            aria-pressed={section === s.id}
            className={cn(
              "h-9 rounded-full border px-4 text-sm transition-colors",
              section === s.id ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <input
        value={planned}
        onChange={(e) => setPlanned(e.target.value)}
        placeholder="When? (optional)"
        className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Add to bucket list
      </Button>
    </BottomSheet>
  );
}
