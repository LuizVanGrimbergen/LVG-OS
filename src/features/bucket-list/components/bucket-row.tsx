"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useLongPress } from "@/hooks/use-long-press";
import { cn } from "@/lib/utils";
import type { BucketItem } from "../types";

type BucketRowProps = {
  item: BucketItem;
  onToggle: (id: string) => void;
  /** Hold the row to open its options. */
  onOptions: (item: BucketItem) => void;
};

export function BucketRow({ item, onToggle, onOptions }: BucketRowProps) {
  const press = useLongPress(
    () => onOptions(item),
    () => onToggle(item.id),
  );

  return (
    <motion.button
      type="button"
      {...press}
      whileTap={{ scale: 0.98 }}
      aria-pressed={item.done}
      aria-label={`${item.title}${item.planned ? `, ${item.planned}` : ""}. Tap to check off, hold for options`}
      className="flex w-full touch-manipulation items-center gap-3 py-4 text-left select-none [-webkit-touch-callout:none]"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          item.done ? "border-emerald-400 bg-emerald-400 text-background" : "border-input",
        )}
      >
        {item.done && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className={cn("flex-1 text-[15px]", item.done && "text-muted-foreground line-through")}>{item.title}</span>
      {item.planned && <span className="shrink-0 text-sm text-muted-foreground">{item.planned}</span>}
    </motion.button>
  );
}
