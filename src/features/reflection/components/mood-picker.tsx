"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { MOOD_ICONS, MOOD_LABELS } from "../mood";

/** Five faces: how was today? Tap again to change. */
export function MoodPicker({ value, onPick }: { value?: number; onPick: (mood: number) => void }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-4">
      <p className="text-[15px]">How was today?</p>
      <div className="mt-3 flex justify-between" role="radiogroup" aria-label="Mood">
        {MOOD_LABELS.map((label, i) => {
          const mood = i + 1;
          const Icon = MOOD_ICONS[i];
          const on = value === mood;
          return (
            <motion.button
              key={label}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={label}
              whileTap={{ scale: 0.85 }}
              onClick={() => onPick(mood)}
              className="flex w-12 flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border transition-colors",
                  on ? "border-amber-300 bg-amber-300 text-background" : "border-foreground/20 text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className={cn("text-[11px]", on ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
