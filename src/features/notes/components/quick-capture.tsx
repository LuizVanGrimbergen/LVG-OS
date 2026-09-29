"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MAX_NOTE_LENGTH } from "../types";

/**
 * One field: type a thought, tap ↑, and it's saved to Notes.
 * On Home it shows a link to Notes after saving; on Notes it calls `onSaved` to refresh the list.
 */
export function QuickCapture({ onSaved }: { onSaved?: () => void }) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setStatus("saving");

    const { error } = await createClient().from("notes").insert({ body: text });
    if (error) {
      console.error("Saving note failed", error);
      return setStatus("error");
    }
    setBody("");
    setStatus("saved");
    onSaved?.();
  };

  return (
    <div className="rounded-2xl bg-card px-4 py-4">
      <form onSubmit={save} className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Lightbulb className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={body}
            maxLength={MAX_NOTE_LENGTH}
            onChange={(e) => {
              setBody(e.target.value);
              if (status !== "saving") setStatus("idle");
            }}
            placeholder="Capture a thought…"
            aria-label="Capture a thought"
            className="h-11 w-full rounded-xl border border-input bg-transparent pr-3 pl-9 text-base outline-none focus:border-ring"
          />
        </div>
        <button
          type="submit"
          aria-label="Save note"
          disabled={!body.trim() || status === "saving"}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
        >
          <ArrowUp className="size-5" />
        </button>
      </form>
      {status === "saved" && !onSaved && (
        <p className="mt-2 text-xs text-muted-foreground">
          Saved.{" "}
          <Link href="/notes" className="text-foreground underline underline-offset-2">
            View notes
          </Link>
        </p>
      )}
      {status === "error" && <p className="mt-2 text-xs text-destructive">Couldn&apos;t save. Try again.</p>}
    </div>
  );
}
