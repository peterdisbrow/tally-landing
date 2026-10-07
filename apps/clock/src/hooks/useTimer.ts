import { useCallback, useEffect, useRef, useState } from "react";

const monotonicNow = () => performance.now();

/**
 * Counts only time reported by the browser monotonic clock, never wall time.
 * A sleeping browser may stop that clock: do not guess or add missing time.
 * Remounting starts paused at zero. Injection is for deterministic tests;
 * the clock function is fixed for the lifetime of this mounted timer.
 */
export function useTimer(now: () => number = monotonicNow) {
  const clock = useRef(now);
  const readTime = useCallback(() => clock.current(), []);
  const startedAt = useRef<number | null>(null);
  const accumulated = useRef(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [paused, setPaused] = useState(true);
  const startTimer = useCallback(() => {
    if (startedAt.current !== null) return;
    startedAt.current = readTime();
    setPaused(false);
  }, [readTime]);
  const pauseTimer = useCallback(() => {
    if (startedAt.current !== null) {
      accumulated.current += readTime() - startedAt.current;
      startedAt.current = null;
    }
    setElapsedMs(accumulated.current);
    setPaused(true);
  }, [readTime]);
  const resetTimer = useCallback((andStart = true) => {
    accumulated.current = 0;
    startedAt.current = andStart ? readTime() : null;
    setElapsedMs(0);
    setPaused(!andStart);
  }, [readTime]);
  const adjustTimer = useCallback((deltaMs: number) => {
    accumulated.current = Math.max(0, accumulated.current + deltaMs);
    setElapsedMs(accumulated.current + (startedAt.current === null ? 0 : readTime() - startedAt.current));
  }, [readTime]);
  const togglePause = useCallback(() => {
    if (startedAt.current === null) startTimer(); else pauseTimer();
  }, [startTimer, pauseTimer]);
  useEffect(() => {
    if (paused) return;
    const tick = () => setElapsedMs(accumulated.current + (startedAt.current === null ? 0 : readTime() - startedAt.current));
    const id = setInterval(tick, 33);
    // Refresh immediately after throttling or a back/forward-cache restoration.
    // These events do not add wall-clock time or restart/reset the timer.
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("pageshow", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, [paused, readTime]);
  return { elapsedMs, paused, startTimer, pauseTimer, resetTimer, togglePause, adjustTimer };
}
