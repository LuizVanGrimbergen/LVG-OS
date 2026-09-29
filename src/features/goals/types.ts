export type GoalCategory = "sport" | "work";

export type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  /** "count" goes up by 1 per tap, "percent" by 10. */
  kind: "count" | "percent";
  current: number;
  target: number;
};
