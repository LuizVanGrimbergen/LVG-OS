import { Plane } from "lucide-react";
import { daysBetween, fromDateKey } from "@/lib/date";

const TRIP = { label: "to Australia", date: "2026-11-07" };

/** Days left until the trip. */
export function CountdownCard({ today }: { today: Date }) {
  const days = Math.max(0, daysBetween(today, fromDateKey(TRIP.date)));

  return (
    <div className="relative rounded-2xl bg-card px-4 py-4">
      <Plane className="absolute top-4 right-4 size-5 text-muted-foreground" />
      <p className="text-4xl font-semibold tracking-tight tabular-nums">{days}</p>
      <p className="mt-1 text-sm">{days === 0 ? "Fly today!" : `${days === 1 ? "day" : "days"} ${TRIP.label}`}</p>
      <p className="mt-1 text-xs text-muted-foreground">7 November</p>
    </div>
  );
}
