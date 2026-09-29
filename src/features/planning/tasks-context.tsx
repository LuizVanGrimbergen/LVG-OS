"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { useTodayKey } from "@/hooks/use-today";
import { addDays, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "./types";

type TasksContextValue = {
  /** Today's tasks. */
  tasks: Task[];
  loaded: boolean;
  /** Whether every task planned for that day is done (false if none). */
  isDayCompleted: (dayKey: string) => boolean;
  toggle: (id: string) => void;
  add: (title: string) => void;
  remove: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

/** Loads this week's tasks from Supabase and shares them between Home and Tasks. */
export function TasksProvider({ children }: { children: ReactNode }) {
  const todayKey = useTodayKey();
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!todayKey) return;
    const monday = startOfWeek(fromDateKey(todayKey));
    let cancelled = false;

    (async () => {
      const { data, error } = await createClient()
        .from("tasks")
        .select("id, title, done, day")
        .gte("day", toDateKey(monday))
        .lte("day", toDateKey(addDays(monday, 6)))
        .order("created_at");
      if (cancelled) return;
      if (error) console.error("Loading tasks failed", error);
      setWeekTasks(data ?? []);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [todayKey]);

  const tasks = weekTasks.filter((t) => t.day === todayKey);

  const isDayCompleted = (dayKey: string) => {
    const onDay = weekTasks.filter((t) => t.day === dayKey);
    return onDay.length > 0 && onDay.every((t) => t.done);
  };

  const toggle = async (id: string) => {
    const task = weekTasks.find((t) => t.id === id);
    if (!task) return;
    const done = !task.done;
    setWeekTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));

    const { error } = await createClient().from("tasks").update({ done }).eq("id", id);
    if (error) {
      console.error("Updating task failed", error);
      setWeekTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: task.done } : t)));
    }
  };

  const add = async (title: string) => {
    if (!todayKey) return;
    const task: Task = { id: crypto.randomUUID(), title, done: false, day: todayKey };
    setWeekTasks((prev) => [...prev, task]);

    const { error } = await createClient().from("tasks").insert(task);
    if (error) {
      console.error("Adding task failed", error);
      setWeekTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
  };

  const remove = async (id: string) => {
    const before = weekTasks;
    setWeekTasks((prev) => prev.filter((t) => t.id !== id));

    const { error } = await createClient().from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Deleting task failed", error);
      setWeekTasks(before);
    }
  };

  return (
    <TasksContext value={{ tasks, loaded, isDayCompleted, toggle, add, remove }}>{children}</TasksContext>
  );
}

export function useTasks(): TasksContextValue {
  const value = use(TasksContext);
  if (!value) throw new Error("useTasks must be used inside <TasksProvider>");
  return value;
}
