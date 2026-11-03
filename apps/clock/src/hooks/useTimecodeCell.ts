import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLtcInput } from "@/lib/ltc/useLtcInput";
import { ltcFrameToTimecode } from "@/lib/ltc/ltcToTimecode";
import { JAM_TIMEOUT_MS, JamCollector, jamCount, jamStore, type JamProgress, type JamRecord } from "@/lib/timecode/jam";
import { DEFAULT_TIMECODE_SOURCE_ID, getTimecodeSource, type LiveTimecode } from "@/lib/timecode/sources";
import { advanceCount, countToTc, formatAge, formatTc, framesPerDay, rateLabel, type TcRate } from "@/lib/timecode/timecode";

export const TC_PLACEHOLDER = "--:--:--:--";

export type TimecodeDisplayState = "off" | "live" | "freerun" | "nosignal";

type Opts = { enabled: boolean; deviceId?: string; sourceId?: string };

/**
 * Everything the clock's Timecode mode needs: the source (today only the Deity
 * TC-1 over LTC audio), jam-sync, and what to show. Source-specific code stops
 * at `ltc` below; the jam + display logic only sees normalised timecode.
 */
export function useTimecodeCell({ enabled, deviceId, sourceId = DEFAULT_TIMECODE_SOURCE_ID }: Opts) {
  const info = getTimecodeSource(sourceId);
  // Source adapter (the only one so far). A new source adds its own hook + branch here.
  const ltc = useLtcInput({ enabled: enabled && info.kind === "ltc-audio", deviceId });

  const subscribe = ltc.subscribe;

  const live: LiveTimecode | null = useMemo(() => (ltc.frame ? ltcFrameToTimecode(ltc.frame) : null), [ltc.frame]);

  useSyncExternalStore(jamStore.subscribe, jamStore.version, jamStore.version);
  const jam: JamRecord | null = enabled ? jamStore.get(info.id) : null;
  const trim = jamStore.trim(info.id);

  // ── clock for free-run / "jammed Xm ago" ──
  const [nowMs, setNowMs] = useState(() => Date.now());
  const freeRunning = enabled && !!jam && !live;
  useEffect(() => {
    if (!enabled || !jam) return;
    if (freeRunning) {
      // rAF keeps the frame digits smooth; re-render only when the frame count changes.
      let raf = 0; let lastCount = -1;
      const loop = () => {
        const n = Date.now();
        const c = jamCount(jam, n);
        if (c !== lastCount) { lastCount = c; setNowMs(n); }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [enabled, jam, freeRunning]);

  // ── jam ──
  const [jamProgress, setJamProgress] = useState<JamProgress | null>(null);
  const [jamError, setJamError] = useState("");
  const collector = useRef<JamCollector | null>(null);
  const jamTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsub = useRef<(() => void) | null>(null);

  const stopJam = useCallback(() => {
    unsub.current?.(); unsub.current = null;
    if (jamTimer.current) clearTimeout(jamTimer.current);
    jamTimer.current = null; collector.current = null;
    setJamProgress(null);
  }, []);

  const startJam = useCallback(() => {
    if (collector.current) return;
    setJamError("");
    const c = new JamCollector();
    collector.current = c;
    setJamProgress({ state: "collecting", frames: 0, elapsedMs: 0, need: 0, needMs: 0 });
    unsub.current = subscribe((frame, wallMs) => {
      const tc = ltcFrameToTimecode(frame);
      const rate: TcRate = { nominal: tc.nominal, fps: tc.fps, drop: tc.drop };
      const p = c.push({ count: tc.count, rate, rateLocked: tc.rateLocked, wallMs });
      if (p.state === "done") {
        jamStore.set({ ...p.record, sourceId: info.id });
        stopJam();
      } else setJamProgress(p);
    });
    jamTimer.current = setTimeout(() => {
      stopJam();
      setJamError("Couldn't get a steady lock. The timecode has to count one frame at a time without gaps; check the cable and level, then try again.");
    }, JAM_TIMEOUT_MS);
  }, [info.id, subscribe, stopJam]);

  // Leaving the mode / signing out / losing the source cancels an in-progress jam.
  useEffect(() => { if (!enabled) stopJam(); }, [enabled, stopJam]);
  useEffect(() => () => stopJam(), [stopJam]);

  const clearJam = useCallback(() => { stopJam(); setJamError(""); jamStore.clear(info.id); }, [info.id, stopJam]);
  const setTrim = useCallback((n: number) => jamStore.setTrim(info.id, n), [info.id]);

  // ── what to show ──
  let state: TimecodeDisplayState = "off";
  let text = TC_PLACEHOLDER;
  let rate: TcRate | null = null;
  if (enabled) {
    if (live) {
      state = "live";
      rate = { nominal: live.nominal, fps: live.fps, drop: live.drop };
      text = formatTc(countToTc(live.rateLocked ? advanceCount(live.count, trim, rate) : live.count, rate), live.drop);
    } else if (jam) {
      state = "freerun";
      rate = jam;
      text = formatTc(countToTc(advanceCount(jamCount(jam, nowMs), trim, jam), jam), jam.drop);
    } else if (ltc.status === "nosignal" || ltc.status === "notltc") {
      state = "nosignal";
    }
  }

  const jamAgeMs = jam ? Math.max(0, nowMs - jam.jammedAtMs) : null;
  const jamAgeText = jamAgeMs === null ? "" : `Jammed ${formatAge(jamAgeMs)}`;

  // How far the free-run clock would be from the live signal right now (frames): the jam's quality check.
  let driftFrames: number | null = null;
  if (jam && live && live.rateLocked && jam.nominal === live.nominal && jam.drop === live.drop) {
    const day = framesPerDay(jam);
    driftFrames = ((((live.count - jamCount(jam, nowMs)) + day / 2) % day) + day) % day - day / 2;
  }

  const rateText = rate ? rateLabel(rate) : null;

  return {
    ltc, info, state, text, rateText,
    live: !!live, jam, jamAgeText, jamAgeMs, jamProgress, jamError, driftFrames, trim,
    canJam: !!live && live.rateLocked && !jamProgress,
    startJam, clearJam, setTrim, cancelJam: stopJam,
  };
}

export type TimecodeCell = ReturnType<typeof useTimecodeCell>;
