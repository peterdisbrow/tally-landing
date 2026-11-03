/**
 * Source-agnostic SMPTE timecode math. Nothing here knows where the timecode
 * came from (LTC audio, MIDI MTC, network, ...), so new sources only have to
 * produce a `TcRate` + a frame count.
 *
 * A "count" is the absolute frame number since 00:00:00:00 (drop-frame aware),
 * wrapped at 24 hours.
 */

export type TcRate = {
  nominal: number; // frame numbering base: 24, 25 or 30
  fps: number;     // true rate, e.g. 24000/1001
  drop: boolean;   // 29.97 drop-frame numbering
};

export type TcFields = { h: number; m: number; s: number; f: number };

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function framesPerDay(r: TcRate): number {
  // 29.97 DF drops 2 frames every minute except each 10th: 107892 frames/hour.
  return r.drop && r.nominal === 30 ? 107892 * 24 : r.nominal * 86400;
}

export function tcToCount(t: TcFields, r: TcRate): number {
  const n = r.nominal;
  const totalMinutes = t.h * 60 + t.m;
  let c = ((t.h * 60 + t.m) * 60 + t.s) * n + t.f;
  if (r.drop && n === 30) c -= 2 * (totalMinutes - Math.floor(totalMinutes / 10));
  return mod(c, framesPerDay(r));
}

export function countToTc(count: number, r: TcRate): TcFields {
  let c = mod(Math.floor(count), framesPerDay(r));
  const n = r.nominal;
  if (r.drop && n === 30) {
    const d = Math.floor(c / 17982);
    const m = c % 17982;
    c += 18 * d + (m < 2 ? 0 : 2 * Math.floor((m - 2) / 1798));
  }
  return {
    f: c % n,
    s: Math.floor(c / n) % 60,
    m: Math.floor(c / (n * 60)) % 60,
    h: Math.floor(c / (n * 3600)) % 24,
  };
}

export function advanceCount(count: number, frames: number, r: TcRate): number {
  return mod(count + frames, framesPerDay(r));
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatTc(t: TcFields, drop: boolean): string {
  return `${pad2(t.h)}:${pad2(t.m)}:${pad2(t.s)}${drop ? ";" : ":"}${pad2(t.f)}`;
}

export function rateLabel(r: TcRate): string {
  if (r.nominal === 24) return Math.abs(r.fps - 24) < 0.01 ? "24" : "23.98";
  if (r.nominal === 25) return "25";
  if (r.nominal === 30) return Math.abs(r.fps - 30) < 0.01 ? "30" : r.drop ? "29.97 DF" : "29.97";
  return r.fps.toFixed(2);
}

export function sameRate(a: TcRate, b: TcRate): boolean {
  return a.nominal === b.nominal && a.drop === b.drop && Math.abs(a.fps - b.fps) / b.fps < 0.001;
}

/**
 * LTC latency fix. An LTC word is only complete (and only decodable) once its last
 * bit has arrived, which is exactly when the NEXT frame starts. So at the moment
 * a word is decoded, the current frame is the decoded one + 1.
 */
export const LTC_DECODE_LATENCY_FRAMES = 1;

export function formatAge(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}
