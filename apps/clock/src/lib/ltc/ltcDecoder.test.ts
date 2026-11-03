import { describe, expect, it } from "vitest";
import { generateLtc } from "@/test/ltcGenerator";
import { LtcDecoder, snapFrameRate, formatTimecode } from "../../../public/ltc-worklet.js";

type Frame = { h: number; m: number; s: number; f: number; drop: boolean; fps: number; fpsLabel: string | null; rateLocked: boolean; nominalFps: number | null };

function decode(samples: Float32Array, sr = 48000, block = 128) {
  const frames: Frame[] = [];
  const d = new LtcDecoder(sr, (f: Frame) => frames.push({ ...f }));
  for (let i = 0; i < samples.length; i += block) d.push(samples.subarray(i, Math.min(i + block, samples.length)));
  return frames;
}

const RATES = [
  { name: "23.98", fps: 24000 / 1001, nominal: 24, drop: false, label: "23.98" },
  { name: "24", fps: 24, nominal: 24, drop: false, label: "24" },
  { name: "25", fps: 25, nominal: 25, drop: false, label: "25" },
  { name: "29.97 DF", fps: 30000 / 1001, nominal: 30, drop: true, label: "29.97" },
  { name: "30", fps: 30, nominal: 30, drop: false, label: "30" },
];

describe("LTC decoder", () => {
  for (const r of RATES) {
    it(`decodes ${r.name} and locks the frame rate to the real bit clock`, () => {
      const frames = decode(generateLtc({ fps: r.fps, nominal: r.nominal, drop: r.drop, seconds: 4, start: [1, 23, 45, 6] }));
      expect(frames.length).toBeGreaterThan(Math.floor(r.fps * 3.5));
      const last = frames[frames.length - 1];
      expect(last.rateLocked).toBe(true);
      expect(last.fpsLabel).toBe(r.label);
      expect(last.nominalFps).toBe(r.nominal);
      expect(last.drop).toBe(r.drop);
      expect(Math.abs(last.fps - r.fps) / r.fps).toBeLessThan(0.0002);
      // first frame is the one we started on (+/- the partial frame lost while locking)
      expect(frames[0].h).toBe(1); expect(frames[0].m).toBe(23);
      // timecode advances by exactly one frame each time (no skips or repeats)
      for (let i = 1; i < frames.length; i++) {
        const a = frames[i - 1], b = frames[i];
        const toN = (x: Frame) => ((x.h * 60 + x.m) * 60 + x.s) * r.nominal + x.f;
        expect(toN(b) - toN(a)).toBe(1);
      }
    });
  }

  it("23.98 and 24 are distinguished (the whole point)", () => {
    const a = decode(generateLtc({ fps: 24000 / 1001, nominal: 24, seconds: 3 })).pop()!;
    const b = decode(generateLtc({ fps: 24, nominal: 24, seconds: 3 })).pop()!;
    expect(a.fpsLabel).toBe("23.98");
    expect(b.fpsLabel).toBe("24");
  });

  it("29.97 drop-frame skips frames 00 and 01 at the minute and formats with a semicolon", () => {
    const frames = decode(generateLtc({ fps: 30000 / 1001, nominal: 30, drop: true, seconds: 3, start: [0, 0, 59, 25] }));
    const idx = frames.findIndex((x) => x.m === 1);
    expect(idx).toBeGreaterThan(0);
    expect(frames[idx - 1]).toMatchObject({ m: 0, s: 59, f: 29 });
    expect(frames[idx]).toMatchObject({ m: 1, s: 0, f: 2 });
    expect(formatTimecode(0, 1, 0, 2, true)).toBe("00:01:00;02");
    expect(formatTimecode(1, 2, 3, 4, false)).toBe("01:02:03:04");
  });

  it("works at 44.1 kHz and 96 kHz sample rates", () => {
    for (const sr of [44100, 96000]) {
      const last = decode(generateLtc({ fps: 25, nominal: 25, seconds: 3, sampleRate: sr }), sr).pop()!;
      expect(last.fpsLabel).toBe("25");
    }
  });

  it("tolerates DC offset, noise, soft edges and a low level", () => {
    const loud = generateLtc({ fps: 24000 / 1001, nominal: 24, seconds: 4, amplitude: 0.05, dc: 0.02, noise: 0.004, lowpass: 0.35 });
    const last = decode(loud).pop()!;
    expect(last.fpsLabel).toBe("23.98");
    expect(last.s).toBeGreaterThanOrEqual(3);
  });

  it("ignores leading silence, then locks; stays silent for non-LTC audio", () => {
    const frames = decode(generateLtc({ fps: 25, nominal: 25, seconds: 3, leadSilence: 1 }));
    expect(frames.length).toBeGreaterThan(40);
    const tone = new Float32Array(48000 * 2).map((_, i) => 0.5 * Math.sin((2 * Math.PI * 440 * i) / 48000));
    expect(decode(tone)).toHaveLength(0);
    expect(decode(new Float32Array(48000))).toHaveLength(0);
  });

  it("recovers after a dropout and restarts the rate measurement", () => {
    const sig = generateLtc({ fps: 30, nominal: 30, seconds: 5 });
    sig.fill(0, 48000, 48000 + 7000); // ~0.15 s gap
    const frames = decode(sig);
    const afterGap = frames.filter((_, i) => i > 40);
    expect(afterGap.length).toBeGreaterThan(30);
    expect(frames[frames.length - 1].fpsLabel).toBe("30");
  });

  it("snapFrameRate reports off-speed sources as measured instead of snapping", () => {
    expect(snapFrameRate(24.0, false).label).toBe("24");
    expect(snapFrameRate(23.976, false).label).toBe("23.98");
    expect(snapFrameRate(24.06, false)).toMatchObject({ snapped: false, label: "24.06" });
    expect(snapFrameRate(29.97, true)).toMatchObject({ label: "29.97", drop: true });
    expect(snapFrameRate(29.97, false)).toMatchObject({ label: "29.97", drop: false });
  });
});
