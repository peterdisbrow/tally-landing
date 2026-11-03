/**
 * Registry of timecode sources the clock's "Timecode" mode can read.
 *
 * Today there is exactly one: the Deity TC-1 timecode box, read as LTC audio.
 * To add another later (a different LTC box, 50/60 fps, MIDI MTC, network) add
 * an entry here and an adapter in `useTimecodeCell` that produces the same
 * normalised frames (`TimecodeSourceHandle`); the jam logic, persistence and UI
 * don't change.
 */

export type TimecodeSourceKind = "ltc-audio";

export type TimecodeSourceInfo = {
  id: string;
  kind: TimecodeSourceKind;
  label: string;        // shown in the UI
  shortLabel: string;   // cell subtitle
  /** Frame rates this source/device can send AND the clock can read today. */
  supportedRates: string[];
  /** Shown with the x2 setting: the LTC feed is 29.97 / 29.97 DF / 30 and the clock displays it as 59.94 / 59.94 DF / 60. */
  highFrameRates: string[];
  hookup: string;       // one-line setup hint
};

export const DEITY_TC1_LTC: TimecodeSourceInfo = {
  id: "deity-tc1-ltc",
  kind: "ltc-audio",
  label: "Deity TC-1 (LTC, line level)",
  shortLabel: "TC-1",
  supportedRates: ["23.98", "24", "25", "29.97", "29.97 DF", "30"],
  highFrameRates: ["59.94", "59.94 DF", "60"],
  hookup: "TC-1 Out Type = L-OUT (line level), 3.5mm TRS → audio interface line input (tip = LTC).",
};

export const TIMECODE_SOURCES: TimecodeSourceInfo[] = [DEITY_TC1_LTC];
export const DEFAULT_TIMECODE_SOURCE_ID = DEITY_TC1_LTC.id;

export function getTimecodeSource(id?: string): TimecodeSourceInfo {
  return TIMECODE_SOURCES.find((s) => s.id === id) ?? DEITY_TC1_LTC;
}

/** What every source adapter hands the shared jam/display logic. */
export type LiveTimecode = {
  count: number;                 // current frame count, latency-corrected, trim NOT applied
  nominal: number; fps: number; drop: boolean;
  rateLocked: boolean;
};

export type TimecodeSourceHandle = {
  status: "idle" | "requesting" | "denied" | "unsupported" | "error" | "nosignal" | "notltc" | "locked";
  live: LiveTimecode | null;     // null unless currently receiving
  /** Called for EVERY decoded frame (not throttled), with Date.now() at arrival. */
  subscribe: (cb: (tc: LiveTimecode, wallMs: number) => void) => () => void;
};
