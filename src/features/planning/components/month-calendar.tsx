"use client";

import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, endOfMonth, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type MonthCalendarProps = {
  /** First day of the shown month. */
  month: Date;
  selected: string;
  today: string;
  /** Show only the week of the selected day. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (day: string) => void;
  /** Previous/next: a month when open, a week when collapsed. */
  onStep: (offset: -1 | 1) => void;
  hasTasks: (day: string) => boolean;
  isCompleted: (day: string) => boolean;
};

/** Monday-first month grid covering whole weeks, as "YYYY-MM-DD" keys. */
export function monthGridRange(month: Date): { from: string; to: string } {
  const first = startOfWeek(month);
  const last = addDays(startOfWeek(endOfMonth(month)), 6);
  return { from: toDateKey(first), to: toDateKey(last) };
}

export function MonthCalendar({
  month,
  selected,
  today,
  collapsed,
  onToggleCollapsed,
  onSelect,
  onStep,
  hasTasks,
  isCompleted,
}: MonthCalendarProps) {
  const days: Date[] = [];
  if (collapsed) {
    const monday = startOfWeek(fromDateKey(selected));
    for (let i = 0; i < 7; i++) days.push(addDays(monday, i));
  } else {
    const { from, to } = monthGridRange(month);
    for (let d = fromDateKey(from); toDateKey(d) <= to; d = addDays(d, 1)) days.push(d);
  }
  const unit = collapsed ? "week" : "month";

  return (
    <section>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label={`Previous ${unit}`}
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Show the whole month" : "Show only this week"}
          className="flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-medium active:bg-muted"
        >
          {monthLabel.format(collapsed ? fromDateKey(selected) : month)}
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", !collapsed && "rotate-180")}
          />
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label={`Next ${unit}`}
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 text-[11px] text-muted-foreground">
            {d}
          </span>
        ))}
        {days.map((date) => {
          const key = toDateKey(date);
          // The month grid leaves days of other months empty; the week view shows them all.
          if (!collapsed && date.getMonth() !== month.getMonth()) return <span key={key} />;

          const isSelected = key === selected;
          const isToday = key === today;
          const done = key <= today && isCompleted(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={isSelected}
              aria-label={date.toDateString()}
              className={cn(
                "flex h-11 flex-col items-center justify-center rounded-xl text-sm tabular-nums transition-colors",
                isSelected
                  ? "bg-foreground font-semibold text-background"
                  : isToday
                    ? "font-semibold text-foreground ring-1 ring-border"
                    : key < today
                      ? "text-muted-foreground"
                      : "text-foreground",
              )}
            >
              {date.getDate()}
              <span className="flex h-2 items-center">
                {done ? (
                  <Check
                    className={cn("size-2.5", isSelected ? "text-background" : "text-emerald-400")}
                    strokeWidth={3.5}
                  />
                ) : (
                  hasTasks(key) && (
                    <span className={cn("size-1 rounded-full", isSelected ? "bg-background" : "bg-muted-foreground")} />
                  )
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
