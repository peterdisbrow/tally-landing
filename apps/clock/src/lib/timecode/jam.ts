/**
 * Jam-sync: lock to a live timecode for a few seconds, remember the offset
 * between the timecode and the computer's clock, then free-run on that clock
 * after the source goes away (like jam-syncing a camera). Persisted in
 * localStorage so a reload keeps it.
 *
 * Free-run uses Date.now() (wall clock) rather than performance.now(): wall
 * time keeps counting while the laptop sleeps and across a page reload, and
 * the OS keeps it NTP-disciplined.
 */
import { advanceCount, sameRate, type TcRate } from "./timecode";

export type JamRecord = TcRate & {
  v: 1;
  sourceId: string;
  anchorWallMs: number; // Date.now() at which the timecode was `anchorCount`
  anchorCount: number;  // frame count at the anchor (already latency-corrected)
  jammedAtMs: number;   // when the jam finished (for "Jammed Xm ago")
  frames: number;       // consecutive frames that were validated
  spreadMs: number;     // jitter of the per-frame anchor estimates (quality)
};

export type JamSample = { count: number; rate: TcRate; rateLocked: boolean; wallMs: number };

export const JAM_MIN_FRAMES = 48;   // ~2 s at 24 fps
export const JAM_MIN_MS = 3000;     // "a few seconds"
export const JAM_TIMEOUT_MS = 20000;

export type JamProgress =
  | { state: "collecting"; frames: number; elapsedMs: number; need: number; needMs: number }
  | { state: "done"; record: Omit<JamRecord, "sourceId"> };

/**
 * Collects consecutive decoded frames. Any gap, repeat, rate change or unlocked
 * frame throws the run away and starts again, so a jam can only come from a
 * clean stretch of timecode counting one frame at a time.
 */
export class JamCollector {
  private est: number[] = [];
  private prev: JamSample | null = null;
  private firstCount = 0;
  private firstWall = 0;
  private rate: TcRate | null = null;
  restarts = 0;

  constructor(private minFrames = JAM_MIN_FRAMES, private minMs = JAM_MIN_MS) {}

  reset() { this.est = []; this.prev = null; this.rate = null; }

  push(s: JamSample): JamProgress {
    if (!s.rateLocked) { this.reset(); this.restarts++; return this.progress(s.wallMs); }
    const p = this.prev;
    if (p) {
      const consecutive = this.rate && sameRate(this.rate, s.rate) && s.count === advanceCount(p.count, 1, s.rate);
      if (!consecutive) { this.reset(); this.restarts++; }
    }
    if (!this.rate) { this.rate = s.rate; this.firstCount = s.count; this.firstWall = s.wallMs; }
    const i = this.est.length;
    // Wall time at which the first frame's count was current, as implied by this frame.
    this.est.push(s.wallMs - (i * 1000) / s.rate.fps);
    this.prev = s;
    const elapsed = s.wallMs - this.firstWall;
    if (this.est.length >= this.minFrames && elapsed >= this.minMs) {
      const sorted = [...this.est].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      return {
        state: "done",
        record: {
          v: 1, ...s.rate,
          anchorWallMs: median, anchorCount: this.firstCount,
          jammedAtMs: s.wallMs, frames: this.est.length,
          spreadMs: sorted[sorted.length - 1] - sorted[0],
        },
      };
    }
    return this.progress(s.wallMs);
  }

  private progress(now: number): JamProgress {
    return { state: "collecting", frames: this.est.length, elapsedMs: this.est.length ? now - this.firstWall : 0, need: this.minFrames, needMs: this.minMs };
  }
}

/** Frame count the jam says is current at wall time `nowMs`. */
export function jamCount(j: JamRecord, nowMs: number): number {
  const frames = Math.floor(((nowMs - j.anchorWallMs) * j.fps) / 1000);
  return advanceCount(j.anchorCount, frames, j);
}

/** Like jamCount, plus which half of the frame pair we're in (for x2 / 59.94-60 display). */
export function jamPosition(j: JamRecord, nowMs: number): { count: number; sub: 0 | 1 } {
  const total = ((nowMs - j.anchorWallMs) * j.fps) / 1000;
  const whole = Math.floor(total);
  return { count: advanceCount(j.anchorCount, whole, j), sub: total - whole >= 0.5 ? 1 : 0 };
}

// ── persistence ────────────────────────────────────────────────

export const JAM_STORAGE_KEY = "tally-clock-tc-jam-v1";

type Stored = { jams: Record<string, JamRecord>; trim: Record<string, number> };

const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

export function parseJam(x: unknown, sourceId: string): JamRecord | null {
  const j = x as Partial<JamRecord> | null;
  if (!j || j.v !== 1 || j.sourceId !== sourceId) return null;
  if (![j.nominal, j.fps, j.anchorWallMs, j.anchorCount, j.jammedAtMs, j.frames, j.spreadMs].every(finite)) return null;
  if (![24, 25, 30].includes(j.nominal!) || j.fps! < 20 || j.fps! > 31) return null;
  if (typeof j.drop !== "boolean") return null;
  return j as JamRecord;
}

function readStored(): Stored {
  const empty: Stored = { jams: {}, trim: {} };
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(JAM_STORAGE_KEY) : null;
    if (!raw) return empty;
    const o = JSON.parse(raw) as Partial<Stored>;
    const jams: Record<string, JamRecord> = {};
    for (const id of Object.keys(o.jams ?? {})) { const j = parseJam(o.jams![id], id); if (j) jams[id] = j; }
    const trim: Record<string, number> = {};
    for (const id of Object.keys(o.trim ?? {})) if (finite(o.trim![id])) trim[id] = Math.max(-10, Math.min(10, Math.round(o.trim![id])));
    return { jams, trim };
  } catch { return empty; }
}

const listeners = new Set<() => void>();
let cache: Stored | null = null;
let version = 0;

function load(): Stored { return (cache ??= readStored()); }
function save(next: Stored) {
  cache = next; version++;
  try { localStorage.setItem(JAM_STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode / quota: keeps working in memory */ }
  listeners.forEach((l) => l());
}

export const jamStore = {
  get: (sourceId: string): JamRecord | null => load().jams[sourceId] ?? null,
  trim: (sourceId: string): number => load().trim[sourceId] ?? 0,
  set(rec: JamRecord) { const s = load(); save({ ...s, jams: { ...s.jams, [rec.sourceId]: rec } }); },
  clear(sourceId: string) { const s = load(); const jams = { ...s.jams }; delete jams[sourceId]; save({ ...s, jams }); },
  setTrim(sourceId: string, frames: number) {
    const s = load(); save({ ...s, trim: { ...s.trim, [sourceId]: Math.max(-10, Math.min(10, Math.round(frames))) } });
  },
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  version: () => version,
  /** test helper: drop the in-memory cache so the next read hits localStorage (simulates a reload). */
  _reloadFromStorage() { cache = null; version++; listeners.forEach((l) => l()); },
};

if (typeof window !== "undefined") {
  // Another tab jammed / cleared: pick it up.
  window.addEventListener("storage", (e) => { if (e.key === JAM_STORAGE_KEY) jamStore._reloadFromStorage(); });
}
