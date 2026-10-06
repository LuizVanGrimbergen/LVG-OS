"use client";

import { useState } from "react";
import { AddButton } from "@/components/layout/add-button";
import { DeleteSheet } from "@/components/layout/delete-sheet";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonRows } from "@/components/layout/skeleton-rows";
import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import { useTodayKey } from "@/hooks/use-today";
import { WEEKLY_RUNS, km, weekSummary } from "../runs";
import type { Run } from "../types";
import { useRuns } from "../use-runs";
import { AddRunSheet } from "./add-run-sheet";
import { RunRow } from "./run-row";

export function RunsView() {
  const todayKey = useTodayKey();
  const { runs, loaded, add, remove } = useRuns();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Run | null>(null);
  const week = todayKey ? weekSummary(runs, todayKey) : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Runs" action={<AddButton label="New run" onClick={() => setAdding(true)} />} />

      {loaded && week && (
        <p className="text-sm text-muted-foreground tabular-nums">
          This week <span className="text-foreground">{week.count}/{WEEKLY_RUNS}</span>
          {week.count > 0 && ` · ${km(week.km)}`}
        </p>
      )}

      {!loaded && <SkeletonRows lines={2} />}
      {loaded && runs.length === 0 && <p className="py-4 text-sm text-muted-foreground">Add a run with the +.</p>}

      <AnimatedList className="divide-y divide-border">
        {runs.map((run) => (
          <AnimatedListItem key={run.id}>
            <RunRow run={run} onOptions={setSelected} />
          </AnimatedListItem>
        ))}
      </AnimatedList>

      {todayKey && <AddRunSheet open={adding} today={todayKey} onClose={() => setAdding(false)} onAdd={add} />}
      <DeleteSheet
        item={selected && { id: selected.id, title: `${km(selected.distance_km)} run` }}
        label="Delete run"
        onDelete={remove}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
