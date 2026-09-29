"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useTodayKey } from "@/hooks/use-today";
import { fromDateKey } from "@/lib/date";
import { mockNextUp } from "../mock-data";
import { useTasks } from "../tasks-context";
import { NextUp } from "./next-up";
import { WeekStrip } from "./week-strip";

export function HomeView() {
  const todayKey = useTodayKey();
  const { tasks } = useTasks();

  const today = todayKey ? fromDateKey(todayKey) : null;
  const done = tasks.filter((t) => t.done).length;
  const allDone = tasks.length > 0 && done === tasks.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Home" />
      {/* The week depends on the device clock, so it renders client-side only. */}
      <div className="min-h-[76px]">{today && <WeekStrip today={today} todayCompleted={allDone} />}</div>

      <div className="space-y-2">
        <Link
          href="/tasks"
          className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 text-[15px] transition-colors active:bg-muted"
        >
          <span>Tasks</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {tasks.length === 0 ? "Nothing planned" : `${done} of ${tasks.length} done`}
            <ChevronRight className="size-4" />
          </span>
        </Link>
        <NextUp item={mockNextUp} />
      </div>
    </div>
  );
}
