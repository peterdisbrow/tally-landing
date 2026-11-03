import { LTC_DECODE_LATENCY_FRAMES, advanceCount, tcToCount, type TcRate } from "../timecode/timecode";
import type { LiveTimecode } from "../timecode/sources";
import type { LtcFrame } from "./useLtcInput";

/**
 * Normalise a decoded LTC frame for the shared jam/display code.
 * Adds the one-frame decode latency (see LTC_DECODE_LATENCY_FRAMES) once the
 * frame rate is known. Before the rate is measured (the first ~8 frames) the
 * raw decoded value is returned with rateLocked=false and is never used to jam.
 */
export function ltcFrameToTimecode(f: LtcFrame): LiveTimecode {
  const nominal = f.nominalFps ?? 30;
  const rate: TcRate = { nominal, fps: f.fps ?? nominal, drop: f.drop };
  const raw = tcToCount({ h: f.h, m: f.m, s: f.s, f: f.f }, rate);
  return {
    count: f.rateLocked ? advanceCount(raw, LTC_DECODE_LATENCY_FRAMES, rate) : raw,
    nominal, fps: rate.fps, drop: f.drop, rateLocked: f.rateLocked,
  };
}
