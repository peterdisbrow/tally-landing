import { describe, expect, it } from "vitest";
import { generateLtc } from "@/test/ltcGenerator";
import { biquad, gain, gaussNoise, hum, offset, resample, softClip } from "@/test/ltcImpair";
import { LtcDecoder } from "../../../public/ltc-worklet.js";

/**
 * "Real hardware" robustness: the same LTC, but degraded the way a TC-1 -> cable -> audio interface ->
 * Chrome chain degrades it (band-limiting, AC coupling, hum, noise, low level, inversion, 44.1 kHz...).
 */
type F = { h: number; m: number; s: number; f: number; rateLocked: boolean; fpsLabel: string | null };
function run(x: Float32Array, sr = 48000, block = 128) {
  const frames: F[] = [];
  const dec = new LtcDecoder(sr, (f: F) => frames.push({ ...f }));
  let last: ReturnType<LtcDecoder["takeLevel"]> | null = null;
  for (let i = 0; i < x.length; i += block) { dec.push(x.subarray(i, Math.min(i + block, x.length))); }
  last = dec.takeLevel();
  return { frames, dec, last };
}
const sig = (o: { fps?: number; nominal?: number; sr?: number; seconds?: number; drop?: boolean } = {}) =>
  generateLtc({ fps: o.fps ?? 30, nominal: o.nominal ?? 30, drop: o.drop, sampleRate: o.sr ?? 48000, seconds: o.seconds ?? 6, amplitude: 0.5, start: [1, 0, 0, 0] });
const expectFrames = (n: number, fps: number, secs: number, loss = 0.1) => expect(n).toBeGreaterThanOrEqual(Math.floor(fps * (secs - 0.4) * (1 - loss)));

const CASES: Array<[string, () => Float32Array, number?]> = [
  ["polarity inverted", () => gain(sig(), -1)],
  ["low level -40 dBFS", () => gain(sig(), 0.02)],
  ["very low level -50 dBFS (mic-level out into a line input)", () => gain(sig(), 0.006)],
  ["DC offset 0.3", () => offset(sig(), 0.3)],
  ["band-limited square (3 kHz LP)", () => biquad(sig(), "lp", 3000, 48000)],
  ["slow edges (1.5 kHz LP)", () => biquad(sig(), "lp", 1500, 48000)],
  ["AC-coupled (200 Hz HP)", () => biquad(sig(), "hp", 200, 48000)],
  ["AC-coupled heavily (500 Hz HP)", () => biquad(sig(), "hp", 500, 48000)],
  ["mic-like (100 Hz HP + 5 kHz LP)", () => biquad(biquad(sig(), "hp", 100, 48000), "lp", 5000, 48000)],
  ["noise 20 dB SNR", () => gaussNoise(sig(), 0.5 / 10 / 1.4)],
  ["noise 10 dB SNR", () => gaussNoise(sig(), 0.5 / 3.2 / 1.4)],
  ["60 Hz hum at 40% of signal", () => hum(sig(), 0.2, 60, 48000)],
  ["60 Hz hum at 100% of signal", () => hum(sig(), 0.5, 60, 48000)],
  ["50 Hz hum at 100% of signal", () => hum(sig(), 0.5, 50, 48000)],
  ["hard-clipped / overdriven", () => softClip(sig(), 8)],
  ["resampled to 44.1 kHz by the browser", () => resample(sig(), 48000, 44100), 44100],
  ["generated at 44.1 kHz", () => sig({ sr: 44100 }), 44100],
  ["96 kHz interface", () => sig({ sr: 96000 }), 96000],
  ["quiet + noisy line", () => gaussNoise(gain(sig(), 0.05), 0.003)],
  ["mild ringing / overshoot (resonant LP, Q 1)", () => biquad(sig(), "lp", 3500, 48000, 1)],
  ["29.97 DF, 44.1 kHz, -30 dB, 2 kHz LP", () => gain(biquad(resample(sig({ fps: 30000 / 1001, drop: true }), 48000, 44100), "lp", 2000, 44100), 0.03), 44100],
];

