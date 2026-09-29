"use client";

import { useState } from "react";
import { ArrowUp, Pencil } from "lucide-react";

type PromptCardProps = {
  label: string;
  question: string;
  placeholder: string;
  value?: string;
  /** Shown above the question, e.g. this morning's intention in the evening. */
  context?: string;
  onSave: (text: string) => void;
};

/** A one-line question: an input until answered, then the answer (tap to edit). */
export function PromptCard({ label, question, placeholder, value, context, onSave }: PromptCardProps) {
  const [editing, setEditing] = useState(!value);
  const [draft, setDraft] = useState(value ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSave(text);
    setEditing(false);
  };

  return (
    <div className="rounded-2xl bg-card px-4 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {context && <p className="mt-1 text-xs text-muted-foreground">This morning: {context}</p>}
      <p className="mt-1 text-[15px]">{question}</p>

      {editing ? (
        <form onSubmit={submit} className="mt-3 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            aria-label={question}
            className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-transparent px-3 text-base outline-none focus:border-ring"
          />
          <button
            type="submit"
            aria-label="Save"
            disabled={!draft.trim()}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
          >
            <ArrowUp className="size-5" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit: ${value}`}
          className="mt-2 flex w-full items-start justify-between gap-3 text-left text-[15px] text-muted-foreground"
        >
          <span>{value}</span>
          <Pencil className="mt-1 size-3.5 shrink-0" />
        </button>
      )}
    </div>
  );
}
