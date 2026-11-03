/**
 * Test-only LTC signal generator (biphase-mark, 80 bits/frame).
 * Produces float samples (and 16-bit WAV bytes) at an exact, possibly
 * fractional, bit rate, so 23.976 really differs from 24 on the wire.
 */
export type LtcGenOptions = {
  fps: number;          // true frame rate, e.g. 24000/1001
  nominal: number;      // frame numbering base: 24, 25 or 30
  drop?: boolean;       // set the DF flag and skip frames 0,1 at minute starts (not %10)
  sampleRate?: number;
  seconds: number;
  start?: [number, number, number, number]; // h, m, s, f
  amplitude?: number;
  dc?: number;
  noise?: number;       // uniform noise amplitude (peak)
  leadSilence?: number; // seconds of silence first
  lowpass?: number;     // 0..1 smoothing of the square wave (1 = none)
};

export function frameBits(h: number, m: number, s: number, f: number, drop: boolean): number[] {
  const bits = new Array(80).fill(0);
  const put = (start: number, len: number, val: number) => { for (let i = 0; i < len; i++) bits[start + i] = (val >> i) & 1; };
  put(0, 4, f % 10); put(8, 2, Math.floor(f / 10));
  bits[10] = drop ? 1 : 0;
  put(16, 4, s % 10); put(24, 3, Math.floor(s / 10));
  put(32, 4, m % 10); put(40, 3, Math.floor(m / 10));
  put(48, 4, h % 10); put(56, 2, Math.floor(h / 10));
  const sync = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1];
  for (let i = 0; i < 16; i++) bits[64 + i] = sync[i];
  // biphase-mark polarity bit (27) keeps the number of transitions per frame even
  // (not needed for decoding; included for realism)
  const ones = bits.reduce((a, b) => a + b, 0);
  if (ones % 2 === 1) bits[27] = 1;
  return bits;
}

export function generateLtc(o: LtcGenOptions): Float32Array {
  const sr = o.sampleRate ?? 48000;
  const amp = o.amplitude ?? 0.5;
  const total = Math.round(o.seconds * sr);
  const out = new Float32Array(total);
  const lead = Math.round((o.leadSilence ?? 0) * sr);
  let [h, m, s, f] = o.start ?? [1, 0, 0, 0];
  const bitDur = sr / (o.fps * 80);
  let level = 1;
  let t = lead; // fractional sample position of the next bit start
  let rng = 12345;
  const rand = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296 - 0.5; };
  const edges: Array<[number, number]> = []; // [position, level after]
  while (t < total) {
    const bits = frameBits(h, m, s, f, !!o.drop);
    for (let b = 0; b < 80; b++) {
      level = -level; edges.push([t, level]);
      if (bits[b]) { level = -level; edges.push([t + bitDur / 2, level]); }
      t += bitDur;
    }
    f++;
    if (f >= o.nominal) { f = 0; s++; if (s >= 60) { s = 0; m++; if (m >= 60) { m = 0; h = (h + 1) % 24; } } }
    if (o.drop && f === 0 && s === 0 && m % 10 !== 0) f = 2;
  }
  let e = 0; let cur = -1; let y = 0;
  const a = o.lowpass ?? 1;
  for (let i = lead; i < total; i++) {
    while (e < edges.length && edges[e][0] <= i) { cur = edges[e][1]; e++; }
    y += a * (cur - y);
    out[i] = y * amp + (o.dc ?? 0) + (o.noise ? rand() * 2 * o.noise : 0);
  }
  return out;
}

export function toWav16(samples: Float32Array, sampleRate = 48000): Uint8Array {
  const buf = new Uint8Array(44 + samples.length * 2);
  const dv = new DataView(buf.buffer);
  const w = (o: number, str: string) => { for (let i = 0; i < str.length; i++) dv.setUint8(o + i, str.charCodeAt(i)); };
  w(0, "RIFF"); dv.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, sampleRate, true); dv.setUint32(28, sampleRate * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  w(36, "data"); dv.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    dv.setInt16(44 + i * 2, Math.round(v * 32767), true);
  }
  return buf;
}
