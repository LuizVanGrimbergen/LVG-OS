"use client";

import { useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { HABIT_ICONS } from "@/features/habits/icons";
import { currentStreak, heatmapWeeks, longestStreak } from "@/features/habits/streaks";
import type { Habit } from "@/features/habits/use-habits";
import { fromDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const WEEKS = 26;
const columns = { gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` };
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "short" });

type HabitHeatmapProps = {
  habit: Habit;
  days: ReadonlySet<string>;
  today: string;
};

/** Half a year of one habit: a square per day, filled when done. Tap a square to read it. */
export function HabitHeatmap({ habit, days, today }: HabitHeatmapProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const weeks = heatmapWeeks(today, WEEKS);
  const Icon = (HABIT_ICONS[habit.icon] ?? HABIT_ICONS.check).icon;
  const started = habit.created_at.slice(0, 10);
  const last30 = weeks.flat().filter((d) => d <= today).slice(-30);
  const doneLast30 = last30.filter((d) => days.has(d)).length;

  return (
    <section className="rounded-2xl bg-card px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-1.5 text-[15px]">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{habit.name}</span>
        </p>
        <p className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground tabular-nums">
          <span className="flex items-center gap-1" aria-label="Current streak">
            <Flame className="size-3.5 text-amber-400" />
            {currentStreak(days, today)}
          </span>
          <span className="flex items-center gap-1" aria-label="Longest streak">
            <Trophy className="size-3.5" />
            {longestStreak(days)}
          </span>
        </p>
      </div>

      {/* Month labels above the first week of each month. */}
      <div className="mt-3 grid gap-[2px] text-[10px] text-muted-foreground" style={columns} aria-hidden>
        {weeks.map((week, i) => {
          const first = fromDateKey(week[0]);
          const newMonth = i === 0 || first.getMonth() !== fromDateKey(weeks[i - 1][0]).getMonth();
          return (
            <span key={week[0]} className="h-3 overflow-visible whitespace-nowrap">
              {newMonth && i < WEEKS - 2 ? monthLabel.format(first) : ""}
            </span>
          );
        })}
      </div>
      <div
        className="mt-1 grid grid-flow-col grid-rows-7 gap-[2px]"
        style={columns}
        role="grid"
        aria-label={`${habit.name}, last ${WEEKS} weeks`}
        onPointerLeave={() => setPicked(null)}
      >
        {weeks.flat().map((day) => {
          const future = day > today;
          const done = days.has(day);
          const label = `${dayLabel.format(fromDateKey(day))}: ${done ? "done" : "not done"}`;
          return (
            <button
              key={day}
              type="button"
              role="gridcell"
              disabled={future}
              aria-label={future ? undefined : label}
              onPointerEnter={() => !future && setPicked(day)}
              onClick={() => !future && setPicked(day)}
              className={cn(
                "aspect-square w-full rounded-[2px]",
                future
                  ? "bg-transparent"
                  : done
                    ? "bg-emerald-400"
                    : day < started
                      ? "bg-border/40"
                      : "bg-border",
                picked === day && "ring-2 ring-foreground ring-offset-1 ring-offset-card",
              )}
            />
          );
        })}
      </div>

      <p className="mt-2 h-4 text-xs text-muted-foreground tabular-nums" aria-live="polite">
        {picked
          ? `${dayLabel.format(fromDateKey(picked))} · ${days.has(picked) ? "done" : "not done"}`
          : `${doneLast30} of the last 30 days`}
      </p>
    </section>
  );
}
