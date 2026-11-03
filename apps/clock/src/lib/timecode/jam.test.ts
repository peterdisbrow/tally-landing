import { beforeEach, describe, expect, it } from "vitest";
import { JAM_STORAGE_KEY, JamCollector, jamCount, jamStore, parseJam, type JamRecord, type JamSample } from "./jam";
import { advanceCount, countToTc, formatTc, tcToCount, type TcRate } from "./timecode";

const R: TcRate = { nominal: 24, fps: 24000 / 1001, drop: false };
const DF: TcRate = { nominal: 30, fps: 30000 / 1001, drop: true };

/** Frame i of a clean stream starting at count c0, arriving at t0 + i/fps (+ jitter). */
function stream(rate: TcRate, c0: number, t0: number, n: number, jitter = (i: number) => 0): JamSample[] {
  return Array.from({ length: n }, (_, i) => ({
    count: advanceCount(c0, i, rate), rate, rateLocked: true, wallMs: t0 + (i * 1000) / rate.fps + jitter(i),
  }));
}
const feed = (c: JamCollector, ss: JamSample[]) => { let last; for (const s of ss) last = c.push(s); return last!; };

describe("JamCollector", () => {
  it("needs several seconds of consecutive frames", () => {
    const c = new JamCollector();
    const p = feed(c, stream(R, 1000, 5000, 40));
    expect(p.state).toBe("collecting");
    const done = feed(new JamCollector(), stream(R, 1000, 5000, 100));
    expect(done.state).toBe("done");
  });
  it("anchors the jam to the stream despite arrival jitter (median)", () => {
    const j = (i: number) => (i % 9 === 0 ? 30 : (i % 4) - 1.5); // a few late messages
    const done = feed(new JamCollector(), stream(R, 5000, 100_000, 120, j));
    if (done.state !== "done") throw new Error("not done");
    expect(done.record.anchorCount).toBe(5000);
    expect(Math.abs(done.record.anchorWallMs - 100_000)).toBeLessThan(5);
    expect(done.record.frames).toBeGreaterThanOrEqual(48);
  });
  it("throws the run away on a gap, a repeat, a rate change or an unlocked frame", () => {
    const c = new JamCollector();
    const a = stream(R, 100, 0, 60);
    feed(c, a);
    // gap
    let p = c.push({ count: advanceCount(100, 61, R), rate: R, rateLocked: true, wallMs: 3000 });
    expect(p.state === "collecting" && p.frames).toBe(1);
    // repeat
    p = c.push({ count: advanceCount(100, 61, R), rate: R, rateLocked: true, wallMs: 3050 });
    expect(p.state === "collecting" && p.frames).toBe(1);
    // rate change
    p = c.push({ count: advanceCount(100, 62, R), rate: { ...R, nominal: 25, fps: 25 }, rateLocked: true, wallMs: 3090 });
    expect(p.state === "collecting" && p.frames).toBe(1);
    // unlocked
    p = c.push({ count: 5, rate: R, rateLocked: false, wallMs: 3130 });
    expect(p.state === "collecting" && p.frames).toBe(0);
    expect(c.restarts).toBe(4);
  });
  it("handles drop-frame streams across minute boundaries", () => {
    const c0 = tcToCount({ h: 0, m: 0, s: 59, f: 0 }, DF);
    const done = feed(new JamCollector(), stream(DF, c0, 0, 120));
    expect(done.state).toBe("done");
  });
});

describe("free-run", () => {
  const rec = (over: Partial<JamRecord> = {}): JamRecord => ({
    v: 1, sourceId: "deity-tc1-ltc", ...R, anchorWallMs: 1_000_000, anchorCount: tcToCount({ h: 1, m: 0, s: 0, f: 0 }, R),
    jammedAtMs: 1_003_000, frames: 70, spreadMs: 4, ...over,
  });
  it("keeps counting from the wall clock after the signal is gone", () => {
    const j = rec();
    expect(formatTc(countToTc(jamCount(j, 1_000_000), R), false)).toBe("01:00:00:00");
    // 10 s later at 23.976 fps = 239.76 frames -> 239 -> 01:00:09:23
    expect(formatTc(countToTc(jamCount(j, 1_010_000), R), false)).toBe("01:00:09:23");
    // 10 min of wall time = 14385 frames at 23.976 -> 599.4 s of timecode
    expect(formatTc(countToTc(jamCount(j, 1_000_000 + 600_000), R), false)).toBe("01:09:59:09");
  });
  it("free-runs correctly in drop-frame", () => {
    const c0 = tcToCount({ h: 0, m: 0, s: 59, f: 0 }, DF);
    const j = rec({ ...DF, anchorCount: c0 });
    expect(formatTc(countToTc(jamCount(j, 1_000_000 + 1050), DF), true)).toBe("00:01:00;03");
  });
});

describe("persistence", () => {
  beforeEach(() => { localStorage.clear(); jamStore._reloadFromStorage(); });
  const rec: JamRecord = { v: 1, sourceId: "deity-tc1-ltc", ...R, anchorWallMs: 123, anchorCount: 9, jammedAtMs: 456, frames: 60, spreadMs: 2 };
  it("survives a reload (new in-memory state, same localStorage)", () => {
    jamStore.set(rec); jamStore.setTrim("deity-tc1-ltc", -1);
    jamStore._reloadFromStorage();
    expect(jamStore.get("deity-tc1-ltc")).toEqual(rec);
    expect(jamStore.trim("deity-tc1-ltc")).toBe(-1);
  });
  it("clears", () => {
    jamStore.set(rec); jamStore.clear("deity-tc1-ltc");
    jamStore._reloadFromStorage();
    expect(jamStore.get("deity-tc1-ltc")).toBeNull();
  });
  it("ignores corrupt or tampered data", () => {
    localStorage.setItem(JAM_STORAGE_KEY, "{nope");
    jamStore._reloadFromStorage();
    expect(jamStore.get("deity-tc1-ltc")).toBeNull();
    localStorage.setItem(JAM_STORAGE_KEY, JSON.stringify({ jams: { "deity-tc1-ltc": { ...rec, fps: 500 } }, trim: { "deity-tc1-ltc": 999 } }));
    jamStore._reloadFromStorage();
    expect(jamStore.get("deity-tc1-ltc")).toBeNull();
    expect(jamStore.trim("deity-tc1-ltc")).toBe(10);
    expect(parseJam({ ...rec, nominal: 50 }, "deity-tc1-ltc")).toBeNull();
    expect(parseJam(rec, "other-source")).toBeNull();
  });
  it("notifies subscribers (other cells) on change", () => {
    let n = 0; const off = jamStore.subscribe(() => n++);
    jamStore.set(rec); jamStore.clear("deity-tc1-ltc"); off();
    expect(n).toBe(2);
  });
});
