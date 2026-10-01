"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CigaretteOff, PartyPopper } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { useLongPress } from "@/hooks/use-long-press";
import { celebrate, celebrateOnce } from "@/lib/celebrate";
import { daysBetween, fromDateKey, toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { milestoneOn, nextMilestoneText } from "../milestones";
import { euros, moneySaved } from "../savings";
import { useSmokeFreeSince } from "../use-smoke-free-since";
import { QuitDateSheet } from "./quit-date-sheet";
import { SmokeFreeSheet } from "./smoke-free-sheet";

export function SmokeFreeCard({ today }: { today: Date }) {
  const { since, cost, loaded, setSince, setCost } = useSmokeFreeSince();
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState(false);

  // The quit day itself counts as day 1.
  const days = since ? daysBetween(fromDateKey(since), today) + 1 : 0;
  const milestone = since ? milestoneOn(days) : null;
  const next = nextMilestoneText(days);

  // Confetti the first time the app opens on a milestone day.
  useEffect(() => {
    if (since && milestone) celebrateOnce(`smoke-free:${since}:${days}`);
  }, [since, milestone, days]);

  // Tap: details (with confetti on a milestone day), or set the date if missing. Hold: change the date.
  const press = useLongPress(
    () => setEditing(true),
    () => {
      if (!since) return setEditing(true);
      if (milestone) void celebrate();
      setDetails(true);
    },
  );

  if (!loaded) return <div className="rounded-2xl bg-card" />;

  const Icon = milestone ? PartyPopper : CigaretteOff;

  return (
    <>
      <motion.button
        type="button"
        {...press}
        whileTap={{ scale: 0.97 }}
        aria-label={since ? `${days} days smoke-free. Tap for details, hold to change the date` : "Set your first smoke-free day"}
        className={cn(
          "relative block w-full touch-manipulation rounded-2xl bg-card px-4 py-4 text-left select-none [-webkit-touch-callout:none]",
          milestone && "ring-1 ring-emerald-400/60",
        )}
      >
        <Icon className={cn("absolute top-4 right-4 size-5", milestone ? "text-emerald-400" : "text-muted-foreground")} />
        {since ? (
          <>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">
              <CountUp value={days} />
            </p>
            <p className="mt-1 text-sm">{days === 1 ? "day" : "days"} smoke-free</p>
            {milestone ? (
              <p className="mt-1 text-xs text-emerald-400">{milestone}. Well done!</p>
            ) : cost ? (
              <p className="mt-1 text-xs text-muted-foreground">{euros.format(moneySaved(days, cost))} saved</p>
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
      </motion.button>

      {since && (
        <SmokeFreeSheet
          key={cost ? "cost" : "no-cost"}
          open={details}
          since={since}
          days={days}
          cost={cost}
          onSaveCost={(next) => {
            void setCost(next);
            setDetails(false);
          }}
          onChangeDate={() => {
            setDetails(false);
            setEditing(true);
          }}
          onClose={() => setDetails(false)}
        />
      )}
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
