"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import type { Note } from "../types";

type NoteOptionsSheetProps = {
  note: Note | null;
  today: string;
  onMakeTask: (note: Note, day: string) => void;
  onMakeGoal: (note: Note) => void;
  onArchive: (note: Note, archived: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const big = "h-12 w-full rounded-xl text-base";

/** Opened by tapping a note: sort it into a task or goal, archive it, or delete it. */
export function NoteOptionsSheet({ note, today, onMakeTask, onMakeGoal, onArchive, onDelete, onClose }: NoteOptionsSheetProps) {
  const [day, setDay] = useState("");
  const tomorrow = toDateKey(addDays(fromDateKey(today), 1));
  const archived = !!note?.archived_at;

  const run = (action: (n: Note) => void) => () => {
    if (note) action(note);
    setDay("");
    onClose();
  };

  return (
    <BottomSheet
      open={note !== null}
      title="Note"
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        run((n) => onDelete(n.id))();
      }}
    >
      <p className="max-h-40 overflow-y-auto text-[15px] whitespace-pre-wrap text-muted-foreground">{note?.body}</p>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Make it a task</p>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" size="lg" onClick={run((n) => onMakeTask(n, today))} className="h-11 rounded-xl">
            Today
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={run((n) => onMakeTask(n, tomorrow))} className="h-11 rounded-xl">
            Tomorrow
          </Button>
          <input
            type="date"
            min={today}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            aria-label="Pick a day"
            className="h-11 w-full min-w-0 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground outline-none [color-scheme:dark] focus:border-ring"
          />
          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={!day}
            onClick={run((n) => onMakeTask(n, day))}
            className="h-11 rounded-xl"
          >
            On that day
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Button type="button" variant="secondary" size="lg" onClick={run(onMakeGoal)} className={big}>
          Make it a goal
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={run((n) => onArchive(n, !archived))} className={big}>
          {archived ? "Back to inbox" : "Archive"}
        </Button>
        <Button type="submit" variant="destructive" size="lg" className={big}>
          Delete note
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose} className={big}>
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
