import { describe, expect, it } from "vitest";
import { currentStreak, heatmapWeeks, longestStreak } from "./streaks";

const set = (...days: string[]) => new Set(days);

describe("currentStreak", () => {
  it("counts back from today when today is done", () => {
    expect(currentStreak(set("2026-09-29", "2026-09-30", "2026-10-01"), "2026-10-01")).toBe(3);
  });

  it("counts from yesterday when today isn't done yet", () => {
    expect(currentStreak(set("2026-09-29", "2026-09-30"), "2026-10-01")).toBe(2);
  });

  it("is 0 after a missed day", () => {
    expect(currentStreak(set("2026-09-28"), "2026-10-01")).toBe(0);
  });

  it("crosses month boundaries", () => {
    expect(currentStreak(set("2026-08-31", "2026-09-01"), "2026-09-01")).toBe(2);
  });
});

describe("longestStreak", () => {
  it("finds the longest run", () => {
    expect(longestStreak(set("2026-09-01", "2026-09-02", "2026-09-05", "2026-09-06", "2026-09-07"))).toBe(3);
  });

  it("is 0 without days", () => {
    expect(longestStreak(set())).toBe(0);
  });
});

describe("heatmapWeeks", () => {
  it("ends with the week containing today, Monday first", () => {
    const weeks = heatmapWeeks("2026-10-01", 2); // a Thursday
    expect(weeks).toHaveLength(2);
    expect(weeks[1][0]).toBe("2026-09-28");
    expect(weeks[1][6]).toBe("2026-10-04");
    expect(weeks[0][0]).toBe("2026-09-21");
  });
});
