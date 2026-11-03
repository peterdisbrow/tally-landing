import { describe, expect, it } from "vitest";
import { advanceCount, countToTc, formatAge, formatTc, framesPerDay, rateLabel, tcToCount, type TcRate } from "./timecode";

const R24: TcRate = { nominal: 24, fps: 24000 / 1001, drop: false };
const R25: TcRate = { nominal: 25, fps: 25, drop: false };
const R2997: TcRate = { nominal: 30, fps: 30000 / 1001, drop: false };
const R2997DF: TcRate = { nominal: 30, fps: 30000 / 1001, drop: true };
const R30: TcRate = { nominal: 30, fps: 30, drop: false };

describe("timecode counts", () => {
  it("round-trips every frame of the first hour+ for each Deity TC-1 rate", () => {
    for (const r of [R24, R25, R2997, R2997DF, R30]) {
      const n = Math.min(framesPerDay(r), 130000);
      for (let c = 0; c < n; c += 7) expect(tcToCount(countToTc(c, r), r)).toBe(c);
    }
  });
  it("29.97 drop-frame skips ;00 and ;01 at minutes, except every 10th", () => {
    expect(formatTc(countToTc(1799, R2997DF), true)).toBe("00:00:59;29");
    expect(formatTc(countToTc(1800, R2997DF), true)).toBe("00:01:00;02");
    expect(formatTc(countToTc(17982, R2997DF), true)).toBe("00:10:00;00");
    expect(tcToCount({ h: 1, m: 0, s: 0, f: 0 }, R2997DF)).toBe(107892);
    expect(framesPerDay(R2997DF)).toBe(107892 * 24);
  });
  it("29.97 non-drop does not skip", () => {
    expect(formatTc(countToTc(1800, R2997), false)).toBe("00:01:00:00");
  });
  it("advances across a drop-frame minute and wraps at 24h", () => {
    const c = tcToCount({ h: 0, m: 0, s: 59, f: 29 }, R2997DF);
    expect(formatTc(countToTc(advanceCount(c, 1, R2997DF), R2997DF), true)).toBe("00:01:00;02");
    const last = tcToCount({ h: 23, m: 59, s: 59, f: 23 }, R24);
    expect(formatTc(countToTc(advanceCount(last, 1, R24), R24), false)).toBe("00:00:00:00");
    expect(formatTc(countToTc(advanceCount(0, -1, R25), R25), false)).toBe("23:59:59:24");
  });
  it("labels the TC-1 rates", () => {
    expect([R24, { ...R24, fps: 24 }, R25, R2997, R2997DF, R30].map(rateLabel)).toEqual(["23.98", "24", "25", "29.97", "29.97 DF", "30"]);
  });
  it("formats the jam age", () => {
    expect(formatAge(3000)).toBe("just now");
    expect(formatAge(42_000)).toBe("42s ago");
    expect(formatAge(5 * 60_000 + 10)).toBe("5m ago");
    expect(formatAge(3_900_000)).toBe("1h 5m ago");
  });
});
