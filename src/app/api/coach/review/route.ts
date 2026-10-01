import { askCoach, coachErrorResponse } from "@/features/coach/claude";
import { currentWeekStart, localToday, weekContext } from "@/features/coach/context";
import { COACH_SYSTEM_PROMPT } from "@/features/coach/prompt";
import { createClient } from "@/lib/supabase/server";

// Writing the review can take a little while.
export const maxDuration = 60;

/**
 * Writes a weekly review of the last 7 days with Claude and stores it for this week.
 * Only for the signed-in user; their data is read with their own session (row level security).
 * Writing it again starts a fresh conversation about it.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Not signed in." }, { status: 401 });

  const today = localToday();
  const weekStart = currentWeekStart(today);

  let content: string;
  try {
    content = await askCoach({
      system: COACH_SYSTEM_PROMPT,
      messages: [{ role: "user", content: await weekContext(supabase, today) }],
    });
  } catch (error) {
    return coachErrorResponse(error);
  }

  const { error } = await supabase
    .from("weekly_reviews")
    .upsert({ week_start: weekStart, content, created_at: new Date().toISOString() }, { onConflict: "user_id,week_start" });
  if (error) console.error("Saving review failed", error);
  const { error: chatError } = await supabase.from("coach_messages").delete().eq("week_start", weekStart);
  if (chatError) console.error("Clearing chat failed", chatError);

  return Response.json({ weekStart, content });
}
