import Anthropic from "@anthropic-ai/sdk";
import { COACH_SYSTEM_PROMPT } from "@/features/coach/prompt";
import { TIME_ZONE } from "@/features/reminders/config";
import { addDays, daysBetween, fromDateKey, startOfWeek, toDateKey } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

// Writing the review can take a little while.
export const maxDuration = 60;

const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** Today's date in the app's time zone, as "YYYY-MM-DD". */
function localToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/**
 * Writes a weekly review of the last 7 days with Claude and stores it for this week.
 * Only for the signed-in user; their data is read with their own session (row level security).
 */
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "The coach isn't set up yet (ANTHROPIC_API_KEY is missing)." }, { status: 500 });
  }

  const today = localToday();
  const from = toDateKey(addDays(fromDateKey(today), -6));
  const weekStart = toDateKey(startOfWeek(fromDateKey(today)));

  const [tasksRes, goalsRes, notesRes, settingsRes] = await Promise.all([
    supabase.from("tasks").select("day, title, done").gte("day", from).lte("day", today).order("day"),
    supabase.from("goals").select("title, category, kind, current, target").order("created_at"),
    supabase.from("daily_notes").select("day, intention, reflection").gte("day", from).lte("day", today).order("day"),
    supabase.from("settings").select("smoke_free_since").maybeSingle(),
  ]);

  const lines: string[] = [`Period: ${dayLabel.format(fromDateKey(from))} – ${dayLabel.format(fromDateKey(today))}`];

  const since = settingsRes.data?.smoke_free_since;
  if (since) {
    const days = daysBetween(fromDateKey(since), fromDateKey(today)) + 1;
    lines.push(`Smoke-free: ${days} days (quit day ${since})`);
  }

  lines.push("", "Tasks per day:");
  const tasks = tasksRes.data ?? [];
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

  lines.push("", "Morning intentions and evening check-ins:");
  const notes = notesRes.data ?? [];
  if (notes.length === 0) lines.push("- none written");
  for (const n of notes) {
    const parts = [n.intention && `intention: "${n.intention}"`, n.reflection && `went well: "${n.reflection}"`];
    lines.push(`- ${dayLabel.format(fromDateKey(n.day))}: ${parts.filter(Boolean).join(", ")}`);
  }

  const client = new Anthropic();
  let content: string;
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // If the model declines, the API retries on a suitable fallback model in the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: COACH_SYSTEM_PROMPT,
      messages: [{ role: "user", content: lines.join("\n") }],
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ error: "The coach couldn't write a review this time. Try again later." }, { status: 502 });
    }
    content = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
  } catch (error) {
    console.error("Coach review failed", error);
    const message =
      error instanceof Anthropic.AuthenticationError
        ? "The coach's API key is invalid."
        : error instanceof Anthropic.RateLimitError
          ? "The coach is busy. Try again in a minute."
          : "The coach couldn't be reached. Try again later.";
    return Response.json({ error: message }, { status: 502 });
  }

  if (!content) return Response.json({ error: "The coach returned an empty review." }, { status: 502 });

  const { error } = await supabase
    .from("weekly_reviews")
    .upsert({ week_start: weekStart, content, created_at: new Date().toISOString() }, { onConflict: "user_id,week_start" });
  if (error) console.error("Saving review failed", error);

  return Response.json({ weekStart, content });
}
