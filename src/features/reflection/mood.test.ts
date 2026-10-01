import { describe, expect, it } from "vitest";
import { averageMood, habitMoodPatterns } from "./mood";

const moods = [
  { day: "2026-09-01", mood: 5 },
  { day: "2026-09-02", mood: 4 },
  { day: "2026-09-03", mood: 5 },
  { day: "2026-09-04", mood: 2 },
  { day: "2026-09-05", mood: 2 },
  { day: "2026-09-06", mood: 3 },
];

describe("averageMood", () => {
  it("averages", () => expect(averageMood(moods.slice(0, 2))).toBe(4.5));
  it("is null without data", () => expect(averageMood([])).toBeNull());
});

describe("habitMoodPatterns", () => {
  it("compares mood with and without the habit", () => {
    const gym = new Set(["2026-09-01", "2026-09-02", "2026-09-03"]);
    const [p] = habitMoodPatterns(moods, new Map([["gym", gym]]));
    expect(p.withHabit).toBeCloseTo(14 / 3);
    expect(p.without).toBeCloseTo(7 / 3);
    expect(p.difference).toBeCloseTo(7 / 3);
  });

  it("skips habits without enough days on both sides", () => {
    const rare = new Set(["2026-09-01", "2026-09-02"]);
    expect(habitMoodPatterns(moods, new Map([["rare", rare]]))).toEqual([]);
  });

  it("puts the strongest difference first", () => {
    const strong = new Set(["2026-09-01", "2026-09-02", "2026-09-03"]);
    const weak = new Set(["2026-09-01", "2026-09-04", "2026-09-06"]);
    const result = habitMoodPatterns(moods, new Map([["weak", weak], ["strong", strong]]));
    expect(result.map((p) => p.habitId)).toEqual(["strong", "weak"]);
  });
});
