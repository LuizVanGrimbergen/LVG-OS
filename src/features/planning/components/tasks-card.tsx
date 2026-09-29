"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ListChecks } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import type { Task } from "../types";

export function TasksCard({ tasks, loaded }: { tasks: Task[]; loaded: boolean }) {
  const done = tasks.filter((t) => t.done).length;
  const left = tasks.length - done;
  const status = !loaded ? " " : tasks.length === 0 ? "Nothing planned" : left === 0 ? "All done" : `${left} to go`;

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Link href="/tasks" className="relative block h-full rounded-2xl bg-card px-4 py-4 transition-colors active:bg-muted">
        <ListChecks className="absolute top-4 right-4 size-5 text-muted-foreground" />
        <p className="text-4xl font-semibold tracking-tight tabular-nums">
          {loaded ? <CountUp value={done} /> : "–"}
          {loaded && <span className="text-2xl text-muted-foreground">/{tasks.length}</span>}
        </p>
        <p className="mt-1 text-sm">tasks done</p>
        <p className="mt-1 text-xs text-muted-foreground">{status}</p>
      </Link>
    </motion.div>
  );
}
