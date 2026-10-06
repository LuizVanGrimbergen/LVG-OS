"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonRows } from "@/components/layout/skeleton-rows";
import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import { AddGoalSheet } from "@/features/goals/components/add-goal-sheet";
import { useGoals } from "@/features/goals/use-goals";
import { useTodayKey } from "@/hooks/use-today";
import { toDateKey } from "@/lib/date";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "../types";
import { NoteOptionsSheet } from "./note-options-sheet";
import { QuickCapture } from "./quick-capture";

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const date = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** "Today 14:05" for today's notes, "Mon 28 Sep" for older ones. */
function when(createdAt: string, today: string | null): string {
  const d = new Date(createdAt);
  return toDateKey(d) === today ? `Today ${time.format(d)}` : date.format(d);
}

const TITLE_MAX = 200;
const shorten = (text: string) => (text.length > TITLE_MAX ? `${text.slice(0, TITLE_MAX - 1)}…` : text);

/** Your notes, newest first, or null when they couldn't be loaded (offline, server problem). */
async function fetchNotes(): Promise<Note[] | null> {
  const { data, error } = await createClient()
    .from("notes")
    .select("id, body, created_at, archived_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Loading notes failed", error);
    return null;
  }
  return data ?? [];
}

type NotesViewProps = {
  /** Text shared from another app, to prefill the capture field. */
  shared?: string;
  /** Focus the capture field (the "Quick note" app shortcut). */
  focus?: boolean;
};

/** Captured notes: an inbox to sort into goals, and an archive. */
export function NotesView({ shared, focus }: NotesViewProps) {
  const todayKey = useTodayKey();
  const { add: addGoal } = useGoals();
  const [notes, setNotes, cached] = useCachedState<Note[]>("notes", []);
  const [loaded, setLoaded] = useState(cached);
  const [showArchive, setShowArchive] = useState(false);
  const [selected, setSelected] = useState<Note | null>(null);
  const [goalFrom, setGoalFrom] = useState<Note | null>(null);

  const refresh = useCallback(async () => {
    // Saved: drop shared text from the address, so reloading doesn't fill it in again.
    if (window.location.search) window.history.replaceState(null, "", "/notes");
    const fresh = await fetchNotes();
    if (fresh) setNotes(fresh);
    setLoaded(true);
  }, [setNotes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchNotes();
      if (cancelled) return;
      // Couldn't load: keep showing what we had instead of an empty inbox.
      if (data) setNotes(data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setNotes]);

  const inbox = notes.filter((n) => !n.archived_at);
  const archive = notes.filter((n) => n.archived_at);
  const shown = showArchive ? archive : inbox;

  const remove = async (id: string) => {
    const before = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const { error } = await createClient().from("notes").delete().eq("id", id);
    if (error) {
      console.error("Deleting note failed", error);
      setNotes(before);
    }
  };

  const setArchived = async (note: Note, archived: boolean) => {
    const archived_at = archived ? new Date().toISOString() : null;
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, archived_at } : n)));
    const { error } = await createClient().from("notes").update({ archived_at }).eq("id", note.id);
    if (error) {
      console.error("Archiving note failed", error);
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Notes" />
      <QuickCapture key={shared} initialBody={shared} autoFocus={focus} onSaved={refresh} />

      <div className="flex gap-4 px-1 text-xs" role="tablist">
        {[
          { archived: false, label: `Inbox · ${inbox.length}`, icon: Inbox },
          { archived: true, label: `Archive · ${archive.length}`, icon: Archive },
        ].map(({ archived, label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={showArchive === archived}
            onClick={() => setShowArchive(archived)}
            className={`-my-2 flex items-center gap-1.5 py-2 ${showArchive === archived ? "text-foreground" : "text-muted-foreground"}`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {!loaded && <SkeletonRows lines={2} />}
      {loaded && shown.length === 0 && (
        <p className="py-4 text-sm text-muted-foreground">
          {showArchive ? "Nothing archived yet." : notes.length ? "Inbox zero. Nicely sorted." : "Nothing captured yet."}
        </p>
      )}
      <AnimatedList className="divide-y divide-border">
        {shown.map((note) => (
          <AnimatedListItem key={note.id}>
            <button type="button" onClick={() => setSelected(note)} className="block w-full py-4 text-left">
              <p className="line-clamp-3 text-[15px] whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{when(note.created_at, todayKey)}</p>
            </button>
          </AnimatedListItem>
        ))}
      </AnimatedList>

      <NoteOptionsSheet
        note={selected}
        onMakeGoal={setGoalFrom}
        onArchive={setArchived}
        onDelete={remove}
        onClose={() => setSelected(null)}
      />
      <AddGoalSheet
        key={goalFrom?.id ?? "none"}
        open={goalFrom !== null}
        initialTitle={goalFrom ? shorten(goalFrom.body) : ""}
        onClose={() => setGoalFrom(null)}
        onAdd={async (fields) => {
          const note = goalFrom;
          if ((await addGoal(fields)) && note) void setArchived(note, true);
        }}
      />
    </div>
  );
}
