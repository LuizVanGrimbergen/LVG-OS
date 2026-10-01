const HOUR = 1;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** What roughly happens in your body after quitting, based on the NHS timeline. */
export const HEALTH_TIMELINE: { after: number; label: string; text: string }[] = [
  { after: 20 / 60, label: "20 minutes", text: "Your pulse and blood pressure start to settle." },
  { after: 8 * HOUR, label: "8 hours", text: "Oxygen levels recover and carbon monoxide in your blood halves." },
  { after: 2 * DAY, label: "2 days", text: "Carbon monoxide is gone. Taste and smell start to improve." },
  { after: 3 * DAY, label: "3 days", text: "Breathing feels easier and you have more energy." },
  { after: 2 * WEEK, label: "2 weeks", text: "Your circulation starts to improve." },
  { after: 3 * MONTH, label: "3 months", text: "Coughing and wheezing ease as your lungs work better." },
  { after: 9 * MONTH, label: "9 months", text: "Lung function is up to 10% better than when you smoked." },
  { after: YEAR, label: "1 year", text: "Your risk of a heart attack is about half a smoker's." },
  { after: 10 * YEAR, label: "10 years", text: "Your risk of lung cancer is about half a smoker's." },
];

/** Hours since the start of the quit day. */
export function hoursSince(quitDay: Date, now: Date): number {
  return Math.max(0, (now.getTime() - quitDay.getTime()) / 3_600_000);
}

/** How far you are towards a step, 0 … 1. */
export function stepProgress(after: number, hours: number): number {
  return Math.min(1, hours / after);
}
