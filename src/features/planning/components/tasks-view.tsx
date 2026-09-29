"use client";

import { useState } from "react";
import { AddButton } from "@/components/layout/add-button";
import { DeleteSheet } from "@/components/layout/delete-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { useTasks } from "../tasks-context";
import type { Task } from "../types";
import { AddTaskSheet } from "./add-task-sheet";
import { FocusList } from "./focus-list";

export function TasksView() {
  const { tasks, loaded, toggle, add, remove } = useTasks();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader title="Tasks" action={<AddButton label="New task" onClick={() => setAdding(true)} />} />
      {!loaded ? null : tasks.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">Add tasks with the +.</p>
      ) : (
        <FocusList tasks={tasks} onToggle={toggle} onOptions={setSelected} />
      )}
      <DeleteSheet item={selected} label="Delete task" onDelete={remove} onClose={() => setSelected(null)} />
      <AddTaskSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