describe("LTC decoder survives realistic signal damage", () => {
  for (const [name, make, sr] of CASES) {
    it(name, () => {
      const { frames } = run(make(), sr ?? 48000);
      expectFrames(frames.length, 30, 6, 0.15);
      // and every decoded frame must be right (no wrong digits slipping through)
      const toN = (x: F) => ((x.h * 60 + x.m) * 60 + x.s) * 30 + x.f;
      let wrong = 0;
      for (let i = 1; i < frames.length; i++) if (toN(frames[i]) - toN(frames[i - 1]) !== 1) wrong++;
      expect(wrong).toBeLessThanOrEqual(2);
    });
  }

  it("locks the frame rate (so Jam can be pressed) on a damaged signal, 23.98 and 25 too", () => {
    for (const fps of [24000 / 1001, 25]) {
      const x = biquad(gaussNoise(gain(biquad(sig({ fps, nominal: Math.round(fps) }), "hp", 150, 48000), 0.1), 0.004), "lp", 3500, 48000);
      const { frames } = run(x);
      expect(frames.at(-1)?.rateLocked).toBe(true);
    }
  });

  it("only one stereo channel carries LTC (other silent / noise): decoded on that channel only", () => {
    const l = sig(), r = gaussNoise(new Float32Array(l.length), 0.001);
    const counts = [0, 0];
    const decs = [0, 1].map((c) => new LtcDecoder(48000, () => { counts[c]++; }));
    for (let i = 0; i < l.length; i += 128) { decs[0].push(l.subarray(i, i + 128)); decs[1].push(r.subarray(i, i + 128)); }
    expect(counts[0]).toBeGreaterThan(150);
    expect(counts[1]).toBe(0);
  });

  it("balanced output: L = +LTC and R = -LTC both decode; a mono SUM would cancel (so channels are never summed)", () => {
    const l = sig(), r = gain(l, -1);
    const sum = l.map((v, i) => v + r[i]);
    expect(run(sum).frames.length).toBe(0);
    expect(run(l).frames.length).toBeGreaterThan(150);
    expect(run(r).frames.length).toBeGreaterThan(150);
  });

  it("does not invent timecode from noise, speech-like audio or silence", () => {
    const noise = gaussNoise(new Float32Array(48000 * 6), 0.2);
    const speechy = new Float32Array(48000 * 6).map((_, i) => 0.4 * Math.sin(i * 0.05 * (1 + 0.5 * Math.sin(i * 1e-4))) * Math.abs(Math.sin(i * 3e-4)));
    expect(run(noise).frames.length).toBe(0);
    expect(run(speechy).frames.length).toBe(0);
    expect(run(new Float32Array(48000 * 3)).frames.length).toBe(0);
    expect(run(gaussNoise(new Float32Array(48000 * 3), 0.0003)).frames.length).toBe(0); // dither-level noise
  });

  it("wrong bits never become a wrong time: an extreme ringing signal decodes nothing rather than garbage", () => {
    const { frames } = run(biquad(sig(), "lp", 2600, 48000, 3));
    const toN = (x: F) => ((x.h * 60 + x.m) * 60 + x.s) * 30 + x.f;
    for (let i = 1; i < frames.length; i++) expect(toN(frames[i]) - toN(frames[i - 1])).toBeLessThanOrEqual(3);
    for (const f of frames) expect(f.h).toBe(1);
  });

  it("a timecode jump (TC-1 re-jammed / restarted) is accepted after two consistent frames", () => {
    const a = sig({ seconds: 2 }), b = generateLtc({ fps: 30, nominal: 30, seconds: 2, start: [5, 4, 3, 2], amplitude: 0.5 });
    const x = new Float32Array(a.length + b.length); x.set(a); x.set(b, a.length);
    const { frames } = run(x);
    expect(frames.some((f) => f.h === 5 && f.m === 4)).toBe(true);
    expect(frames.filter((f) => f.h === 1).length).toBeGreaterThan(50);
  });

  it("recovers after a loud burst/click then a quiet LTC", () => {
    const x = gain(sig({ seconds: 8 }), 0.03);
    for (let i = 0; i < 24000; i++) x[i] = Math.sin(i * 0.37) * Math.sin(i * 0.011) * 0.9;
    expect(run(x).frames.length).toBeGreaterThan(30 * 3);
  });
});

describe("decoder diagnostics (counters + cadence)", () => {
  it("clean LTC: steady cadence, bit rate ≈ 80 × fps, sync words counted, frames counted", () => {
    const { last } = run(sig({ seconds: 3 }));
    expect(last.diag.cadence).toBeGreaterThan(0.95);
    expect(Math.abs(last.diag.bitRate - 2400)).toBeLessThan(15);
    expect(last.diag.syncs).toBeGreaterThan(60);
    expect(last.diag.frames).toBe(last.diag.syncs - 1); // the first frame waits for a 2nd consistent one
    expect(last.diag.bad).toBe(0);
    expect(last.squareness).toBeGreaterThan(0.6);
  });
  it("reports the real bit rate for 23.98 / 25 / 29.97", () => {
    for (const [fps, nom] of [[24000 / 1001, 24], [25, 25], [30000 / 1001, 30]] as const) {
      const { last } = run(sig({ fps, nominal: nom, seconds: 3 }));
      expect(Math.abs(last.diag.bitRate - fps * 80) / (fps * 80)).toBeLessThan(0.01);
    }
  });
  it("a 60 fps-rate (4800 b/s) signal is seen as a steady signal at ~4800 b/s but is not decoded", () => {
    const { last, frames } = run(sig({ fps: 60, seconds: 3 }));
    expect(frames.length).toBe(0);
    expect(last.diag.cadence).toBeGreaterThan(0.8);
    expect(last.diag.bitRate).toBeGreaterThan(4500);
    expect(last.diag.bitRate).toBeLessThan(5100);
  });
  it("speech-like / noise audio has low cadence and low squareness", () => {
    const { last } = run(gaussNoise(new Float32Array(48000 * 3), 0.2));
    expect(last.diag.cadence).toBeLessThan(0.55);
    expect(last.squareness).toBeLessThan(0.5);
  });
  it("sync word with impossible digits counts as 'bad', not as a frame", () => {
    // 89:99:99:99 BCD is not a valid time; build a frame with hours = 39
    const x = generateLtc({ fps: 30, nominal: 30, seconds: 3, start: [39 as unknown as number, 0, 0, 0] });
    const { last, frames } = run(x);
    expect(frames.length).toBe(0);
    expect(last.diag.syncs).toBeGreaterThan(50);
    expect(last.diag.bad).toBe(last.diag.syncs);
  });
});
