export type Note = {
  id: string;
  body: string;
  created_at: string;
  /** Set once the note is sorted: turned into a task or goal, or archived. */
  archived_at: string | null;
};

export const MAX_NOTE_LENGTH = 2000;
