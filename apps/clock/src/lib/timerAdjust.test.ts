import { describe, expect, it } from "vitest";
import { formatHMS, formatSigned, nextAdjust, parseDuration, stepLabel } from "./timerAdjust";

describe("parseDuration", () => {
  it.each([
    ["30:00", 1800], ["12:30", 750], ["00:12:30", 750], ["1:02:03", 3723],
    ["90", 90], ["0", 0], ["10s", 10], ["2m", 120], ["1h", 3600], ["1h30m", 5400], ["1m30s", 90], [" 5M ", 300],
  ])("%s -> %s", (input, seconds) => expect(parseDuration(input)).toBe(seconds));

  it.each(["", "abc", "-5", "1:75", "12:60:00", "1.5", "5 minutes", "m", "999999999"])("rejects %j", (input) => {
    expect(parseDuration(input)).toBeNull();
  });
});

describe("formatting", () => {
  it("formatHMS", () => { expect(formatHMS(750)).toBe("00:12:30"); expect(formatHMS(0)).toBe("00:00:00"); expect(formatHMS(-5)).toBe("00:00:00"); });
  it("formatSigned", () => {
    expect(formatSigned(0)).toBe(""); expect(formatSigned(75)).toBe("+1:15"); expect(formatSigned(-600)).toBe("-10:00"); expect(formatSigned(3725)).toBe("+1:02:05");
  });
  it("stepLabel", () => { expect([10, 60, 300, 3600].map(stepLabel)).toEqual(["10s", "1m", "5m", "1h"]); });
});

describe("nextAdjust", () => {
  it("adds and subtracts", () => { expect(nextAdjust(0, 60, 0, false)).toBe(60); expect(nextAdjust(60, -300, 0, false)).toBe(-240); });
  it("floors a count-up at zero", () => {
    // showing 0:20, subtract 1m -> only 20s comes off
    expect(nextAdjust(0, -60, 20, true)).toBe(-20);
    expect(nextAdjust(-20, -60, 0, true)).toBe(-20);
  });
});
