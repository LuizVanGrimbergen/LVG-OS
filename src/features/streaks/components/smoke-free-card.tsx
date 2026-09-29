"use client";

import { useEffect } from "react";
import { CigaretteOff, PartyPopper } from "lucide-react";
import { celebrate, celebrateOnce } from "@/lib/celebrate";
import { daysBetween, fromDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { mockSmokeFreeSince } from "../mock-data";
import { milestoneOn, nextMilestoneText } from "../milestones";

export function SmokeFreeCard({ today }: { today: Date }) {
  // The quit day itself counts as day 1.
  const days = daysBetween(fromDateKey(mockSmokeFreeSince), today) + 1;
  const milestone = milestoneOn(days);
  const next = nextMilestoneText(days);

  // Confetti the first time the app opens on a milestone day.
  useEffect(() => {
    if (milestone) celebrateOnce(`smoke-free:${mockSmokeFreeSince}:${days}`);
  }, [milestone, days]);

  const Icon = milestone ? PartyPopper : CigaretteOff;

  return (
    <button
      type="button"
      onClick={milestone ? () => void celebrate() : undefined}
      disabled={!milestone}
      className={cn(
        "relative block w-full rounded-2xl bg-card px-4 py-4 text-left disabled:cursor-default",
        milestone && "ring-1 ring-emerald-400/60",
      )}
    >
      <Icon className={cn("absolute top-4 right-4 size-5", milestone ? "text-emerald-400" : "text-muted-foreground")} />
      <p className="text-4xl font-semibold tracking-tight tabular-nums">{days}</p>
      <p className="mt-1 text-sm">{days === 1 ? "day" : "days"} smoke-free</p>
      {milestone ? (
        <p className="mt-1 text-xs text-emerald-400">{milestone}. Well done!</p>
      ) : (
        next && <p className="mt-1 text-xs text-muted-foreground">{next}</p>
      )}
    </button>
  );
}
