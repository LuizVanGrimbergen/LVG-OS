"use client";

import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Note } from "../types";

type NoteOptionsSheetProps = {
  note: Note | null;
  onMakeTask: (note: Note) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

/** Opened by tapping a note: turn it into a task for today, or delete it. */
export function NoteOptionsSheet({ note, onMakeTask, onDelete, onClose }: NoteOptionsSheetProps) {
  return (
    <BottomSheet
      open={note !== null}
      title="Note"
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (note) onDelete(note.id);
        onClose();
      }}
    >
      <p className="max-h-40 overflow-y-auto text-[15px] whitespace-pre-wrap text-muted-foreground">{note?.body}</p>
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => {
            if (note) onMakeTask(note);
            onClose();
          }}
          className="h-12 w-full rounded-xl text-base"
        >
          Make it a task for today
        </Button>
        <Button type="submit" variant="destructive" size="lg" className="h-12 w-full rounded-xl text-base">
          Delete note
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onClose} className="h-12 w-full rounded-xl text-base">
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
