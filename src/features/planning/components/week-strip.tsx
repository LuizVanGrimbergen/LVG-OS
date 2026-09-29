import { Check } from "lucide-react";
import { addDays, daysBetween, startOfWeek, toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" });

type WeekStripProps = {
  today: Date;
  /** Whether all tasks were done on that day ("YYYY-MM-DD"). */
  isCompleted: (dayKey: string) => boolean;
};

export function WeekStrip({ today, isCompleted }: WeekStripProps) {
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <ol className="grid grid-cols-7 gap-1 text-center">
      {days.map((day) => {
        const daysAgo = daysBetween(day, today);
        const isToday = daysAgo === 0;
        const completed = daysAgo >= 0 && isCompleted(toDateKey(day));

        return (
          <li
            key={toDateKey(day)}
            aria-current={isToday ? "date" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-2 text-[11px]",
              isToday ? "bg-foreground text-background" : "text-muted-foreground",
            )}
          >
            <span>{weekday.format(day)}</span>
            <span
              className={cn(
                "text-base",
                isToday ? "font-semibold" : daysAgo > 0 ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {day.getDate()}
            </span>
            <span className="flex h-3.5 items-center">
              {completed && (
                <Check
                  className={cn("size-3.5", isToday ? "text-background" : "text-emerald-400")}
                  strokeWidth={3}
                  aria-label="All tasks done"
                />
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
