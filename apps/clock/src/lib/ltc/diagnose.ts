/**
 * Turns the decoder's raw counters into a plain-English "why isn't it locking?" verdict, so that
 * "signal present but no sync words" can be told apart from "wrong input" or "wrong frame rate".
 */
export type ChannelDiag = {
  peak: number;          // 0..1 (full scale)
  squareness: number;    // rms/peak of the DC-blocked signal: ~1 square wave, ~0.2 speech/noise
  edgesPerSec: number;
  syncsPerSec: number;   // valid 16-bit LTC sync words seen (even if the digits were rejected)
  badPerSec: number;     // sync word found but the time digits were impossible or didn't count up one frame at a time
  resetsPerSec: number;  // glitches / dropouts that restarted bit assembly
  framesPerSec: number;  // good frames
  cadence: number;       // 0..1 share of edge gaps that fit the biphase-mark pattern
  bitRate: number | null; // b/s implied by the gaps (LTC: 80 bits/frame)
};

export type InputInfo = {
  label: string;
  sampleRate: number;
  channelCount: number | null;
  echoCancellation: boolean | null;
  noiseSuppression: boolean | null;
  autoGainControl: boolean | null;
};

export type LtcDiag = {
  channels: ChannelDiag[];
  totals: { edges: number; syncs: number; bad: number; resets: number; frames: number };
  input: InputInfo | null;
};

export type Verdict = {
  code: "idle" | "silent" | "no-edges" | "not-ltc" | "too-fast" | "too-slow" | "no-sync" | "bad-digits" | "ok";
  text: string;
  hint: string;
};

export const LTC_MIN_BITRATE = 1700; // ~21 fps
export const LTC_MAX_BITRATE = 2700; // ~33 fps
export const DIAG_SILENCE_PEAK = 0.001; // -60 dBFS

export const bitRateToFps = (b: number) => b / 80;
const fpsText = (b: number) => `${bitRateToFps(b).toFixed(2).replace(/\.?0+$/, "")} fps`;

/** The channel most likely to carry LTC: the one that decodes, else the most biphase-like, else the loudest. */
export function bestChannel(d: LtcDiag): number {
  let best = 0, score = -1;
  d.channels.forEach((c, i) => {
    const s = (c.framesPerSec > 0 ? 1000 : 0) + (c.syncsPerSec > 0 ? 100 : 0) + c.cadence * 10 + (c.peak > DIAG_SILENCE_PEAK ? 1 : 0);
    if (s > score) { score = s; best = i; }
  });
  return best;
}

export function diagnose(d: LtcDiag, running: boolean): Verdict {
  if (!running) return { code: "idle", text: "Not listening", hint: "" };
  const ch = d.channels[bestChannel(d)];
  const ok = d.channels.some((c) => c.framesPerSec > 0);
  if (ok) return { code: "ok", text: "Timecode decoded", hint: "" };
  if (!ch || ch.peak < DIAG_SILENCE_PEAK) {
    return { code: "silent", text: "Input is silent (below -60 dB)", hint: "Check the cable, the TC-1 output (Out Type / level) and that this is the right input device." };
  }
  if (ch.edgesPerSec < 150) {
    return { code: "no-edges", text: "Level present but no signal transitions (DC, hum or very slow audio)", hint: "That isn't a timecode signal. Check the TC-1 is generating timecode and plugged into this input." };
  }
  if (ch.cadence < 0.55) {
    return { code: "not-ltc", text: `Audio present but it isn't a timecode-like square wave (${Math.round(ch.edgesPerSec)} edges/s, ${Math.round(ch.cadence * 100)}% steady)`, hint: "Looks like the wrong input (speech, room noise or music). Pick the interface the TC-1 is plugged into." };
  }
  if (ch.bitRate !== null && ch.bitRate > LTC_MAX_BITRATE) {
    return { code: "too-fast", text: `Steady signal at ${Math.round(ch.bitRate)} bits/s (≈ ${fpsText(ch.bitRate)}), faster than 24-30 fps timecode`, hint: "Set the TC-1 to 29.97, 29.97 DF or 30. A 59.94 / 60 fps show is sent as 29.97 / 30 timecode (then choose ×2 in settings)." };
  }
  if (ch.bitRate !== null && ch.bitRate < LTC_MIN_BITRATE) {
    return { code: "too-slow", text: `Steady signal at ${Math.round(ch.bitRate)} bits/s (≈ ${fpsText(ch.bitRate)}), slower than 24-30 fps timecode`, hint: "This clock reads 23.98 to 30 fps. Check the TC-1's frame rate." };
  }
  if (ch.badPerSec > 0 || (d.totals.bad > 0 && d.totals.frames === 0)) {
    return { code: "bad-digits", text: "Sync words found but the time digits are invalid or don't count up", hint: "The signal is noisy or distorted; lower the TC-1 output level, use a shorter cable, or check it isn't clipping." };
  }
  const rate = ch.bitRate !== null ? ` at ${Math.round(ch.bitRate)} bits/s (≈ ${fpsText(ch.bitRate)})` : "";
  return { code: "no-sync", text: `Steady biphase signal${rate} but no timecode sync words found`, hint: "The signal looks like LTC but is too distorted to read. Lower the level, avoid mic inputs/pre-amps with gain, and keep processing off." };
}

const f = (n: number | null | undefined, digits = 0) => (n === null || n === undefined || !isFinite(n) ? "–" : n.toFixed(digits));
export const chName = (i: number, n: number) => (n > 1 ? (i === 0 ? "L" : i === 1 ? "R" : `ch${i + 1}`) : "In");
const db = (p: number) => (p <= 0.00001 ? "-∞" : (20 * Math.log10(p)).toFixed(0));

/** One compact, copy-pasteable line per channel, e.g. "L -10 dB · 4795 edges/s · 98% steady · 2398 b/s (29.97 fps) · sync 0 · bad 0 · resets 0". */
export function diagLines(d: LtcDiag): string[] {
  return d.channels.map((c, i) =>
    `${chName(i, d.channels.length)} ${db(c.peak)} dB · ${f(c.edgesPerSec)} edges/s · ${f(c.cadence * 100)}% steady · ${c.bitRate !== null ? `${f(c.bitRate)} b/s (${fpsText(c.bitRate)})` : "bit rate –"} · sync ${f(c.syncsPerSec, 1)}/s · bad ${f(c.badPerSec, 1)}/s · resets ${f(c.resetsPerSec, 1)}/s`);
}

export function inputLine(i: InputInfo | null): string {
  if (!i) return "";
  const onoff = (v: boolean | null) => (v === null ? "?" : v ? "ON" : "off");
  return `${i.label || "Audio input"} · ${Math.round(i.sampleRate)} Hz · ${i.channelCount ?? "?"} ch · echo ${onoff(i.echoCancellation)} · noise-sup ${onoff(i.noiseSuppression)} · AGC ${onoff(i.autoGainControl)}`;
}
