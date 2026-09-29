"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { fromDateKey } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import { REVIEW_HEADINGS } from "../prompt";

type Review = { week_start: string; content: string };

const weekLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });
const HEADINGS = new Set<string>(REVIEW_HEADINGS);

/** Renders the review, styling the three section headings. */
function ReviewText({ content }: { content: string }) {
  return (
    <div className="space-y-1 text-[15px] leading-relaxed">
      {content.split("\n").map((line, i) =>
        HEADINGS.has(line.trim()) ? (
          <h3 key={i} className="pt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase first:pt-0">
            {line.trim()}
          </h3>
        ) : line.trim() ? (
          <p key={i}>{line}</p>
        ) : null,
      )}
    </div>
  );
}

export function CoachView() {
  const [review, setReview] = useState<Review | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await createClient()
        .from("weekly_reviews")
        .select("week_start, content")
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) console.error("Loading review failed", error);
      setReview(data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const write = async () => {
    setWriting(true);
    setError("");
    try {
      const res = await fetch("/api/coach/review", { method: "POST" });
      const body = (await res.json()) as { weekStart?: string; content?: string; error?: string };
      if (!res.ok || !body.content || !body.weekStart) throw new Error(body.error ?? "Something went wrong.");
      setReview({ week_start: body.weekStart, content: body.content });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Coach" />

      <section className="rounded-2xl bg-card px-4 py-5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          {review ? `Week of ${weekLabel.format(fromDateKey(review.week_start))}` : "Weekly review"}
        </p>

        <div className="mt-3">
          {writing ? (
            <p className="animate-pulse text-[15px] text-muted-foreground">Reading your week…</p>
          ) : review ? (
            <ReviewText content={review.content} />
          ) : loaded ? (
            <p className="text-[15px] text-muted-foreground">
              A short look back at your last 7 days, written by your coach: what went well, what stands out, and one
              focus for next week.
            </p>
          ) : null}
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <Button
          type="button"
          size="lg"
          onClick={write}
          disabled={writing || !loaded}
          className="mt-5 h-12 w-full rounded-xl text-base"
        >
          <Sparkles className="size-4" />
          {review ? "Write it again" : "Write my weekly review"}
        </Button>
      </section>

      <p className="px-1 text-xs text-muted-foreground">
        Written by Claude from your tasks, goals, check-ins and smoke-free streak of the last 7 days. That data is sent
        to Anthropic to write the review.
      </p>
    </div>
  );
}
