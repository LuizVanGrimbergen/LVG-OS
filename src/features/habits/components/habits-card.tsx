"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ChevronRight, Flame, Plus, Repeat2 } from "lucide-react";
import { DeleteSheet } from "@/components/layout/delete-sheet";
import { useLongPress } from "@/hooks/use-long-press";
import { celebrate } from "@/lib/celebrate";
import { cn } from "@/lib/utils";
import { HABIT_ICONS } from "../icons";
import { useHabits, type Habit } from "../use-habits";
import { AddHabitSheet } from "./add-habit-sheet";

/** Streaks worth a little confetti. */
const STREAK_MILESTONES = new Set([7, 14, 21, 30, 50, 100, 200, 365]);

/** Daily habits on Home: tap to tick off today, hold to delete, + to add. */
export function HabitsCard({ today }: { today: string }) {
  const { habits, loaded, doneToday, streak, toggleToday, add, remove } = useHabits(today);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Habit | null>(null);

  const tick = async (habit: Habit) => {
    const newStreak = await toggleToday(habit.id);
    if (newStreak && STREAK_MILESTONES.has(newStreak)) void celebrate();
  };

  if (!loaded) return <div className="h-28 rounded-2xl bg-card" />;

  return (
    <section className="rounded-2xl bg-card px-4 py-4">
      <div className="flex items-center justify-between">
        <Link href="/insights" className="-my-2 flex items-center gap-1.5 py-2 text-xs text-muted-foreground">
          <Repeat2 className="size-3.5" />
          Habits
          <ChevronRight className="size-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="New habit"
          className="-m-2 flex size-8 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {habits.length === 0 ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-input py-4 text-sm text-muted-foreground"
        >
          Add a daily habit, like water or stretching
        </button>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-3">
          <AnimatePresence initial={false}>
            {habits.map((habit) => (
              <HabitButton
                key={habit.id}
                habit={habit}
                done={doneToday(habit.id)}
                streak={streak(habit.id)}
                onTick={() => tick(habit)}
                onOptions={() => setSelected(habit)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddHabitSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
      <DeleteSheet
        item={selected && { id: selected.id, title: selected.name }}
        label="Delete habit"
        onDelete={remove}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

type HabitButtonProps = {
  habit: Habit;
  done: boolean;
  streak: number;
  onTick: () => void;
  onOptions: () => void;
};

function HabitButton({ habit, done, streak, onTick, onOptions }: HabitButtonProps) {
  const Icon = (HABIT_ICONS[habit.icon] ?? HABIT_ICONS.check).icon;
  const press = useLongPress(onOptions, onTick);

  return (
    <motion.button
      type="button"
      {...press}
      layout
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      whileTap={{ scale: 0.9 }}
      aria-pressed={done}
      aria-label={`${habit.name}${done ? ", done today" : ""}. ${streak} day streak. Tap to ${done ? "undo" : "tick off"}, hold for options`}
      className="flex w-16 touch-manipulation flex-col items-center gap-1 select-none [-webkit-touch-callout:none]"
    >
      <motion.span
        animate={{ scale: done ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex size-12 items-center justify-center rounded-full border transition-colors",
          done
            ? "border-emerald-400 bg-emerald-400 text-background shadow-[0_0_18px_rgba(52,211,153,0.35)]"
            : "border-foreground/20 text-foreground",
        )}
      >
        <Icon className="size-5" />
      </motion.span>
      <span className="w-full truncate text-center text-[11px] text-muted-foreground">{habit.name}</span>
      <span
        className={cn(
          "flex h-3.5 items-center gap-0.5 text-[11px] tabular-nums",
          streak > 0 ? "text-amber-400" : "text-transparent",
        )}
      >
        <Flame className="size-3" />
        {streak}
      </span>
    </motion.button>
  );
}
