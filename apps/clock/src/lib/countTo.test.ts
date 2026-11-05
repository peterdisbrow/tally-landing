import { describe, expect, it } from "vitest";
import { parseTimeOfDay, targetToday, formatTimeOfDay, defaultCountToTime } from "./countTo";
describe("count to time of day", () => {
  it("parses 12h and 24h input", () => {
    expect(parseTimeOfDay("10:30 AM")).toBe("10:30");
    expect(parseTimeOfDay("10:30pm")).toBe("22:30");
    expect(parseTimeOfDay("12:00 AM")).toBe("00:00");
    expect(parseTimeOfDay("12 pm")).toBe("12:00");
    expect(parseTimeOfDay("22:30")).toBe("22:30");
    expect(parseTimeOfDay("24:00")).toBeNull();
    expect(parseTimeOfDay("13:00 pm")).toBeNull();
    expect(parseTimeOfDay("10:75")).toBeNull();
  });
  it("targets today and never rolls to tomorrow once passed", () => {
    const now = new Date(2026, 10, 4, 11, 0, 0);
    const t = targetToday("10:30", now);
    expect(new Date(t).getDate()).toBe(4);
    expect(t - now.getTime()).toBe(-30 * 60e3); // 30 min overtime
    expect(targetToday("11:15", now) - now.getTime()).toBe(15 * 60e3);
  });
  it("formats in the clock's format", () => {
    expect(formatTimeOfDay("22:05", false)).toBe("10:05 PM");
    expect(formatTimeOfDay("00:05", false)).toBe("12:05 AM");
    expect(formatTimeOfDay("22:05", true)).toBe("22:05");
  });
  it("defaults to the next half hour today", () => {
    expect(defaultCountToTime(new Date(2026, 10, 4, 9, 10))).toBe("09:30");
    expect(defaultCountToTime(new Date(2026, 10, 4, 9, 40))).toBe("10:00");
    expect(defaultCountToTime(new Date(2026, 10, 4, 23, 40))).toBe("23:59");
  });
});
