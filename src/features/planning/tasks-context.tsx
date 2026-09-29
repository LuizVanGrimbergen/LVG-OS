"use client";

import { createContext, use, useCallback, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "./types";

type TasksContextValue = {
  /** Tasks planned for a day ("YYYY-MM-DD"), oldest first. */
  tasksOn: (day: string) => Task[];
  /** Whether every task planned for that day is done (false if none). */
  isDayCompleted: (day: string) => boolean;
  /** Load the tasks between two days (inclusive), once. */
  ensureRange: (from: string, to: string) => void;
  isLoaded: (from: string, to: string) => boolean;
  toggle: (id: string) => void;
  add: (title: string, day: string) => void;
  move: (id: string, day: string) => void;
  remove: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

const rangeKey = (from: string, to: string) => `${from}|${to}`;

/** Tasks from Supabase, loaded per visible range and shared between Home and Tasks. */
export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadedRanges, setLoadedRanges] = useState<Set<string>>(() => new Set());
  const requested = useRef(new Set<string>());

  const ensureRange = useCallback(async (from: string, to: string) => {
    const key = rangeKey(from, to);
    if (requested.current.has(key)) return;
    requested.current.add(key);

    const { data, error } = await createClient()
      .from("tasks")
      .select("id, title, done, day, created_at")
      .gte("day", from)
      .lte("day", to);
    if (error) {
      console.error("Loading tasks failed", error);
      requested.current.delete(key);
      return;
    }
    // Merge by id: the fetched rows win, tasks outside the range stay.
    setTasks((prev) => {
      const fetched = new Map(data.map((t) => [t.id, t]));
      return [...prev.filter((t) => !fetched.has(t.id)), ...data];
    });
    setLoadedRanges((prev) => new Set(prev).add(key));
  }, []);

  const tasksOn = (day: string) =>
    tasks.filter((t) => t.day === day).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const isDayCompleted = (day: string) => {
    const onDay = tasks.filter((t) => t.day === day);
    return onDay.length > 0 && onDay.every((t) => t.done);
  };

  /** Optimistically change a task, and put it back if saving fails. */
  const update = async (id: string, changes: Partial<Pick<Task, "done" | "day">>) => {
    const before = tasks.find((t) => t.id === id);
    if (!before) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

    const { error } = await createClient().from("tasks").update(changes).eq("id", id);
    if (error) {
      console.error("Updating task failed", error);
      setTasks((prev) => prev.map((t) => (t.id === id ? before : t)));
    }
  };

  const toggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) void update(id, { done: !task.done });
  };

  const move = (id: string, day: string) => void update(id, { day });

  const add = async (title: string, day: string) => {
    const task: Task = { id: crypto.randomUUID(), title, done: false, day, created_at: new Date().toISOString() };
    setTasks((prev) => [...prev, task]);

    const { error } = await createClient().from("tasks").insert(task);
    if (error) {
      console.error("Adding task failed", error);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
  };

  const remove = async (id: string) => {
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
        toggle,
        add,
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
