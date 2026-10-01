import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export class CoachError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
  }
}

type AskOptions = {
  system: string;
  messages: Anthropic.Beta.BetaMessageParam[];
  /** JSON schema the answer must follow; the text is then valid JSON. */
  schema?: Record<string, unknown>;
};

/** One Claude call for the coach. Returns the answer text, or throws a CoachError with a message to show. */
export async function askCoach({ system, messages, schema }: AskOptions): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new CoachError("The coach isn't set up yet (ANTHROPIC_API_KEY is missing).", 500);
  }

  let response: Anthropic.Beta.BetaMessage;
  try {
    response = await new Anthropic().beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // If the model declines, the API retries on a suitable fallback model in the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", ...(schema && { format: { type: "json_schema", schema } }) },
      system,
      messages,
    });
  } catch (error) {
    console.error("Coach request failed", error);
    throw new CoachError(
      error instanceof Anthropic.AuthenticationError
        ? "The coach's API key is invalid."
        : error instanceof Anthropic.RateLimitError
          ? "The coach is busy. Try again in a minute."
          : "The coach couldn't be reached. Try again later.",
    );
  }

  if (response.stop_reason === "refusal") throw new CoachError("The coach couldn't answer this time. Try again later.");
  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
  if (!text) throw new CoachError("The coach returned an empty answer.");
  return text;
}

/** Turns a thrown error into the JSON error response the coach screens expect. */
export function coachErrorResponse(error: unknown): Response {
  if (error instanceof CoachError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Coach failed", error);
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}
