"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, endOfMonth, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type MonthCalendarProps = {
  /** First day of the shown month. */
  month: Date;
  selected: string;
  today: string;
  onSelect: (day: string) => void;
  onMonthChange: (offset: -1 | 1) => void;
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
  onSelect,
  onMonthChange,
  hasTasks,
  isCompleted,
}: MonthCalendarProps) {
  const { from, to } = monthGridRange(month);
  const days: Date[] = [];
  for (let d = fromDateKey(from); toDateKey(d) <= to; d = addDays(d, 1)) days.push(d);

  return (
    <section>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(-1)}
          aria-label="Previous month"
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-[15px] font-medium">{monthLabel.format(month)}</h2>
        <button
          type="button"
          onClick={() => onMonthChange(1)}
          aria-label="Next month"
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
          const inMonth = date.getMonth() === month.getMonth();
          if (!inMonth) return <span key={key} />;

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
