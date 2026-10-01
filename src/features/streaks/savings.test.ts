import { describe, expect, it } from "vitest";
import { HEALTH_TIMELINE, hoursSince, stepProgress } from "./health";
import { cigarettesAvoided, moneySaved } from "./savings";

const cost = { cigarettesPerDay: 10, packPrice: 9, packSize: 20 };

describe("savings", () => {
  it("counts cigarettes not smoked", () => expect(cigarettesAvoided(30, cost)).toBe(300));
  it("prices them per pack", () => expect(moneySaved(30, cost)).toBe(135));
  it("never goes negative", () => expect(moneySaved(-3, cost)).toBe(0));
});

describe("health timeline", () => {
  it("is in order", () => {
    const after = HEALTH_TIMELINE.map((s) => s.after);
    expect(after).toEqual([...after].sort((a, b) => a - b));
  });

  it("measures hours from the start of the quit day", () => {
    expect(hoursSince(new Date(2026, 9, 1), new Date(2026, 9, 3, 12))).toBe(60);
    expect(hoursSince(new Date(2026, 9, 3), new Date(2026, 9, 1))).toBe(0);
  });

  it("caps progress at 1", () => {
    expect(stepProgress(48, 24)).toBe(0.5);
    expect(stepProgress(48, 100)).toBe(1);
  });
});
