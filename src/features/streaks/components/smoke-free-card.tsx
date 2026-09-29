import { CigaretteOff } from "lucide-react";
import { daysBetween, fromDateKey } from "@/lib/date";
import { mockSmokeFreeSince } from "../mock-data";
import { nextMilestoneText } from "../milestones";

export function SmokeFreeCard({ today }: { today: Date }) {
  // The quit day itself counts as day 1.
  const days = daysBetween(fromDateKey(mockSmokeFreeSince), today) + 1;
  const next = nextMilestoneText(days);

  return (
    <div className="relative rounded-2xl bg-card px-4 py-4">
      <CigaretteOff className="absolute top-4 right-4 size-5 text-muted-foreground" />
      <p className="text-4xl font-semibold tracking-tight tabular-nums">{days}</p>
      <p className="mt-1 text-sm">{days === 1 ? "day" : "days"} smoke-free</p>
      {next && <p className="mt-1 text-xs text-muted-foreground">{next}</p>}
    </div>
  );
}
