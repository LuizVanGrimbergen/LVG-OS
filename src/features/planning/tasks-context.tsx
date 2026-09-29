"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { mockTodayTasks } from "./mock-data";
import type { Task } from "./types";

type TasksContextValue = {
  tasks: Task[];
  toggle: (id: string) => void;
  add: (title: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

/**
 * Shares today's tasks between Home (week strip, summary) and Tasks.
 * In-memory for now; Supabase will replace this.
 */
export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState(mockTodayTasks);

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const add = (title: string) =>
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title, done: false }]);

  return <TasksContext value={{ tasks, toggle, add }}>{children}</TasksContext>;
}

export function useTasks(): TasksContextValue {
  const value = use(TasksContext);
  if (!value) throw new Error("useTasks must be used inside <TasksProvider>");
  return value;
}
