/*
 * LTC (SMPTE linear timecode) decoder + AudioWorklet processor.
 *
 * This file is deliberately dependency-free plain ES module JS and lives in
 * public/ so it is served same-origin (the site CSP has no blob: script-src,
 * and AudioWorklet modules are governed by script-src). It is used two ways:
 *   1. addModule("<base>/ltc-worklet.js") in the browser -> registers the
 *      "ltc-decoder" AudioWorkletProcessor.
 *   2. imported directly by unit tests (registerProcessor is guarded).
 *
 * LTC is biphase-mark coded, 80 bits per frame: every bit cell starts with a
 * transition, a "1" has an extra transition mid-cell. So edge-to-edge gaps are
 * T (a 0 bit) or T/2 (half of a 1 bit), where T is the bit period. We measure
 * T from the signal itself, so the decoder is frame-rate agnostic (it never
 * assumes 24/25/30) and the frame rate is derived from the real bit clock
 * (80 bits per frame), which is how 23.976 is told apart from 24.
 */

export const FRAME_BITS = 80;
const GAP_RING = 256;
// Lowest signal (peak, full scale = 1) the edge detector will look at: ~ -62 dBFS, so a mic-level TC-1 output
// into a line input still decodes. Noise this small can't make false timecode: a frame needs a valid 80-bit word.
const HP_HZ = 80;
export const EDGE_FLOOR = 0.0008;
// Sync word = bits 64..79 of the frame, transmitted in this order.
export const SYNC_WORD = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1];

export const NOMINAL_RATES = [
  { fps: 24000 / 1001, nominal: 24, label: "23.98", drop: false },
  { fps: 24, nominal: 24, label: "24", drop: false },
  { fps: 25, nominal: 25, label: "25", drop: false },
  { fps: 30000 / 1001, nominal: 30, label: "29.97", drop: false },
  { fps: 30, nominal: 30, label: "30", drop: false },
];

/**
 * Snap a measured frame rate to a standard one when it is within 0.04%
 * (half the gap between 23.976 and 24 is 0.05%). Anything else is reported
 * as measured, so a badly drifting source is visible rather than hidden.
 * `dropFlag` is the DF bit from the stream: it only labels 29.97.
 */
export function snapFrameRate(measured, dropFlag) {
  let best = null;
  let bestErr = Infinity;
  for (const r of NOMINAL_RATES) {
    const err = Math.abs(measured - r.fps) / r.fps;
    if (err < bestErr) { best = r; bestErr = err; }
  }
  if (best && bestErr <= 0.0004) {
    // 29.97 can be drop-frame or non-drop: the DF flag in the stream decides.
    const drop = best.fps === 30000 / 1001 ? !!dropFlag : false;
    return { fps: best.fps, nominal: best.nominal, label: best.label, drop, snapped: true };
  }
  return { fps: measured, nominal: Math.round(measured), label: measured.toFixed(2), drop: !!dropFlag, snapped: false };
}

/** The timecode that follows h:m:s:f (frame count `nominal` per second; drop-frame skips 00/01 at minutes not divisible by 10). */
export function nextTimecode(t, nominal, drop) {
  let { h, m, s, f } = t;
  f++;
  if (f >= nominal) { f = 0; s++; if (s >= 60) { s = 0; m++; if (m >= 60) { m = 0; h = (h + 1) % 24; } } }
  if (drop && f === 0 && s === 0 && m % 10 !== 0) f = 2;
  return { h, m, s, f };
}
const sameTc = (a, b) => a.h === b.h && a.m === b.m && a.s === b.s && a.f === b.f;

