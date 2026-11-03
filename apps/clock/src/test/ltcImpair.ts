/** Test-only signal impairments to make generated LTC look like what real hardware/Chrome delivers. */
export function biquad(x: Float32Array, type: "lp" | "hp", f0: number, sr: number, q = Math.SQRT1_2): Float32Array {
  const w = (2 * Math.PI * f0) / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; } else { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  const out = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0 * 1; // eslint-disable-line
    const yy = (b0 / a0) * x[i] + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2; void y;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = yy; out[i] = yy;
  }
  return out;
}
export function gain(x: Float32Array, g: number): Float32Array { return x.map((v) => v * g); }
export function offset(x: Float32Array, dc: number): Float32Array { return x.map((v) => v + dc); }
export function gaussNoise(x: Float32Array, sigma: number, seed = 7): Float32Array {
  let s = seed >>> 0; const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s + 1) / 4294967297; };
  return x.map((v) => v + sigma * Math.sqrt(-2 * Math.log(r())) * Math.cos(2 * Math.PI * r()));
}
export function hum(x: Float32Array, amp: number, hz: number, sr: number): Float32Array { return x.map((v, i) => v + amp * Math.sin((2 * Math.PI * hz * i) / sr)); }
export function softClip(x: Float32Array, drive: number): Float32Array { return x.map((v) => Math.tanh(v * drive) / Math.tanh(drive)); }
/** Resample with a short windowed-sinc (good enough to be a realistic sample-rate-converter). */
export function resample(x: Float32Array, from: number, to: number): Float32Array {
  const n = Math.floor((x.length * to) / from), out = new Float32Array(n), ratio = from / to, cut = Math.min(1, to / from), hw = 16;
  for (let i = 0; i < n; i++) {
    const c = i * ratio; let acc = 0; const i0 = Math.floor(c);
    for (let k = i0 - hw + 1; k <= i0 + hw; k++) {
      if (k < 0 || k >= x.length) continue;
      const t = c - k, a = Math.PI * t * cut;
      const sinc = Math.abs(t) < 1e-9 ? 1 : Math.sin(a) / a;
      const win = 0.5 * (1 + Math.cos((Math.PI * t) / hw));
      acc += x[k] * sinc * win * cut;
    }
    out[i] = acc;
  }
  return out;
}
/** Fast, slightly slower than real: crystal error in ppm applied by resampling. */
export const ppm = (x: Float32Array, p: number) => resample(x, 48000, 48000 * (1 + p * 1e-6));
