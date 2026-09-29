"use client";

import { useState } from "react";
import { AddButton } from "@/components/layout/add-button";
import { PageHeader } from "@/components/layout/page-header";
import { useTasks } from "../tasks-context";
import { AddTaskSheet } from "./add-task-sheet";
import { FocusList } from "./focus-list";

export function TasksView() {
  const { tasks, toggle, add } = useTasks();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader title="Tasks" action={<AddButton label="New task" onClick={() => setAdding(true)} />} />
      {tasks.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">Add tasks with the +.</p>
      ) : (
        <FocusList tasks={tasks} onToggle={toggle} />
      )}
      <AddTaskSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
