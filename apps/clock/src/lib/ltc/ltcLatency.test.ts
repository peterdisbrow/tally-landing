import { describe, expect, it } from "vitest";
import { generateLtc } from "@/test/ltcGenerator";
import { LtcDecoder } from "../../../public/ltc-worklet.js";
import { ltcFrameToTimecode } from "./ltcToTimecode";
import { countToTc, formatTc } from "../timecode/timecode";
import type { LtcFrame } from "./useLtcInput";

/**
 * Why the clock adds one frame to every decoded LTC word: a word is only complete
 * (so only decodable) when the next frame starts. Prove it on a generated signal
 * whose frame boundaries are known exactly.
 */
describe("LTC decode latency (the ~1 frame lag)", () => {
  const cases = [
    { name: "23.98", fps: 24000 / 1001, nominal: 24, drop: false },
    { name: "25", fps: 25, nominal: 25, drop: false },
    { name: "29.97 DF", fps: 30000 / 1001, nominal: 30, drop: true },
  ];
  for (const c of cases) {
    it(`${c.name}: frame N is reported when frame N+1 starts, so +1 gives the current frame`, () => {
      const sr = 48000;
      const lead = 0.25;
      const samples = generateLtc({ fps: c.fps, nominal: c.nominal, drop: c.drop, seconds: 5, start: [1, 0, 0, 0], leadSilence: lead, sampleRate: sr });
      const frameSamples = sr / c.fps;
      const events: { at: number; frame: LtcFrame }[] = [];
      const d = new LtcDecoder(sr, (f: LtcFrame) => events.push({ at: d.pos, frame: { ...f } }));
      for (let i = 0; i < samples.length; i += 128) d.push(samples.subarray(i, Math.min(i + 128, samples.length)));
      const locked = events.filter((e) => e.frame.rateLocked);
      expect(locked.length).toBeGreaterThan(c.fps * 3);
      let checked = 0;
      for (const e of locked) {
        // Frame index (0 = 01:00:00:00) as decoded, rate-aware
        const tc = ltcFrameToTimecode(e.frame);
        const decodedIdx = tc.count - (c.drop ? 107892 : c.nominal * 3600) - 1; // undo the +1 and the 01:00:00:00 offset
        const startOfNextFrame = lead * sr + (decodedIdx + 1) * frameSamples;
        // decode event happens at (or within a couple of bit periods of) the start of the next frame
        expect(Math.abs(e.at - startOfNextFrame)).toBeLessThan(frameSamples * 0.05);
        checked++;
      }
      expect(checked).toBeGreaterThan(0);
    });
  }

  it("adds exactly one frame once the rate is locked, across a drop-frame minute", () => {
    const f = (o: Partial<LtcFrame>): LtcFrame => ({ h: 0, m: 0, s: 59, f: 29, drop: true, fps: 30000 / 1001, fpsLabel: "29.97", nominalFps: 30, rateLocked: true, snapped: true, ...o });
    const tc = ltcFrameToTimecode(f({}));
    expect(formatTc(countToTc(tc.count, { nominal: 30, fps: tc.fps, drop: true }), true)).toBe("00:01:00;02");
    const raw = ltcFrameToTimecode(f({ rateLocked: false, fps: null, nominalFps: null, fpsLabel: null }));
    expect(raw.rateLocked).toBe(false);
  });
});
