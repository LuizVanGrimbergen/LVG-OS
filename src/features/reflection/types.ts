export type DailyNote = {
  /** Morning: "Today I want to…" */
  intention?: string;
  /** Evening: "What went well today?" */
  reflection?: string;
  /** Evening: mood 1 (rough) … 5 (great). */
  mood?: number;
};
