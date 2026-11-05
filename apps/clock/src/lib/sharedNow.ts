import { useSyncExternalStore } from "react";
import { syncServerTime } from "@/lib/timeSync";

/**
 * One shared, synced "now" for time-of-day displays (Local, world time zones, Count To).
 * Count Up / Countdown timers never read it: they keep their own exact monotonic timing (useTimer). A single requestAnimationFrame loop publishes
 * a new value only when the synced time crosses a 100 ms boundary, and every subscriber reads
 * the same value, so all tiles flip seconds on the same frame. One server time sync (every 60 s)
 * feeds one offset to everyone (per-tile syncs used to give each tile a different offset).
 */
let offsetMs = 0;
let current = new Date();
const subs = new Set<() => void>();
let raf = 0, syncTimer: ReturnType<typeof setInterval> | null = null, fallback: ReturnType<typeof setInterval> | null = null;

export const STEP_MS = 100;
/** Quantise a synced epoch to the 100 ms step so every reader sees exactly the same instant. */
export function quantise(ms: number): number { return Math.floor(ms / STEP_MS) * STEP_MS; }

function publish() {
  const q = quantise(Date.now() + offsetMs);
  if (q !== current.getTime()) { current = new Date(q); subs.forEach((f) => f()); }
}
function loop() { publish(); raf = requestAnimationFrame(loop); }
async function sync() { try { offsetMs = (await syncServerTime()).offsetMs; publish(); } catch { /* keep last offset */ } }

function start() {
  publish();
  raf = requestAnimationFrame(loop);
  // rAF pauses in background tabs; a slow interval keeps state fresh for the phone remote.
  fallback = setInterval(publish, 50); // rAF pauses in background tabs (and some test envs); publish is a no-op unless the step changed
  sync(); syncTimer = setInterval(sync, 60_000);
}
function stop() {
  cancelAnimationFrame(raf); if (fallback) clearInterval(fallback); if (syncTimer) clearInterval(syncTimer);
  raf = 0; fallback = syncTimer = null;
}
export function subscribeNow(f: () => void) {
  subs.add(f); if (subs.size === 1) start();
  return () => { subs.delete(f); if (subs.size === 0) stop(); };
}
export const getNow = () => {
  // Nothing is ticking yet (first render): read the clock now so a new tile never shows a stale time.
  if (!raf && !fallback) { const q = quantise(Date.now() + offsetMs); if (q !== current.getTime()) current = new Date(q); }
  return current;
};
export function useSharedNow(): Date { return useSyncExternalStore(subscribeNow, getNow, getNow); }
/** Test helper: forget the synced offset between isolated tests. */
export function __resetSharedNow() { offsetMs = 0; current = new Date(0); }
