import { describe, expect, it } from "vitest";
import { diagnose, diagLines, inputLine, type ChannelDiag, type LtcDiag } from "./diagnose";

const ch = (o: Partial<ChannelDiag> = {}): ChannelDiag => ({ peak: 0.3, squareness: 0.95, edgesPerSec: 4700, syncsPerSec: 0, badPerSec: 0, resetsPerSec: 0, framesPerSec: 0, cadence: 0.97, bitRate: 2400, ...o });
const d = (channels: ChannelDiag[], totals = {}): LtcDiag => ({ channels, totals: { edges: 0, syncs: 0, bad: 0, resets: 0, frames: 0, ...totals }, input: null });

describe("diagnose()", () => {
  it("not listening", () => expect(diagnose(d([]), false).code).toBe("idle"));
  it("silent input", () => expect(diagnose(d([ch({ peak: 0.0002 })]), true).code).toBe("silent"));
  it("level but no edges (DC / hum)", () => expect(diagnose(d([ch({ edgesPerSec: 20, cadence: 0 })]), true).code).toBe("no-edges"));
  it("wrong input: audio that isn't a steady biphase signal", () => {
    const v = diagnose(d([ch({ edgesPerSec: 900, cadence: 0.2, bitRate: null, squareness: 0.2 })]), true);
    expect(v.code).toBe("not-ltc"); expect(v.hint).toMatch(/wrong input/i);
  });
  it("signal at 4800 b/s: faster than 30 fps, points at 29.97/30 + the x2 setting", () => {
    const v = diagnose(d([ch({ bitRate: 4797 })]), true);
    expect(v.code).toBe("too-fast"); expect(v.text).toMatch(/59\.9|60/); expect(v.hint).toMatch(/29\.97/); 
  });
  it("slow signal", () => expect(diagnose(d([ch({ bitRate: 1200 })]), true).code).toBe("too-slow"));
  it("steady LTC-like signal but no sync words", () => {
    const v = diagnose(d([ch()]), true);
    expect(v.code).toBe("no-sync"); expect(v.text).toMatch(/2400 bits\/s/); expect(v.text).toMatch(/30 fps/);
  });
  it("sync words but invalid digits", () => expect(diagnose(d([ch({ syncsPerSec: 30, badPerSec: 30 })], { syncs: 90, bad: 90 }), true).code).toBe("bad-digits"));
  it("ok when any channel decodes frames; picks the channel that decodes", () => {
    const v = diagnose(d([ch({ peak: 0.001, cadence: 0 }), ch({ framesPerSec: 30, syncsPerSec: 30 })]), true);
    expect(v.code).toBe("ok");
  });
  it("one dead channel + one wrong-rate channel reports the live one, not 'silent'", () => {
    expect(diagnose(d([ch({ peak: 0 , cadence: 0, edgesPerSec: 0 }), ch({ bitRate: 4800 })]), true).code).toBe("too-fast");
  });
  it("formats compact lines", () => {
    const l = diagLines(d([ch({ peak: 0.316 }), ch({ peak: 0 })]));
    expect(l[0]).toMatch(/^L -10 dB · 4700 edges\/s · 97% steady · 2400 b\/s \(30 fps\)/);
    expect(l[1]).toMatch(/^R -∞ dB/);
    expect(inputLine({ label: "MacBook Pro Microphone", sampleRate: 48000, channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: true })).toBe("MacBook Pro Microphone · 48000 Hz · 1 ch · echo off · noise-sup off · AGC ON");
  });
});
