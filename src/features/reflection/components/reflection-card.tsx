"use client";

import { useDayPart } from "@/hooks/use-day-part";
import { useReflection } from "../reflection-context";
import { PromptCard } from "./prompt-card";

/**
 * Morning: set an intention. Afternoon: see it as a reminder.
 * Evening: note what went well.
 */
export function ReflectionCard() {
  const dayPart = useDayPart();
  const { notes, save } = useReflection();
  if (!dayPart) return null;

  const { part, dateKey } = dayPart;
  const note = notes[dateKey] ?? {};

  if (part === "morning") {
    return (
      <PromptCard
        key={`${dateKey}-intention`}
        label="This morning"
        question="Today I want to…"
        placeholder="Send 3 mails and go for a run"
        value={note.intention}
        onSave={(text) => save(dateKey, "intention", text)}
      />
    );
  }

  if (part === "day") {
    if (!note.intention) return null;
    return (
      <div className="rounded-2xl bg-card px-4 py-4">
        <p className="text-xs text-muted-foreground">Today I want to…</p>
        <p className="mt-1 text-[15px]">{note.intention}</p>
      </div>
    );
  }

  return (
    <PromptCard
      key={`${dateKey}-reflection`}
      label="Tonight"
      question="What went well today?"
      placeholder="One line"
      value={note.reflection}
      context={note.intention}
      onSave={(text) => save(dateKey, "reflection", text)}
    />
  );
}
