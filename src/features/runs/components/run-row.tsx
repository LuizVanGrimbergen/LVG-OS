"use client";

import { motion } from "motion/react";
import { useLongPress } from "@/hooks/use-long-press";
import { fromDateKey } from "@/lib/date";
import { formatDuration, formatPace, km } from "../runs";
import type { Run } from "../types";

const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** One run; hold it to delete. */
export function RunRow({ run, onOptions }: { run: Run; onOptions: (run: Run) => void }) {
  const press = useLongPress(
    () => onOptions(run),
    () => {},
  );
  const date = dayLabel.format(fromDateKey(run.day));

  return (
    <motion.button
      type="button"
      {...press}
      whileTap={{ scale: 0.98 }}
      aria-label={`${date}: ${km(run.distance_km)} in ${formatDuration(run.duration_s)}. Hold for options`}
      className="flex w-full touch-manipulation items-baseline justify-between gap-3 py-4 text-left select-none [-webkit-touch-callout:none]"
    >
      <span className="text-[15px]">
        {km(run.distance_km)}
        <span className="ml-2 tabular-nums">{formatDuration(run.duration_s)}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{date}</span>
      </span>
      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{formatPace(run)}</span>
    </motion.button>
  );
}
