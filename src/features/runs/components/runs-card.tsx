"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Footprints } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { WEEKLY_RUNS, km, weekSummary } from "../runs";
import { useRuns } from "../use-runs";

/** This week's runs on Home; tap to open Runs. */
export function RunsCard({ today }: { today: string }) {
  const { runs, loaded } = useRuns();
  const week = weekSummary(runs, today);

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Link href="/runs" className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 transition-colors active:bg-muted">
        <p className="text-sm tabular-nums">
          <span className="text-2xl font-semibold tracking-tight">{loaded ? <CountUp value={week.count} /> : "–"}</span>
          <span className="text-muted-foreground">/{WEEKLY_RUNS}</span>
          <span className="ml-2">runs this week</span>
          {loaded && week.count > 0 && <span className="text-muted-foreground"> · {km(week.km)}</span>}
        </p>
        <Footprints className="size-5 text-muted-foreground" />
      </Link>
    </motion.div>
  );
}
