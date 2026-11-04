/**
 * What to put on screen for a timecode position, including high frame rates.
 *
 * LTC has no 50/60 fps mode. Per SMPTE ST 12-1 (and the Deity TC-1 guide) a
 * 59.94 / 60 fps show is carried as ordinary 29.97 (DF or NDF) / 30 fps LTC:
 * one 80-bit word labels a PAIR of video frames, the first frame aligned with
 * bits 0-39 and the second with bits 40-79. The wire signal for "29.97" and
 * "59.94" is therefore identical, so it cannot be auto-detected; the user says
 * which one they're running (the "x2" setting) and the clock shows the pair
 * as two frames: FF = 2 * pairFrame + subFrame (00-59).
 *
 * Drop frame carries over unchanged: 29.97 DF skips pair numbers 0,1 at each
 * minute except every 10th, which is 59.94 DF skipping frames 0-3 (4 frames).
 *
 * LTC's "field flag" is NOT available for this: in a 30 fps LTC word bit 27 is
 * the biphase polarity-correction bit (it flips word to word), so frame
 * identity inside the pair comes from timing only, as the standard says.
 */
import { advanceCount, countToTc, formatTc, framesPerDay, type TcFields, type TcRate } from "./timecode";

/** x2 applies to 30 / 29.97 (DF or NDF) LTC only. */
export const canDoubleRate = (r: TcRate) => r.nominal === 30;

export type TcPosition = { count: number; sub: 0 | 1 };

export function hfrLabel(r: TcRate): { num: string; df: boolean } {
  return { num: Math.abs(r.fps - 30) < 0.01 ? "60" : "59.94", df: r.drop };
}

/** Fields at a position. `trim` is in displayed frames (pair frames when !hfr, true frames when hfr). */
export function displayFields(pos: TcPosition, rate: TcRate, hfr: boolean, trim = 0): TcFields {
  if (!hfr || !canDoubleRate(rate)) return countToTc(advanceCount(pos.count, trim, rate), rate);
  const hiDay = framesPerDay(rate) * 2;
  const hi = (((pos.count * 2 + pos.sub + trim) % hiDay) + hiDay) % hiDay;
  const pair = countToTc(Math.floor(hi / 2), rate);
  return { ...pair, f: pair.f * 2 + (hi % 2) };
}

export function displayText(pos: TcPosition, rate: TcRate, hfr: boolean, trim = 0): string {
  return formatTc(displayFields(pos, rate, hfr, trim), rate.drop);
}

/** Frame-rate label for the subtitle, e.g. {num:"59.94", df:true} or {num:"23.98", df:false}. */
export function rateParts(r: TcRate, hfr: boolean): { num: string; df: boolean } {
  if (hfr && canDoubleRate(r)) return hfrLabel(r);
  if (r.nominal === 24) return { num: Math.abs(r.fps - 24) < 0.01 ? "24" : "23.98", df: false };
  if (r.nominal === 25) return { num: "25", df: false };
  if (r.nominal === 30) return { num: Math.abs(r.fps - 30) < 0.01 ? "30" : "29.97", df: r.drop };
  return { num: r.fps.toFixed(2), df: false };
}

/** Sub-frame (0 = first frame of the pair, 1 = second) from time since the word arrived. */
export function subFrameSince(arrivalWallMs: number, nowMs: number, rate: TcRate): 0 | 1 {
  return ((nowMs - arrivalWallMs) * rate.fps) / 1000 >= 0.5 ? 1 : 0;
}

/** Signed jam drift in displayed frames (×2 units when hfr), wrapped to ±half a day. */
export function jamDrift(live: { count: number; sub: 0 | 1 }, jam: { count: number; sub: 0 | 1 }, framesPerDay: number, hfr: boolean): number {
  const k = hfr ? 2 : 1;
  const day = framesPerDay * k;
  const d = live.count * k + (hfr ? live.sub : 0) - (jam.count * k + (hfr ? jam.sub : 0));
  return ((((d + day / 2) % day) + day) % day) - day / 2;
}
