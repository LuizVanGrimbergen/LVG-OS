"use client";

import { useEffect, useState } from "react";
import { CigaretteOff, PartyPopper } from "lucide-react";
import { useLongPress } from "@/hooks/use-long-press";
import { celebrate, celebrateOnce } from "@/lib/celebrate";
import { daysBetween, fromDateKey, toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { milestoneOn, nextMilestoneText } from "../milestones";
import { useSmokeFreeSince } from "../use-smoke-free-since";
import { QuitDateSheet } from "./quit-date-sheet";

export function SmokeFreeCard({ today }: { today: Date }) {
  const { since, loaded, setSince } = useSmokeFreeSince();
  const [editing, setEditing] = useState(false);

  // The quit day itself counts as day 1.
  const days = since ? daysBetween(fromDateKey(since), today) + 1 : 0;
  const milestone = since ? milestoneOn(days) : null;
  const next = nextMilestoneText(days);

  // Confetti the first time the app opens on a milestone day.
  useEffect(() => {
    if (since && milestone) celebrateOnce(`smoke-free:${since}:${days}`);
  }, [since, milestone, days]);

  // Tap: confetti on a milestone day (or set the date if missing). Hold: change the date.
  const press = useLongPress(
    () => setEditing(true),
    () => {
      if (!since) setEditing(true);
      else if (milestone) void celebrate();
    },
  );

  if (!loaded) return <div className="rounded-2xl bg-card" />;

  const Icon = milestone ? PartyPopper : CigaretteOff;

  return (
    <>
      <button
        type="button"
        {...press}
        aria-label={since ? `${days} days smoke-free. Hold to change the date` : "Set your first smoke-free day"}
        className={cn(
          "relative block w-full touch-manipulation rounded-2xl bg-card px-4 py-4 text-left select-none [-webkit-touch-callout:none]",
          milestone && "ring-1 ring-emerald-400/60",
        )}
      >
        <Icon className={cn("absolute top-4 right-4 size-5", milestone ? "text-emerald-400" : "text-muted-foreground")} />
        {since ? (
          <>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">{days}</p>
            <p className="mt-1 text-sm">{days === 1 ? "day" : "days"} smoke-free</p>
            {milestone ? (
              <p className="mt-1 text-xs text-emerald-400">{milestone}. Well done!</p>
            ) : (
              next && <p className="mt-1 text-xs text-muted-foreground">{next}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-4xl font-semibold tracking-tight">–</p>
            <p className="mt-1 text-sm">smoke-free</p>
            <p className="mt-1 text-xs text-muted-foreground">Tap to set your quit day</p>
          </>
        )}
      </button>

      <QuitDateSheet
        key={since ?? "none"}
        open={editing}
        value={since}
        today={toDateKey(today)}
        onClose={() => setEditing(false)}
        onSave={setSince}
      />
    </>
  );
}
