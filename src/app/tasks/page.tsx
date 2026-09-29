import { Suspense } from "react";
import { TasksView } from "@/features/planning/components/tasks-view";

export default function TasksPage() {
  return (
    <Suspense>
      <TasksView />
    </Suspense>
  );
}
