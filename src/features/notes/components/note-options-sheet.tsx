"use client";

import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Note } from "../types";

type NoteOptionsSheetProps = {
  note: Note | null;
  onMakeGoal: (note: Note) => void;
  onArchive: (note: Note, archived: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const big = "h-12 w-full rounded-xl text-base";

/** Opened by tapping a note: turn it into a goal, archive it, or delete it. */
export function NoteOptionsSheet({ note, onMakeGoal, onArchive, onDelete, onClose }: NoteOptionsSheetProps) {
  const archived = !!note?.archived_at;

  const run = (action: (n: Note) => void) => () => {
    if (note) action(note);
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
