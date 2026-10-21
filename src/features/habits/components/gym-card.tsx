"use client";

import { motion } from "motion/react";
import { Dumbbell } from "lucide-react";
import { useLongPress } from "@/hooks/use-long-press";
import { addDays, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import { celebrate } from "@/lib/celebrate";
import { cn } from "@/lib/utils";
import { useHabits } from "../use-habits";

const WEEKLY_GOAL = 3;

/** Gym visits this week (Mon–Sun), up to 3. Tap to add a visit, hold to remove one. */
export function GymCard({ today }: { today: string }) {
  const { habits, logs, loaded, setDay, add } = useHabits(today);
  const gym = habits.find((h) => h.icon === "gym");

  // Days of this week up to today, newest first.
  const monday = startOfWeek(fromDateKey(today));
  const week = Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)))
    .filter((d) => d <= today)
    .reverse();
  const days = gym ? logs.get(gym.id) : undefined;
  const logged = week.filter((d) => days?.has(d));
  const count = logged.length;

  const press = useLongPress(
    () => {
      if (gym && logged[0]) void setDay(gym.id, logged[0], false);
    },
    async () => {
      if (!gym) return add("Gym", "gym");
      // Each visit is stored on its own day: today first, then the days before.
      const free = week.find((d) => !days?.has(d));
      if (count >= WEEKLY_GOAL || !free) return;
      if ((await setDay(gym.id, free, true)) && count + 1 === WEEKLY_GOAL) void celebrate();
    },
  );

  if (!loaded) return <div className="h-28 rounded-2xl bg-card" />;

  return (
    <motion.button
      type="button"
      {...press}
      whileTap={{ scale: 0.97 }}
      aria-label={`${count} of ${WEEKLY_GOAL} gym visits this week. Tap to add one, hold to remove one`}
      className={cn(
        "relative block w-full touch-manipulation rounded-2xl bg-card px-4 py-4 text-left select-none [-webkit-touch-callout:none]",
        count >= WEEKLY_GOAL && "ring-1 ring-emerald-400/60",
      )}
    >
      <Dumbbell className={cn("absolute top-4 right-4 size-5", count > 0 ? "text-emerald-400" : "text-muted-foreground")} />
      <p className="text-4xl font-semibold tracking-tight tabular-nums">
        {count}
        <span className="text-xl text-muted-foreground">/{WEEKLY_GOAL}</span>
      </p>
      <p className="mt-1 text-sm">gym this week</p>
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: WEEKLY_GOAL }, (_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < count ? "bg-emerald-400" : "bg-foreground/15")} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {!gym ? "Tap to start tracking" : count >= WEEKLY_GOAL ? "Done for this week · hold to remove" : "Tap to add · hold to remove"}
      </p>
    </motion.button>
  );
}
