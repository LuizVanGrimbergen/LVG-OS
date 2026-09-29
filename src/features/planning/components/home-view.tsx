"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useTodayKey } from "@/hooks/use-today";
import { fromDateKey } from "@/lib/date";
import { SmokeFreeCard } from "@/features/streaks/components/smoke-free-card";
import { mockNextUp } from "../mock-data";
import { useTasks } from "../tasks-context";
import { NextUp } from "./next-up";
import { TasksCard } from "./tasks-card";
import { WeekStrip } from "./week-strip";

export function HomeView() {
  const todayKey = useTodayKey();
  const { tasks } = useTasks();

  const today = todayKey ? fromDateKey(todayKey) : null;
  const allDone = tasks.length > 0 && tasks.every((t) => t.done);

  return (
    <div className="space-y-6">
      <PageHeader title="Home" back={false} />
      {/* The week depends on the device clock, so it renders client-side only. */}
      <div className="min-h-[76px]">{today && <WeekStrip today={today} todayCompleted={allDone} />}</div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {today ? <SmokeFreeCard today={today} /> : <div className="rounded-2xl bg-card" />}
          <TasksCard tasks={tasks} />
        </div>
        <NextUp item={mockNextUp} />
      </div>
    </div>
  );
}
