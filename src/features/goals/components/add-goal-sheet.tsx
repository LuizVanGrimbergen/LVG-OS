"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories } from "../mock-data";
import type { Goal, GoalCategory } from "../types";

type AddGoalSheetProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, "id">) => void;
};

export function AddGoalSheet({ open, onClose, onAdd }: AddGoalSheetProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("sport");
  const [target, setTarget] = useState("10");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNumber = Number(target);
    if (!title.trim()) return setError("Geef je doel een naam.");
    if (!Number.isInteger(targetNumber) || targetNumber < 1) return setError("Het aantal moet minstens 1 zijn.");

    onAdd({ title: title.trim(), category, kind: "count", current: 0, target: targetNumber });
    setTitle("");
    setTarget("10");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-60 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-label="Nieuw doel"
            className="fixed inset-x-0 bottom-0 z-70 mx-auto max-w-md space-y-5 rounded-t-3xl border-t border-border bg-card px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <h2 className="text-lg font-semibold">Nieuw doel</h2>

            <input
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="Mails naar bedrijven in Australië"
              className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring"
            />

            <div className="flex gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={cn(
                    "h-9 rounded-full border px-4 text-sm transition-colors",
                    category === c.id ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              Hoeveel keer?
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  setError("");
                }}
                className="h-10 w-24 rounded-xl border border-input bg-transparent px-3 text-right text-base text-foreground outline-none focus:border-ring"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
              Doel toevoegen
            </Button>
          </motion.form>
        </>
      )}
    </AnimatePresence>
  );
}
