"use client";

import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTodayKey } from "@/hooks/use-today";
import { celebrateOnce } from "@/lib/celebrate";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import { occurrenceId, occurrences } from "./recurrence";
import type { RecurringRule, Repeat, Task } from "./types";

type TasksContextValue = {
  /** Tasks planned for a day ("YYYY-MM-DD"), oldest first, without skipped ones. */
  tasksOn: (day: string) => Task[];
  /** Whether every task planned for that day is done (false if none). */
  isDayCompleted: (day: string) => boolean;
  /** Load the tasks between two days (inclusive), once. */
  ensureRange: (from: string, to: string) => void;
  isLoaded: (from: string, to: string) => boolean;
  /** Unfinished one-off tasks from the last two weeks. */
  overdue: Task[];
  moveOverdueToToday: () => void;
  toggle: (id: string) => void;
  add: (title: string, day: string, goalId?: string | null) => void;
  addRecurring: (title: string, repeat: NonNullable<Repeat>, startDay: string, goalId?: string | null) => void;
  /** Stop a rule: its upcoming unfinished tasks go away, past ones stay. */
  stopRepeating: (ruleId: string) => void;
  move: (id: string, day: string) => void;
  remove: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

const TASK_COLUMNS = "id, title, done, day, created_at, recurring_id, skipped, goal_id";
const OVERDUE_LOOKBACK_DAYS = 14;
const rangeKey = (from: string, to: string) => `${from}|${to}`;

/** Tasks from Supabase, loaded per visible range and shared between Home and Tasks. */
export function TasksProvider({ children }: { children: ReactNode }) {
  const todayKey = useTodayKey();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadedRanges, setLoadedRanges] = useState<Set<string>>(() => new Set());
  const requested = useRef(new Set<string>());
  const ranges = useRef<Array<[string, string]>>([]);
  const rules = useRef<Promise<RecurringRule[]> | null>(null);
  // Rule occurrences already created on this device ("ruleId|day").
  const created = useRef(new Set<string>());

  const loadRules = useCallback(() => {
    rules.current ??= (async () => {
      const { data, error } = await createClient()
        .from("recurring_tasks")
        .select("id, title, kind, weekdays, month_day, start_date, goal_id");
      if (error) console.error("Loading recurring tasks failed", error);
      return (data ?? []) as RecurringRule[];
    })();
    return rules.current;
  }, []);

  /** Create the tasks that rules call for in a range, if they don't exist yet. */
  const materialize = useCallback(async (list: RecurringRule[], from: string, to: string, existing: Task[]) => {
    const have = new Set(existing.filter((t) => t.recurring_id).map((t) => `${t.recurring_id}|${t.day}`));
    const fresh: Task[] = [];
    for (const rule of list) {
      for (const day of occurrences(rule, from, to)) {
        const key = `${rule.id}|${day}`;
        if (have.has(key) || created.current.has(key)) continue;
        created.current.add(key);
        fresh.push({
          id: await occurrenceId(rule.id, day),
          title: rule.title,
          done: false,
          day,
          // Recurring tasks sort before one-off tasks of the same day.
          created_at: `${rule.start_date}T00:00:00.000Z`,
          recurring_id: rule.id,
          skipped: false,
          goal_id: rule.goal_id,
        });
      }
    }
    if (fresh.length === 0) return;

    setTasks((prev) => {
      const ids = new Set(prev.map((t) => t.id));
      return [...prev, ...fresh.filter((t) => !ids.has(t.id))];
    });
    const { error } = await createClient().from("tasks").upsert(fresh, { onConflict: "id", ignoreDuplicates: true });
    if (error) console.error("Creating recurring tasks failed", error);
  }, []);

  const ensureRange = useCallback(
    async (from: string, to: string) => {
      const key = rangeKey(from, to);
      if (requested.current.has(key)) return;
      requested.current.add(key);

      const [res, list] = await Promise.all([
        createClient().from("tasks").select(TASK_COLUMNS).gte("day", from).lte("day", to),
        loadRules(),
      ]);
      if (res.error) {
        console.error("Loading tasks failed", res.error);
        requested.current.delete(key);
        return;
      }
      const data = res.data as Task[];
      // Merge by id: the fetched rows win, tasks outside the range stay.
      setTasks((prev) => {
        const fetched = new Set(data.map((t) => t.id));
        return [...prev.filter((t) => !fetched.has(t.id)), ...data];
      });
      setLoadedRanges((prev) => new Set(prev).add(key));
      ranges.current.push([from, to]);
      void materialize(list, from, to, data);
    },
    [loadRules, materialize],
  );

  // Unfinished one-off tasks from the last two weeks, for "move to today".
  const overdueFrom = todayKey ? toDateKey(addDays(fromDateKey(todayKey), -OVERDUE_LOOKBACK_DAYS)) : null;
  useEffect(() => {
    if (!todayKey || !overdueFrom) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("tasks")
        .select(TASK_COLUMNS)
        .gte("day", overdueFrom)
        .lt("day", todayKey)
        .eq("done", false)
        .eq("skipped", false)
        .is("recurring_id", null);
      if (cancelled) return;
      if (error) return console.error("Loading unfinished tasks failed", error);
      setTasks((prev) => {
        const fetched = new Set((data as Task[]).map((t) => t.id));
        return [...prev.filter((t) => !fetched.has(t.id)), ...(data as Task[])];
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [todayKey, overdueFrom]);

  const visible = tasks.filter((t) => !t.skipped);

  const tasksOn = (day: string) =>
    visible.filter((t) => t.day === day).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const isDayCompleted = (day: string) => {
    const onDay = visible.filter((t) => t.day === day);
    return onDay.length > 0 && onDay.every((t) => t.done);
  };

  const overdue =
    todayKey && overdueFrom
      ? visible
          .filter((t) => !t.done && !t.recurring_id && t.day < todayKey && t.day >= overdueFrom)
          .sort((a, b) => a.day.localeCompare(b.day))
      : [];

  /** Optimistically change a task, and put it back if saving fails. */
  const update = async (id: string, changes: Partial<Pick<Task, "done" | "day" | "skipped">>) => {
    const before = tasks.find((t) => t.id === id);
    if (!before) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

    const { error } = await createClient().from("tasks").update(changes).eq("id", id);
    if (error) {
      console.error("Updating task failed", error);
      setTasks((prev) => prev.map((t) => (t.id === id ? before : t)));
    }
  };

  const toggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await update(id, { done: !task.done });
    // The database moves the linked goal forward; confetti when that finished it.
    if (task.goal_id && !task.done) {
      const { data } = await createClient().from("goals").select("current, target").eq("id", task.goal_id).maybeSingle();
      if (data && data.current >= data.target) celebrateOnce(`goal:${task.goal_id}`);
    }
  };

  const move = (id: string, day: string) => void update(id, { day });

  const moveOverdueToToday = async () => {
    if (!todayKey || overdue.length === 0) return;
    const ids = new Set(overdue.map((t) => t.id));
    const before = tasks;
    setTasks((prev) => prev.map((t) => (ids.has(t.id) ? { ...t, day: todayKey } : t)));

    const { error } = await createClient().from("tasks").update({ day: todayKey }).in("id", [...ids]);
    if (error) {
      console.error("Moving tasks failed", error);
      setTasks(before);
    }
  };

  const add = async (title: string, day: string, goalId: string | null = null) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      done: false,
      day,
      created_at: new Date().toISOString(),
      recurring_id: null,
      skipped: false,
      goal_id: goalId,
    };
    setTasks((prev) => [...prev, task]);

    const { error } = await createClient().from("tasks").insert(task);
    if (error) {
      console.error("Adding task failed", error);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
  };

  const addRecurring = async (
    title: string,
    repeat: NonNullable<Repeat>,
    startDay: string,
    goalId: string | null = null,
  ) => {
    const rule: RecurringRule = {
      id: crypto.randomUUID(),
      title,
      kind: repeat.kind,
      weekdays: repeat.kind === "weekly" ? repeat.weekdays : [],
      month_day: repeat.kind === "monthly" ? repeat.monthDay : null,
      start_date: startDay,
      goal_id: goalId,
    };
    const { error } = await createClient().from("recurring_tasks").insert(rule);
    if (error) return console.error("Adding recurring task failed", error);

    const previous = loadRules();
    rules.current = previous.then((list) => [...list, rule]);
    // Fill in every range that's already on screen.
    for (const [from, to] of ranges.current) await materialize([rule], from, to, []);
  };

  const stopRepeating = async (ruleId: string) => {
    if (!todayKey) return;
    const upcoming = (t: Task) => t.recurring_id === ruleId && t.day > todayKey && !t.done;
    setTasks((prev) => prev.filter((t) => !upcoming(t)).map((t) => (t.recurring_id === ruleId ? { ...t, recurring_id: null } : t)));
    rules.current = loadRules().then((list) => list.filter((r) => r.id !== ruleId));

    const supabase = createClient();
    const { error: tasksError } = await supabase
      .from("tasks")
      .delete()
      .eq("recurring_id", ruleId)
      .gt("day", todayKey)
      .eq("done", false);
    if (tasksError) console.error("Removing upcoming tasks failed", tasksError);
    // Past tasks keep existing as normal tasks (recurring_id becomes null).
    const { error } = await supabase.from("recurring_tasks").delete().eq("id", ruleId);
    if (error) console.error("Stopping recurring task failed", error);
  };

  const remove = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    // A recurring task is skipped, so the rule doesn't create it again.
    if (task.recurring_id) return update(id, { skipped: true });

    const before = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await createClient().from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Deleting task failed", error);
      setTasks(before);
    }
  };

  return (
    <TasksContext
      value={{
        tasksOn,
        isDayCompleted,
        ensureRange,
        isLoaded: (from, to) => loadedRanges.has(rangeKey(from, to)),
        overdue,
        moveOverdueToToday,
        toggle,
        add,
        addRecurring,
        stopRepeating,
        move,
        remove,
      }}
    >
      {children}
    </TasksContext>
  );
}

export function useTasks(): TasksContextValue {
  const value = use(TasksContext);
  if (!value) throw new Error("useTasks must be used inside <TasksProvider>");
  return value;
}
