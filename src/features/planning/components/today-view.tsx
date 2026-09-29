"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { fromDateKey } from "@/lib/date";
import { mockNextUp, mockTodayTasks } from "../mock-data";
import { useTodayKey } from "../use-today";
import { FocusList } from "./focus-list";
import { NextUp } from "./next-up";
import { WeekStrip } from "./week-strip";

export function TodayView() {
  const todayKey = useTodayKey();
  const [tasks, setTasks] = useState(mockTodayTasks);

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const today = todayKey ? fromDateKey(todayKey) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Vandaag" />
      {/* The week depends on the device clock, so it renders client-side only. */}
      <div className="min-h-[76px]">
        {today && <WeekStrip today={today} todayCompleted={tasks.every((t) => t.done)} />}
      </div>
      <FocusList tasks={tasks} onToggle={toggle} />
      <NextUp item={mockNextUp} />
    </div>
  );
}
