"use client";

import { useState } from "react";
import { Check, PiggyBank } from "lucide-react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { fromDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { HEALTH_TIMELINE, hoursSince, stepProgress } from "../health";
import { cigarettesAvoided, euros, moneySaved, type SmokingCost } from "../savings";

type SmokeFreeSheetProps = {
  open: boolean;
  since: string;
  days: number;
  cost: SmokingCost | null;
  onSaveCost: (cost: SmokingCost) => void;
  onChangeDate: () => void;
  onClose: () => void;
};

const field =
  "h-10 w-24 rounded-xl border border-input bg-transparent px-3 text-right text-base text-foreground outline-none focus:border-ring";

/** Tap the smoke-free card: money saved, what's happening in your body, and what smoking cost. */
export function SmokeFreeSheet({ open, since, days, cost, onSaveCost, onChangeDate, onClose }: SmokeFreeSheetProps) {
  const [perDay, setPerDay] = useState(String(cost?.cigarettesPerDay ?? ""));
  const [price, setPrice] = useState(cost ? String(cost.packPrice) : "");
  const [packSize, setPackSize] = useState(String(cost?.packSize ?? 20));
  const [error, setError] = useState("");
  const hours = hoursSince(fromDateKey(since), new Date());

  return (
    <BottomSheet
      open={open}
      title={`${days} ${days === 1 ? "day" : "days"} smoke-free`}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        const next = { cigarettesPerDay: Number(perDay), packPrice: Number(price.replace(",", ".")), packSize: Number(packSize) };
        if (!Number.isInteger(next.cigarettesPerDay) || next.cigarettesPerDay < 1) return setError("How many a day, at least 1?");
        if (!(next.packPrice > 0)) return setError("What did a pack cost?");
        if (!Number.isInteger(next.packSize) || next.packSize < 1) return setError("How many in a pack?");
        setError("");
        onSaveCost(next);
      }}
    >
      {cost && (
        <div className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-3">
          <PiggyBank className="size-6 shrink-0 text-emerald-400" />
          <div>
            <p className="text-2xl font-semibold tabular-nums">{euros.format(moneySaved(days, cost))}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              saved · {cigarettesAvoided(days, cost).toLocaleString("en-GB")} cigarettes not smoked
            </p>
          </div>
        </div>
      )}

      <section>
        <h3 className="text-xs text-muted-foreground">Your body since you quit</h3>
        <ol className="mt-2 space-y-3">
          {HEALTH_TIMELINE.map((step) => {
            const progress = stepProgress(step.after, hours);
            const reached = progress >= 1;
            return (
              <li key={step.label} className="flex gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    reached ? "border-emerald-400 bg-emerald-400 text-background" : "border-foreground/30",
                  )}
                >
                  {reached && <Check className="size-3" strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[15px]", !reached && "text-muted-foreground")}>{step.text}</p>
                  <p className="text-xs text-muted-foreground">After {step.label}</p>
                  {!reached && (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${progress * 100}%` }} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">Rough averages from the NHS; everyone is different.</p>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs text-muted-foreground">What smoking cost you</h3>
        <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          Cigarettes a day
          <input type="number" inputMode="numeric" min={1} value={perDay} onChange={(e) => setPerDay(e.target.value)} className={field} />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          Price of a pack (€)
          <input type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          Cigarettes in a pack
          <input type="number" inputMode="numeric" min={1} value={packSize} onChange={(e) => setPackSize(e.target.value)} className={field} />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      <div className="space-y-2">
        <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
          Save
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onChangeDate} className="h-12 w-full rounded-xl text-base">
          Change quit day
        </Button>
      </div>
    </BottomSheet>
  );
}
