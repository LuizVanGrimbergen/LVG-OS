import { describe, expect, it } from "vitest";
import { formatDuration, formatPace, parseDistance, parseDuration, weekSummary } from "./runs";

describe("parseDuration", () => {
  it("reads minutes and seconds", () => expect(parseDuration("28:40")).toBe(1720));
  it("reads hours", () => expect(parseDuration("1:05:30")).toBe(3930));
  it("allows spaces around it", () => expect(parseDuration(" 9:05 ")).toBe(545));
  it("rejects nonsense", () => {
    for (const bad of ["", "28", "28:70", "1:75:00", "a:10", "0:00", "28:40:10:00"]) {
      expect(parseDuration(bad)).toBeNull();
    }
  });
});

describe("parseDistance", () => {
  it("takes a comma or a dot", () => {
    expect(parseDistance("5,2")).toBe(5.2);
    expect(parseDistance("5.25")).toBe(5.25);
    expect(parseDistance("10")).toBe(10);
  });
  it("rejects nonsense", () => {
    for (const bad of ["", "0", "-3", "5.123", "five", "1000"]) expect(parseDistance(bad)).toBeNull();
  });
});

describe("formatting", () => {
  it("shows durations", () => {
    expect(formatDuration(1720)).toBe("28:40");
    expect(formatDuration(545)).toBe("9:05");
    expect(formatDuration(3930)).toBe("1:05:30");
  });
  it("shows pace per km", () => expect(formatPace({ distance_km: 5.2, duration_s: 1720 })).toBe("5:31 /km"));
});

describe("weekSummary", () => {
  const run = (day: string, distance_km: number) => ({ id: day, day, distance_km, duration_s: 1800 });

  it("counts Monday to Sunday", () => {
    // 2026-10-06 is a Tuesday; that week runs from Mon 5 to Sun 11 October.
    const runs = [run("2026-10-04", 5), run("2026-10-05", 5.2), run("2026-10-08", 4), run("2026-10-11", 3), run("2026-10-12", 6)];
    const summary = weekSummary(runs, "2026-10-06");
    expect(summary.count).toBe(3);
    expect(summary.km).toBeCloseTo(12.2);
  });
});
