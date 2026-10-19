"use client";

import { useState } from "react";
import { AddButton } from "@/components/layout/add-button";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonRows } from "@/components/layout/skeleton-rows";
import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import { sections } from "../sections";
import type { BucketItem } from "../types";
import { useBucketList } from "../use-bucket-list";
import { AddBucketSheet } from "./add-bucket-sheet";
import { BucketOptionsSheet } from "./bucket-options-sheet";
import { BucketRow } from "./bucket-row";

export function BucketListView() {
  const { items, loaded, toggle, plan, remove, add } = useBucketList();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<BucketItem | null>(null);
  const done = items.filter((i) => i.done).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bucket list"
        action={<AddButton label="New adventure" onClick={() => setAdding(true)} />}
      />

      {loaded && items.length > 0 && (
        <p className="-mt-2 text-sm text-muted-foreground tabular-nums">
          With my godfather · <span className="text-foreground">{done}/{items.length}</span> done
        </p>
      )}

      {!loaded && <SkeletonRows lines={2} />}
      {loaded && items.length === 0 && <p className="py-4 text-sm text-muted-foreground">Add adventures with the +.</p>}

      {sections.map(({ id, label }) => {
        const inSection = items.filter((i) => i.section === id);
        if (inSection.length === 0) return null;
        return (
          <section key={id}>
            <h2 className="text-xs text-muted-foreground">{label}</h2>
            <AnimatedList className="divide-y divide-border">
              {inSection.map((item) => (
                <AnimatedListItem key={item.id}>
                  <BucketRow item={item} onToggle={toggle} onOptions={setSelected} />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </section>
        );
      })}

      <BucketOptionsSheet
        key={selected?.id}
        item={selected}
        onPlan={plan}
        onDelete={remove}
        onClose={() => setSelected(null)}
      />
      <AddBucketSheet open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
