"use client";

import { motion } from "motion/react";
import { Dumbbell } from "lucide-react";
import { addDays, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import { celebrate } from "@/lib/celebrate";
import { cn } from "@/lib/utils";
import { useHabits } from "../use-habits";

const WEEKLY_GOAL = 3;

/** Gym visits this week (Mon–Sun) against a goal of 3. Tap to log or undo today. */
export function GymCard({ today }: { today: string }) {
  const { habits, logs, loaded, doneToday, toggleToday, add } = useHabits(today);
  const gym = habits.find((h) => h.icon === "gym");

  if (!loaded) return <div className="h-28 rounded-2xl bg-card" />;

  const monday = startOfWeek(fromDateKey(today));
  const week = Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)));
  const days = gym ? logs.get(gym.id) : undefined;
  const count = week.filter((d) => days?.has(d)).length;
  const done = gym ? doneToday(gym.id) : false;

  const tap = async () => {
    if (!gym) return add("Gym", "gym");
    await toggleToday(gym.id);
    if (!done && count + 1 === WEEKLY_GOAL) void celebrate();
  };

  return (
    <motion.button
      type="button"
      onClick={tap}
      whileTap={{ scale: 0.97 }}
      aria-label={`${count} of ${WEEKLY_GOAL} gym visits this week. Tap to ${done ? "undo" : "log"} today`}
      className={cn(
        "relative block w-full touch-manipulation rounded-2xl bg-card px-4 py-4 text-left select-none",
        count >= WEEKLY_GOAL && "ring-1 ring-emerald-400/60",
      )}
    >
      <Dumbbell className={cn("absolute top-4 right-4 size-5", done ? "text-emerald-400" : "text-muted-foreground")} />
      <p className="text-4xl font-semibold tracking-tight tabular-nums">
        {count}
        <span className="text-xl text-muted-foreground">/{WEEKLY_GOAL}</span>
      </p>
      <p className="mt-1 text-sm">gym this week</p>
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: Math.max(WEEKLY_GOAL, count) }, (_, i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i < count ? "bg-emerald-400" : "bg-foreground/15")}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {!gym ? "Tap to start tracking" : done ? "Logged today · tap to undo" : "Tap to log today"}
      </p>
    </motion.button>
  );
}
