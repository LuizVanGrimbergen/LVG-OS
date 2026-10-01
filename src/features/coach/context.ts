import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { TIME_ZONE } from "@/features/reminders/config";
import { currentStreak } from "@/features/habits/streaks";
import { euros, moneySaved } from "@/features/streaks/savings";
import { MOOD_LABELS } from "@/features/reflection/mood";
import { addDays, daysBetween, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";

type Supabase = Awaited<ReturnType<typeof createClient>>;

const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const HABIT_HISTORY_DAYS = 60;

/** Today's date in the app's time zone, as "YYYY-MM-DD". */
export function localToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/** Monday of the current week, as "YYYY-MM-DD". */
export function currentWeekStart(today = localToday()): string {
  return toDateKey(startOfWeek(fromDateKey(today)));
}

/**
 * Everything the coach knows about the last 7 days, as plain text.
 * Read with the user's own session, so row level security applies.
 */
export async function weekContext(supabase: Supabase, today = localToday()): Promise<string> {
  const from = toDateKey(addDays(fromDateKey(today), -6));
  const habitsFrom = toDateKey(addDays(fromDateKey(today), -HABIT_HISTORY_DAYS));

  const [tasksRes, goalsRes, dailyRes, settingsRes, habitsRes, logsRes, notesRes] = await Promise.all([
    supabase.from("tasks").select("day, title, done, skipped").gte("day", from).lte("day", today).order("day"),
    supabase.from("goals").select("title, category, kind, current, target").order("created_at"),
    supabase.from("daily_notes").select("day, intention, reflection, mood").gte("day", from).lte("day", today).order("day"),
    supabase.from("settings").select("smoke_free_since, cigarettes_per_day, pack_price, pack_size").maybeSingle(),
    supabase.from("habits").select("id, name").order("created_at"),
    supabase.from("habit_logs").select("habit_id, day").gte("day", habitsFrom),
    supabase
      .from("notes")
      .select("body, created_at")
      .gte("created_at", `${from}T00:00:00Z`)
      .order("created_at")
      .limit(30),
  ]);

  const lines: string[] = [`Period: ${dayLabel.format(fromDateKey(from))} – ${dayLabel.format(fromDateKey(today))}`];

  const settings = settingsRes.data;
  if (settings?.smoke_free_since) {
    const days = daysBetween(fromDateKey(settings.smoke_free_since), fromDateKey(today)) + 1;
    let line = `Smoke-free: ${days} days (quit day ${settings.smoke_free_since})`;
    if (settings.cigarettes_per_day && settings.pack_price) {
      const saved = moneySaved(days, {
        cigarettesPerDay: settings.cigarettes_per_day,
        packPrice: Number(settings.pack_price),
        packSize: settings.pack_size,
      });
      line += `, about ${euros.format(saved)} saved`;
    }
    lines.push(line);
  }

  lines.push("", "Tasks per day:");
  const tasks = (tasksRes.data ?? []).filter((t) => !t.skipped);
  if (tasks.length === 0) lines.push("- none planned");
  for (let d = fromDateKey(from); toDateKey(d) <= today; d = addDays(d, 1)) {
    const key = toDateKey(d);
    const onDay = tasks.filter((t) => t.day === key);
    if (onDay.length === 0) continue;
    const done = onDay.filter((t) => t.done).length;
    const list = onDay.map((t) => `${t.done ? "[x]" : "[ ]"} ${t.title}`).join("; ");
    lines.push(`- ${dayLabel.format(d)}: ${done}/${onDay.length} done. ${list}`);
  }

  lines.push("", "Goals (current progress):");
  const goals = goalsRes.data ?? [];
  if (goals.length === 0) lines.push("- none");
  for (const g of goals) {
    const value = g.kind === "percent" ? `${g.current}%` : `${g.current}/${g.target}`;
    lines.push(`- [${g.category}] ${g.title}: ${value}`);
  }

  lines.push("", "Daily habits (days done in this period, current streak):");
  const habits = habitsRes.data ?? [];
  if (habits.length === 0) lines.push("- none");
  for (const h of habits) {
    const days = new Set((logsRes.data ?? []).filter((l) => l.habit_id === h.id).map((l) => l.day));
    const thisWeek = [...days].filter((d) => d >= from && d <= today).length;
    lines.push(`- ${h.name}: ${thisWeek}/7 days, streak ${currentStreak(days, today)}`);
  }

  lines.push("", "Morning intentions, evening check-ins and mood (1 rough … 5 great):");
  const daily = dailyRes.data ?? [];
  if (daily.length === 0) lines.push("- none written");
  for (const n of daily) {
    const parts = [
      n.intention && `intention: "${n.intention}"`,
      n.reflection && `went well: "${n.reflection}"`,
      n.mood && `mood ${n.mood} (${MOOD_LABELS[n.mood - 1]})`,
    ];
    lines.push(`- ${dayLabel.format(fromDateKey(n.day))}: ${parts.filter(Boolean).join(", ")}`);
  }

  const notes = notesRes.data ?? [];
  if (notes.length > 0) {
    lines.push("", "Thoughts captured in quick notes:");
    for (const n of notes) lines.push(`- ${dayLabel.format(new Date(n.created_at))}: "${n.body}"`);
  }

  return lines.join("\n");
}
