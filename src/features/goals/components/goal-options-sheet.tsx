"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Goal } from "../types";

type GoalOptionsSheetProps = {
  goal: Goal | null;
  /** Add the picked steps as tasks for this goal. */
  onAddSteps: (goal: Goal, steps: string[]) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const big = "h-12 w-full rounded-xl text-base";

type Plan = { status: "idle" } | { status: "loading" } | { status: "error"; message: string } | { status: "ready"; steps: string[] };

/** Opened by holding a goal: let the coach suggest first tasks, or delete it. */
export function GoalOptionsSheet({ goal, onAddSteps, onDelete, onClose }: GoalOptionsSheetProps) {
  const [plan, setPlan] = useState<Plan>({ status: "idle" });
  const [picked, setPicked] = useState<Set<number>>(() => new Set());

  const close = () => {
    setPlan({ status: "idle" });
    onClose();
  };

  const suggest = async () => {
    if (!goal) return;
    setPlan({ status: "loading" });
    try {
      const res = await fetch("/api/coach/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: goal.id }),
      });
      const body = (await res.json()) as { steps?: string[]; error?: string };
      if (!res.ok || !body.steps?.length) throw new Error(body.error ?? "No suggestions this time.");
      setPlan({ status: "ready", steps: body.steps });
      setPicked(new Set(body.steps.map((_, i) => i)));
    } catch (e) {
      setPlan({ status: "error", message: e instanceof Error ? e.message : "Something went wrong." });
    }
  };

  const togglePick = (i: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <BottomSheet
      open={goal !== null}
      title={goal?.title ?? ""}
      onClose={close}
      onSubmit={(e) => {
        e.preventDefault();
        if (!goal) return;
        if (plan.status === "ready") {
          onAddSteps(
            goal,
            plan.steps.filter((_, i) => picked.has(i)),
          );
        } else {
          onDelete(goal.id);
        }
        close();
      }}
    >
      {plan.status === "ready" ? (
        <>
          <p className="text-sm text-muted-foreground">Pick the steps to plan, one per day from today.</p>
          <div className="space-y-1">
            {plan.steps.map((step, i) => (
              <button
                key={i}
                type="button"
                role="checkbox"
                aria-checked={picked.has(i)}
                onClick={() => togglePick(i)}
                className="flex w-full items-center gap-3 py-2 text-left text-[15px]"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    picked.has(i) ? "border-foreground bg-foreground text-background" : "border-foreground/40",
                  )}
                >
                  {picked.has(i) && <Check className="size-3" strokeWidth={3} />}
                </span>
                {step}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Button type="submit" size="lg" disabled={picked.size === 0} className={big}>
              Add {picked.size} {picked.size === 1 ? "task" : "tasks"}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={close} className={big}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={suggest}
            disabled={plan.status === "loading"}
            className={big}
          >
            <Sparkles className="size-4" />
            {plan.status === "loading" ? "Thinking…" : "Plan first steps with the coach"}
          </Button>
          {plan.status === "error" && <p className="text-sm text-destructive">{plan.message}</p>}
          <Button type="submit" variant="destructive" size="lg" className={big}>
            Delete goal
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={close} className={big}>
            Cancel
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}