export function formatTimecode(h, m, s, f, drop) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}${drop ? ";" : ":"}${p(f)}`;
}

/** Decode the 80 bits (index 0 = first transmitted) into a timecode frame, or null if invalid. */
export function parseFrameBits(bits) {
  const v = (start, len) => {
    let n = 0;
    for (let i = 0; i < len; i++) n |= bits[start + i] << i;
    return n;
  };
  const f = v(0, 4) + v(8, 2) * 10;
  const s = v(16, 4) + v(24, 3) * 10;
  const m = v(32, 4) + v(40, 3) * 10;
  const h = v(48, 4) + v(56, 2) * 10;
  if (f > 29 || s > 59 || m > 59 || h > 23) return null;
  return { h, m, s, f, drop: bits[10] === 1, colorFrame: bits[11] === 1, userBits: [v(4, 4), v(12, 4), v(20, 4), v(28, 4), v(36, 4), v(44, 4), v(52, 4), v(60, 4)] };
}

export class LtcDecoder {
  /**
   * @param {number} sampleRate
   * @param {(frame: object) => void} onFrame called once per valid frame
   */
  constructor(sampleRate, onFrame) {
    this.sr = sampleRate;
    this.onFrame = onFrame;
    this.reset();
  }

  reset() {
    const sr = this.sr;
    this.T = sr / 2150; // start between 24 fps (1920 b/s) and 30 fps (2400 b/s)
    this.Tmin = sr / 2700;
    this.Tmax = sr / 1700;
    this.pos = 0; // absolute index of the next sample
    // DC blocker + zero-crossing / Schmitt trigger state
    this.hpX = 0; this.hpY = 0;
    this.peakEnv = 0;
    this.state = 0; // -1, 0, +1
    this.zcPos = null; // fractional position of the latest raw zero crossing
    this.prevY = 0;
    // biphase state
    this.lastEdge = null;
    this.pendingHalf = false;
    this.halfStart = 0;
    this.bits = new Uint8Array(FRAME_BITS);
    this.bitStarts = new Float64Array(FRAME_BITS);
    this.bitCount = 0;
    // frame-rate tracking (positions of consecutive sync words)
    this.syncPos = [];
    this.lastTc = null;      // last accepted timecode
    this.candTc = null;      // an unconfirmed frame (first after start / a jump / a bad run)
    this.fpsMeasured = null;
    this.lastFrame = null;
    // level metering (since last takeLevel)
    this.lvPeak = 0; this.lvSumSq = 0; this.lvN = 0;
    this.lvYSumSq = 0; this.lvYMax = 0; // DC-blocked signal, for the "is it a square wave?" check
    // diagnostics (counters since last takeLevel + a ring of recent edge-to-edge gaps)
    this.dg = { edges: 0, syncs: 0, bad: 0, resets: 0, frames: 0 };
    this.gaps = new Float32Array(GAP_RING);
    this.gapN = 0;
    this.hp2X = 0; this.hp2Y = 0;
  }

  /** Peak/RMS since last call (linear 0..1+), for the meter. */
  takeLevel() {
    const out = { peak: this.lvPeak, rms: this.lvN ? Math.sqrt(this.lvSumSq / this.lvN) : 0 };
    // rms/peak of the DC-blocked signal: ~1 for a square wave (LTC), ~0.1-0.3 for speech/room noise
    out.squareness = this.lvYMax > 0 && this.lvN ? Math.min(1, Math.sqrt(this.lvYSumSq / this.lvN) / this.lvYMax) : 0;
    out.diag = { ...this.dg, ...this.gapStats(), T: this.T, bitRateLocked: this.sr / this.T };
    this.lvPeak = 0; this.lvSumSq = 0; this.lvN = 0; this.lvYSumSq = 0; this.lvYMax = 0;
    this.dg = { edges: 0, syncs: 0, bad: 0, resets: 0, frames: 0 };
    return out;
  }

  /**
   * What the recent edge-to-edge gaps look like, independent of whether we are locked:
   * biphase-mark has only two gap lengths (T/2 and T, T = bit period), so a clean LTC signal
   * shows two tight clusters, one twice the other. `cadence` = share of gaps that fit that pattern,
   * `bitRate` = the bit rate they imply (b/s; LTC is 80 bits/frame, so fps = bitRate / 80).
   */
  gapStats() {
    const n = Math.min(this.gapN, GAP_RING);
    if (n < 24) return { cadence: 0, bitRate: null, gapSamples: n };
    const a = Array.from(this.gaps.subarray(0, n)).sort((x, y) => x - y);
    const at = (q) => a[Math.min(n - 1, Math.floor(q * n))];
    // Which gap length is the SHORT cluster (T/2)? Zero bits dominate most timecodes, so it can be a minority; try a few candidates and keep the best fit.
    let best = null;
    for (const c of [at(0.1), at(0.35), at(0.6), at(0.95) / 2]) {
      let fit = 0, nS = 0, nL = 0, sS = 0, sL = 0;
      for (const g of a) {
        if (Math.abs(g - c) < 0.2 * c) { fit++; nS++; sS += g; }
        else if (Math.abs(g - 2 * c) < 0.4 * c) { fit++; nL++; sL += g; }
      }
      if (!best || fit > best.fit) best = { fit, nS, nL, sS, sL };
    }
    const { fit, nS, nL, sS, sL } = best;
    const cadence = fit / n;
    // every bit cell = one long gap or two short gaps: T = total time / number of cells
    const bitRate = cadence > 0.7 && nL >= 3 && nS >= 3 ? this.sr / ((sS + sL) / (nS / 2 + nL)) : null;
    return { cadence, bitRate, gapSamples: n };
  }

  push(samples) {
    const hpA = 1 - 2 * Math.PI * HP_HZ / this.sr; // two cascaded one-pole high-passes (mains hum, DC, rumble)
    for (let i = 0; i < samples.length; i++) {
      const x = samples[i];
      const ax = Math.abs(x);
      if (ax > this.lvPeak) this.lvPeak = ax;
      this.lvSumSq += x * x; this.lvN++;
      const y1 = hpA * (this.hpY + x - this.hpX);
      this.hpX = x; this.hpY = y1;
      const y = hpA * (this.hp2Y + y1 - this.hp2X);
      this.hp2X = y1; this.hp2Y = y;
      const ay = Math.abs(y);
      this.lvYSumSq += y * y; if (ay > this.lvYMax) this.lvYMax = ay;
      this.peakEnv = ay > this.peakEnv ? ay : this.peakEnv * 0.99995;
      // raw zero crossing with linear interpolation (sub-sample edge time)
      const idx = this.pos;
      if ((this.prevY <= 0 && y > 0) || (this.prevY >= 0 && y < 0)) {
        const d = y - this.prevY;
        this.zcPos = d !== 0 ? idx - 1 + (-this.prevY) / d : idx;
      }
      // Schmitt trigger: ignore noise below 25% of the recent peak (floor EDGE_FLOOR)
      const h = Math.max(EDGE_FLOOR, this.peakEnv * 0.25);
      let ns = this.state;
      if (y > h) ns = 1; else if (y < -h) ns = -1;
      if (ns !== this.state) {
        const was = this.state;
        this.state = ns;
        if (was !== 0 && this.zcPos !== null) this.onEdge(this.zcPos);
      }
      this.prevY = y;
      this.pos++;
    }
  }

  onEdge(edgePos) {
    const prev = this.lastEdge;
    this.lastEdge = edgePos;
    if (prev === null) return;
    const d = edgePos - prev;
    const T = this.T;
    this.dg.edges++;
    this.gaps[this.gapN++ % GAP_RING] = d;
    if (d < 0.25 * T || d > 1.8 * T) { // noise burst or dropout
      this.pendingHalf = false;
      this.bitCount = 0;
      this.dg.resets++;
      return;
    }
    if (d > 0.75 * T) {
      // long gap = a 0 bit (a half-gap pending means we were mis-aligned: drop it)
      this.pendingHalf = false;
      this.adapt(d);
      this.pushBit(0, prev);
    } else if (this.pendingHalf) {
      this.pendingHalf = false;
      this.adapt(this.halfDur + d);
      this.pushBit(1, this.halfStart);
    } else {
      this.pendingHalf = true;
      this.halfStart = prev;
      this.halfDur = d;
    }
  }

  adapt(bitPeriod) {
    let T = this.T + 0.08 * (bitPeriod - this.T);
    this.T = Math.min(this.Tmax, Math.max(this.Tmin, T));
  }

  pushBit(b, startPos) {
    const bits = this.bits;
    bits.copyWithin(0, 1);
    bits[FRAME_BITS - 1] = b;
    this.bitStarts.copyWithin(0, 1);
    this.bitStarts[FRAME_BITS - 1] = startPos;
    if (this.bitCount < FRAME_BITS) this.bitCount++;
    if (this.bitCount < FRAME_BITS) return;
    for (let i = 0; i < 16; i++) if (bits[64 + i] !== SYNC_WORD[i]) return;
    this.dg.syncs++;
    const fr = parseFrameBits(bits);
    if (!fr) { this.dg.bad++; return; }
    this.onSync(fr, this.bitStarts[FRAME_BITS - 1]);
  }

  /**
   * A frame is only believed when it is exactly one frame after the previous one (or after an unconfirmed
   * candidate): a few wrong bits can still end in a valid-looking sync word, and a wrong time must never
   * reach the screen or the jam. Costs one frame when locking and after a timecode jump.
   */
  confirm(fr) {
    const nominal = this.nominalGuess();
    // up to 2 lost/garbled frames in between are fine: the chance a wrong frame lands on the right count is ~1 in a million
    const follows = (prev, k) => { if (!prev) return false; let t = prev; for (let i = 0; i < k; i++) { t = nextTimecode(t, nominal, fr.drop); if (sameTc(t, fr)) return true; } return false; };
    const cur = { h: fr.h, m: fr.m, s: fr.s, f: fr.f };
    if (follows(this.lastTc, 3)) { this.lastTc = cur; this.candTc = null; return true; }
    if (follows(this.candTc, 1)) { this.lastTc = cur; this.candTc = null; return true; } // two in a row after a jump / at start
    const first = !this.lastTc && !this.candTc;
    this.candTc = cur;
    return first ? "first" : false; // "first" = waiting for a 2nd frame to confirm, not an error
  }

  nominalGuess() {
    const fps = this.sr / (FRAME_BITS * this.T);
    return fps < 24.5 ? 24 : fps < 27.5 ? 25 : 30;
  }

  onSync(fr, pos) {
    const ok = this.confirm(fr);
    if (ok !== true) { if (ok === false) this.dg.bad++; return; }
    // Consecutive syncs must be one frame apart (+-3% of the previous gap);
    // anything else (dropout, jump, first frame) restarts the rate measurement.
    const sp = this.syncPos;
    if (sp.length) {
      const gap = pos - sp[sp.length - 1];
      const ref = sp.length > 1 ? (sp[sp.length - 1] - sp[0]) / (sp.length - 1) : FRAME_BITS * this.T;
      if (Math.abs(gap - ref) > 0.06 * ref) { sp.length = 0; this.fpsMeasured = null; }
    }
    sp.push(pos);
    if (sp.length > 25) sp.shift();
    if (sp.length >= 8) this.fpsMeasured = ((sp.length - 1) * this.sr) / (sp[sp.length - 1] - sp[0]);
    const rate = this.fpsMeasured !== null ? snapFrameRate(this.fpsMeasured, fr.drop) : null;
    // Not enough frames to measure yet: a first estimate from the bit clock.
    const approx = rate ? null : (this.sr / (FRAME_BITS * this.T));
    this.lastFrame = {
      h: fr.h, m: fr.m, s: fr.s, f: fr.f,
      drop: rate ? rate.drop : fr.drop,
      dropFlag: fr.drop,
      colorFrame: fr.colorFrame,
      userBits: fr.userBits,
      fps: rate ? rate.fps : approx,
      fpsLabel: rate ? rate.label : null,
      nominalFps: rate ? rate.nominal : null,
      rateLocked: !!rate,
      snapped: rate ? rate.snapped : false,
      bitRate: this.sr / this.T,
      pos,
    };
    this.dg.frames++;
    this.onFrame(this.lastFrame);
  }
}

if (typeof registerProcessor === "function" && typeof AudioWorkletProcessor !== "undefined") {
  class LtcProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      // sampleRate is a global in AudioWorkletGlobalScope. Up to two input
      // channels are decoded independently (a stereo interface may carry LTC
      // on input 2); whichever channel decodes is reported.
      this.decoders = [0, 1].map((ch) => new LtcDecoder(sampleRate, (frame) => {
        this.port.postMessage({ type: "frame", channel: ch, frame });
      }));
      this.sinceLevel = 0;
      this.port.onmessage = (e) => { if (e.data && e.data.type === "reset") this.decoders.forEach((d) => d.reset()); };
    }
    process(inputs) {
      const input = inputs[0];
      if (input && input.length) {
        const n = Math.min(input.length, 2);
        for (let ch = 0; ch < n; ch++) this.decoders[ch].push(input[ch]);
        this.sinceLevel += input[0].length;
        if (this.sinceLevel >= sampleRate / 20) { // ~20 meter updates / second
          this.sinceLevel = 0;
          const levels = [];
          for (let ch = 0; ch < n; ch++) levels.push(this.decoders[ch].takeLevel());
          this.port.postMessage({ type: "level", levels });
        }
      }
      return true;
    }
  }
  registerProcessor("ltc-decoder", LtcProcessor);
}
