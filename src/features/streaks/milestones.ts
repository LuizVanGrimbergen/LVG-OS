const milestones = [
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 30, label: "1 month" },
  { days: 60, label: "2 months" },
  { days: 90, label: "3 months" },
  { days: 180, label: "6 months" },
  { days: 365, label: "1 year" },
];

/** Short line about the next milestone, e.g. "1 week tomorrow". */
export function nextMilestoneText(days: number): string | null {
  const next = milestones.find((m) => m.days > days);
  if (!next) return null;
  const left = next.days - days;
  return left === 1 ? `${next.label} tomorrow` : `${left} days to ${next.label}`;
}

/** The milestone reached exactly on this day, e.g. "1 week" on day 7. */
export function milestoneOn(days: number): string | null {
  return milestones.find((m) => m.days === days)?.label ?? null;
}
