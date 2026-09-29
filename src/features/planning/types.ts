export type Task = {
  id: string;
  title: string;
  done: boolean;
  /** "YYYY-MM-DD" the task is planned for. */
  day: string;
  created_at: string;
};
