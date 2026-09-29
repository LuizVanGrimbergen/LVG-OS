"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTasks } from "@/features/planning/tasks-context";
import { useTodayKey } from "@/hooks/use-today";
import { toDateKey } from "@/lib/date";
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

const TASK_TITLE_MAX = 200;

async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await createClient()
    .from("notes")
    .select("id, body, created_at")
    .order("created_at", { ascending: false });
  if (error) console.error("Loading notes failed", error);
  return data ?? [];
}

export function NotesView() {
  const todayKey = useTodayKey();
  const { add: addTask } = useTasks();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Note | null>(null);

  const refresh = useCallback(async () => {
    setNotes(await fetchNotes());
    setLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchNotes();
      if (cancelled) return;
      setNotes(data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (id: string) => {
    const before = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const { error } = await createClient().from("notes").delete().eq("id", id);
    if (error) {
      console.error("Deleting note failed", error);
      setNotes(before);
    }
  };

  const makeTask = (note: Note) => {
    if (!todayKey) return;
    const title = note.body.length > TASK_TITLE_MAX ? `${note.body.slice(0, TASK_TITLE_MAX - 1)}…` : note.body;
    addTask(title, todayKey);
    void remove(note.id);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Notes" />
      <QuickCapture onSaved={refresh} />

      {loaded && notes.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nothing captured yet.</p>}
      <ul className="divide-y divide-border">
        {notes.map((note) => (
          <li key={note.id}>
            <button type="button" onClick={() => setSelected(note)} className="block w-full py-4 text-left">
              <p className="line-clamp-3 text-[15px] whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{when(note.created_at, todayKey)}</p>
            </button>
          </li>
        ))}
      </ul>

      <NoteOptionsSheet note={selected} onMakeTask={makeTask} onDelete={remove} onClose={() => setSelected(null)} />
    </div>
  );
}
