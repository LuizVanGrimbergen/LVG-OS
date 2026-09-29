"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";

type AddTaskSheetProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
};

export function AddTaskSheet({ open, onClose, onAdd }: AddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("What do you want to do?");

    onAdd(title.trim());
    setTitle("");
    setError("");
    onClose();
  };

  return (
    <BottomSheet open={open} title="New task" onClose={onClose} onSubmit={submit}>
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Add task
      </Button>
    </BottomSheet>
  );
}
