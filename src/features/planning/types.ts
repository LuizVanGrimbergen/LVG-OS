export type Task = {
  id: string;
  title: string;
  done: boolean;
  /** "YYYY-MM-DD" the task is planned for. */
  day: string;
  created_at: string;
  /** Set when the task was created by a recurring rule. */
  recurring_id: string | null;
  /** A skipped recurring task stays hidden instead of being created again. */
  skipped: boolean;
  /** The goal that ticking this task moves forward. */
  goal_id: string | null;
};

export type RecurringRule = {
  id: string;
  title: string;
  kind: "weekly" | "monthly";
  /** ISO weekdays, 1 = Monday … 7 = Sunday. */
  weekdays: number[];
  month_day: number | null;
  /** First day it applies, "YYYY-MM-DD". */
  start_date: string;
  goal_id: string | null;
};

/** How a new task repeats: not at all, on weekdays, or monthly on a day. */
export type Repeat = null | { kind: "weekly"; weekdays: number[] } | { kind: "monthly"; monthDay: number };
