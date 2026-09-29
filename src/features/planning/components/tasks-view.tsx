"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { AddButton } from "@/components/layout/add-button";
import { PageHeader } from "@/components/layout/page-header";
import { useTodayKey } from "@/hooks/use-today";
import { addDays, fromDateKey, isDateKey, startOfMonth, toDateKey } from "@/lib/date";
import { useTasks } from "../tasks-context";
import type { Task } from "../types";
import { AddTaskSheet } from "./add-task-sheet";
import { FocusList } from "./focus-list";
import { MonthCalendar, monthGridRange } from "./month-calendar";
import { TaskOptionsSheet } from "./task-options-sheet";

const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

// Remembers on this device whether the calendar is collapsed to one week.
const COLLAPSED_KEY = "lvg-os:tasks-calendar-collapsed";

function readCollapsed(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // Storage unavailable (private mode): the choice just isn't remembered.
  }
}

export function TasksView() {
  const todayKey = useTodayKey();
  const dayParam = useSearchParams().get("day");
  const { tasksOn, isDayCompleted, ensureRange, isLoaded, toggle, add, addRecurring, stopRepeating, move, remove } =
    useTasks();

  // Selected day: from the link (?day=…) or today. Shown month: follows the selection until you page.
  const [pickedDay, setPickedDay] = useState<string | null>(isDateKey(dayParam) ? dayParam : null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [adding, setAdding] = useState(false);
  const [options, setOptions] = useState<Task | null>(null);

  const selected = pickedDay ?? todayKey;
  const month = selected ? startOfMonth(fromDateKey(selected), monthOffset) : null;
  const range = month ? monthGridRange(month) : null;
  const rangeFrom = range?.from;
  const rangeTo = range?.to;

  useEffect(() => {
    if (rangeFrom && rangeTo) ensureRange(rangeFrom, rangeTo);
  }, [rangeFrom, rangeTo, ensureRange]);

  if (!todayKey || !selected || !month || !range) return <PageHeader title="Tasks" />;

  const tasks = tasksOn(selected);
  const loaded = isLoaded(range.from, range.to);
  const label = dayLabel.format(fromDateKey(selected));

  return (
    <div className="space-y-4">
      <PageHeader title="Tasks" action={<AddButton label="New task" onClick={() => setAdding(true)} />} />

      <MonthCalendar
        month={month}
        selected={selected}
        today={todayKey}
        collapsed={collapsed}
        onToggleCollapsed={() => {
          setCollapsed(!collapsed);
          writeCollapsed(!collapsed);
          setMonthOffset(0);
        }}
        onSelect={(day) => {
          setPickedDay(day);
          setMonthOffset(0);
        }}
        onStep={(offset) => {
          if (collapsed) setPickedDay(toDateKey(addDays(fromDateKey(selected), offset * 7)));
          else setMonthOffset((o) => o + offset);
        }}
        hasTasks={(day) => tasksOn(day).length > 0}
        isCompleted={isDayCompleted}
      />

      <section>
        <h2 className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {selected === todayKey ? `Today · ${label}` : label}
        </h2>
        {!loaded ? null : tasks.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Nothing planned. Add a task with the +.</p>
        ) : (
          <FocusList tasks={tasks} onToggle={toggle} onOptions={setOptions} />
        )}
      </section>

      <TaskOptionsSheet
        task={options}
        today={todayKey}
        onMove={move}
        onDelete={remove}
        onStopRepeating={stopRepeating}
        onClose={() => setOptions(null)}
      />
      <AddTaskSheet
        key={selected}
        open={adding}
        day={selected}
        title={selected === todayKey ? "New task" : `New task · ${label}`}
        onClose={() => setAdding(false)}
        onAdd={(title, repeat) => (repeat ? addRecurring(title, repeat, selected) : add(title, selected))}
      />
    </div>
  );
}
