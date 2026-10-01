import type Anthropic from "@anthropic-ai/sdk";
import { askCoach, coachErrorResponse } from "@/features/coach/claude";
import { localToday, weekContext } from "@/features/coach/context";
import { CHAT_SYSTEM_PROMPT } from "@/features/coach/prompt";
import { addDays, fromDateKey, isDateKey, toDateKey } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Reply to a weekly review. Body: { weekStart, message }.
 * Stores your message and the coach's answer, and returns the answer.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Not signed in." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { weekStart?: unknown; message?: unknown };
  const weekStart = typeof body.weekStart === "string" ? body.weekStart : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!isDateKey(weekStart)) return Response.json({ error: "Which week?" }, { status: 400 });
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: `Write between 1 and ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
  }

  const [reviewRes, historyRes] = await Promise.all([
    supabase.from("weekly_reviews").select("content").eq("week_start", weekStart).maybeSingle(),
    supabase.from("coach_messages").select("role, content").eq("week_start", weekStart).order("created_at"),
  ]);
  if (!reviewRes.data) return Response.json({ error: "Write the weekly review first." }, { status: 404 });

  // Same window as the review: up to today, or that week's Sunday for an older review.
  const today = localToday();
  const weekEnd = toDateKey(addDays(fromDateKey(weekStart), 6));
  const context = await weekContext(supabase, weekEnd < today ? weekEnd : today);
  const history = (historyRes.data ?? []) as { role: "user" | "assistant"; content: string }[];

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: context },
    { role: "assistant", content: reviewRes.data.content },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  let answer: string;
  try {
    answer = await askCoach({ system: CHAT_SYSTEM_PROMPT, messages });
  } catch (error) {
    return coachErrorResponse(error);
  }

  const now = Date.now();
  const { error } = await supabase.from("coach_messages").insert([
    { week_start: weekStart, role: "user", content: message, created_at: new Date(now).toISOString() },
    { week_start: weekStart, role: "assistant", content: answer.slice(0, 5000), created_at: new Date(now + 1).toISOString() },
  ]);
  if (error) console.error("Saving chat failed", error);

  return Response.json({ answer });
}
