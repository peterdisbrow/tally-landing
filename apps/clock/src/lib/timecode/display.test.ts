import { describe, expect, it } from "vitest";
import { displayFields, displayText, rateParts, subFrameSince } from "./display";
import { jamPosition } from "./jam";
import { tcToCount, type TcRate } from "./timecode";
import type { JamRecord } from "./jam";

const R2997: TcRate = { nominal: 30, fps: 30000 / 1001, drop: false };
const R2997DF: TcRate = { ...R2997, drop: true };
const R30: TcRate = { nominal: 30, fps: 30, drop: false };
const R25: TcRate = { nominal: 25, fps: 25, drop: false };

describe("59.94 / 60 display from 29.97 / 30 LTC (frame pairs)", () => {
  it("shows each LTC pair as two frames (00-59)", () => {
    const c = tcToCount({ h: 1, m: 2, s: 3, f: 7 }, R30);
    expect(displayText({ count: c, sub: 0 }, R30, true)).toBe("01:02:03:14");
    expect(displayText({ count: c, sub: 1 }, R30, true)).toBe("01:02:03:15");
    const last = tcToCount({ h: 0, m: 0, s: 0, f: 29 }, R30);
    expect(displayText({ count: last, sub: 1 }, R30, true)).toBe("00:00:00:59");
  });
  it("is unchanged when x2 is off, and ignored for rates it doesn't apply to (24/25)", () => {
    const c = tcToCount({ h: 1, m: 2, s: 3, f: 7 }, R30);
    expect(displayText({ count: c, sub: 1 }, R30, false)).toBe("01:02:03:07");
    const c25 = tcToCount({ h: 1, m: 2, s: 3, f: 7 }, R25);
    expect(displayText({ count: c25, sub: 1 }, R25, true)).toBe("01:02:03:07");
  });
  it("59.94 DF drops frames 0-3 at each minute except every 10th", () => {
    const end = tcToCount({ h: 0, m: 0, s: 59, f: 29 }, R2997DF);
    expect(displayText({ count: end, sub: 0 }, R2997DF, true)).toBe("00:00:59;58");
    expect(displayText({ count: end, sub: 1 }, R2997DF, true)).toBe("00:00:59;59");
    // next pair is 00:01:00;02 in 29.97 DF -> 59.94 DF frames 04 and 05 (0-3 are dropped)
    expect(displayText({ count: end + 1, sub: 0 }, R2997DF, true)).toBe("00:01:00;04");
    expect(displayText({ count: end + 1, sub: 1 }, R2997DF, true)).toBe("00:01:00;05");
    const tenth = tcToCount({ h: 0, m: 10, s: 0, f: 0 }, R2997DF);
    expect(displayText({ count: tenth, sub: 0 }, R2997DF, true)).toBe("00:10:00;00");
  });
  it("59.94 DF stays in step with real time for an hour (1 frame = 1/59.94 s)", () => {
    // 1 h of 59.94 DF = 215784 frames = 107892 pairs; the label should read 01:00:00;00
    const pairs = 107892;
    expect(displayText({ count: pairs, sub: 0 }, R2997DF, true)).toBe("01:00:00;00");
    expect(displayText({ count: pairs - 1, sub: 1 }, R2997DF, true)).toBe("00:59:59;59");
  });
  it("applies trim in displayed frames (±1 true frame at x2)", () => {
    const c = tcToCount({ h: 0, m: 0, s: 5, f: 3 }, R30);
    expect(displayText({ count: c, sub: 0 }, R30, true, 1)).toBe("00:00:05:07");
    expect(displayText({ count: c, sub: 0 }, R30, true, -1)).toBe("00:00:05:05");
    expect(displayText({ count: 0, sub: 0 }, R30, true, -1)).toBe("23:59:59:59");
  });
  it("labels", () => {
    expect(rateParts(R30, true)).toEqual({ num: "60", df: false });
    expect(rateParts(R2997, true)).toEqual({ num: "59.94", df: false });
    expect(rateParts(R2997DF, true)).toEqual({ num: "59.94", df: true });
    expect(rateParts(R2997DF, false)).toEqual({ num: "29.97", df: true });
    expect(rateParts(R25, true)).toEqual({ num: "25", df: false });
  });
  it("sub-frame flips half a pair after the word arrives", () => {
    expect(subFrameSince(1000, 1000, R30)).toBe(0);
    expect(subFrameSince(1000, 1000 + 1000 / 60 - 1, R30)).toBe(0);
    expect(subFrameSince(1000, 1000 + 1000 / 60 + 1, R30)).toBe(1);
  });
  it("free-run position alternates 0/1 at the true 59.94 rate", () => {
    const j: JamRecord = { v: 1, sourceId: "x", ...R2997DF, anchorWallMs: 0, anchorCount: tcToCount({ h: 0, m: 0, s: 59, f: 0 }, R2997DF), jammedAtMs: 0, frames: 60, spreadMs: 1 };
    const seen = new Set<string>();
    for (let t = 0; t < 3000; t += 2) { const p = jamPosition(j, t); seen.add(displayText(p, R2997DF, true)); }
    // 3 s at 59.94 fps = ~180 distinct frame labels; none of the dropped ones
    expect(seen.size).toBeGreaterThanOrEqual(178);
    expect(seen.size).toBeLessThanOrEqual(182);
    for (const dropped of ["00:01:00;00", "00:01:00;01", "00:01:00;02", "00:01:00;03"]) expect(seen.has(dropped)).toBe(false);
    expect(seen.has("00:01:00;04")).toBe(true);
    expect(displayFields(jamPosition(j, 0), R2997DF, true).f).toBe(0);
  });
});
