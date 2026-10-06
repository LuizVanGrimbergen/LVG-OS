"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { DailyQuote } from "@/features/quotes/components/daily-quote";
import { ReflectionCard } from "@/features/reflection/components/reflection-card";
import { SmokeFreeCard } from "@/features/streaks/components/smoke-free-card";
import { useTodayKey } from "@/hooks/use-today";
import { endOfWeek, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import { HabitsCard } from "@/features/habits/components/habits-card";
import { RunsCard } from "@/features/runs/components/runs-card";
import { useTasks } from "../tasks-context";
import { CarryOverCard } from "./carry-over-card";
import { TasksCard } from "./tasks-card";
import { WeekStrip } from "./week-strip";

export function HomeView() {
  const todayKey = useTodayKey();
  const { tasksOn, isDayCompleted, ensureRange, isLoaded } = useTasks();

  const today = todayKey ? fromDateKey(todayKey) : null;
  const weekFrom = today ? toDateKey(startOfWeek(today)) : null;
  const weekTo = today ? toDateKey(endOfWeek(today)) : null;

  useEffect(() => {
    if (weekFrom && weekTo) ensureRange(weekFrom, weekTo);
  }, [weekFrom, weekTo, ensureRange]);

  const loaded = !!weekFrom && !!weekTo && isLoaded(weekFrom, weekTo);

  // Cards appear one after another from the top.
  return (
    <Stagger className="space-y-6">
      <PageHeader title="Home" back={false} />
      {/* The week depends on the device clock, so it renders client-side only. */}
      <StaggerItem className="min-h-[76px]">
        {today && <WeekStrip today={today} isCompleted={isDayCompleted} />}
      </StaggerItem>

      {todayKey && (
        <StaggerItem>
          <DailyQuote dateKey={todayKey} />
        </StaggerItem>
      )}

      <div className="space-y-2">
        {todayKey && <CarryOverCard today={todayKey} />}
        <StaggerItem className="grid grid-cols-2 gap-2">
          {today ? <SmokeFreeCard today={today} /> : <div className="rounded-2xl bg-card" />}
          <TasksCard tasks={todayKey ? tasksOn(todayKey) : []} loaded={loaded} />
        </StaggerItem>
        {todayKey && (
          <StaggerItem>
            <HabitsCard today={todayKey} />
          </StaggerItem>
        )}
        {todayKey && (
          <StaggerItem>
            <RunsCard today={todayKey} />
          </StaggerItem>
        )}
        <StaggerItem>
          <ReflectionCard />
        </StaggerItem>
      </div>
    </Stagger>
  );
}
