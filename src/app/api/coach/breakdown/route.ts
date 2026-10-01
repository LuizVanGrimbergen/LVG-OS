import { askCoach, coachErrorResponse } from "@/features/coach/claude";
import { BREAKDOWN_SYSTEM_PROMPT } from "@/features/coach/prompt";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const SCHEMA = {
  type: "object",
  properties: {
    steps: { type: "array", items: { type: "string" } },
  },
  required: ["steps"],
  additionalProperties: false,
};

/** Suggests the first few tasks for one of your goals. Body: { goalId }. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { goalId } = (await request.json().catch(() => ({}))) as { goalId?: unknown };
  if (typeof goalId !== "string") return Response.json({ error: "Which goal?" }, { status: 400 });

  const { data: goal } = await supabase
    .from("goals")
    .select("title, category, kind, current, target")
    .eq("id", goalId)
    .maybeSingle();
  if (!goal) return Response.json({ error: "Goal not found." }, { status: 404 });

  const { data: linked } = await supabase.from("tasks").select("title, done").eq("goal_id", goalId).limit(30);
  const progress = goal.kind === "percent" ? `${goal.current}%` : `${goal.current} of ${goal.target}`;
  const lines = [
    `Goal: ${goal.title}`,
    `Category: ${goal.category}`,
    `Progress so far: ${progress}`,
    "Tasks already planned for it:",
    ...(linked?.length ? linked.map((t) => `- ${t.done ? "[x]" : "[ ]"} ${t.title}`) : ["- none"]),
  ];

  try {
    const text = await askCoach({
      system: BREAKDOWN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: lines.join("\n") }],
      schema: SCHEMA,
    });
    const steps = (JSON.parse(text) as { steps: string[] }).steps
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 200)
      .slice(0, 5);
    return Response.json({ steps });
  } catch (error) {
    return coachErrorResponse(error);
  }
}
