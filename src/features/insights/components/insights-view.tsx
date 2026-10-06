"use client";

import { useEffect } from "react";
import { BarChart3, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { useHabits } from "@/features/habits/use-habits";
import { MIN_DAYS_FOR_PATTERN, habitMoodPatterns, type MoodDay } from "@/features/reflection/mood";
import { useTodayKey } from "@/hooks/use-today";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import { HabitHeatmap } from "./habit-heatmap";
import { MoodChart } from "./mood-chart";

const PATTERN_DAYS = 90;

export function InsightsView() {
  const todayKey = useTodayKey();
  return (
    <div className="space-y-4">
      <PageHeader title="Insights" />
      {todayKey && <Insights today={todayKey} />}
    </div>
  );
}

function Insights({ today }: { today: string }) {
  const { habits, logs, loaded } = useHabits(today);
  const [moods, setMoods] = useCachedState<MoodDay[]>("moods", []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = toDateKey(addDays(fromDateKey(today), -PATTERN_DAYS));
      const { data, error } = await createClient()
        .from("daily_notes")
        .select("day, mood")
        .gte("day", since)
        .not("mood", "is", null)
        .order("day");
      if (cancelled) return;
      if (error) {
        // Offline or a server problem: keep showing what we had.
        return console.error("Loading moods failed", error);
      }
      setMoods((data as MoodDay[] | null) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [today, setMoods]);

  const patterns = habitMoodPatterns(moods, logs).filter((p) => Math.abs(p.difference) >= 0.3);
  const habitName = (id: string) => habits.find((h) => h.id === id)?.name ?? "";

  return (
    <Stagger className="space-y-4">
      <StaggerItem>
        <MoodChart moods={moods} today={today} />
      </StaggerItem>

      <StaggerItem>
        <section className="rounded-2xl bg-card px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="size-3.5" />
            Mood and habits · last {PATTERN_DAYS} days
          </p>
          {patterns.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Patterns show up here once you&apos;ve rated your mood on at least {MIN_DAYS_FOR_PATTERN} days with and{" "}
              {MIN_DAYS_FOR_PATTERN} days without a habit.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {patterns.slice(0, 4).map((p) => (
                <li key={p.habitId} className="py-3 text-[15px]">
                  {p.difference > 0 ? "Better" : "Lower"} mood on {habitName(p.habitId).toLowerCase()} days
                  <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">
                    {p.withHabit.toFixed(1)} with vs {p.without.toFixed(1)} without
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Something that goes together, not proof of cause.</p>
        </section>
      </StaggerItem>

      <StaggerItem className="space-y-2">
        <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <BarChart3 className="size-3.5" />
          Habits · last 26 weeks
        </p>
        {!loaded && <div className="h-40 animate-pulse rounded-2xl bg-card" />}
        {loaded && habits.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground">Add a daily habit on Home to see it here.</p>
        )}
        {habits.map((habit) => (
          <HabitHeatmap key={habit.id} habit={habit} days={logs.get(habit.id) ?? new Set()} today={today} />
        ))}
      </StaggerItem>
    </Stagger>
  );
}
