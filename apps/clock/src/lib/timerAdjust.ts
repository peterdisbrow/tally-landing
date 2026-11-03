/**
 * Helpers for the Multi-Clock timer cells: typed durations and the quick
 * add/subtract steps.
 */

/** Quick add/subtract steps, in seconds (shown as -5m -1m -10s +10s +1m +5m). */
export const ADJUST_STEPS = [10, 60, 300] as const;

export function stepLabel(seconds: number): string {
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

const MAX_SECONDS = 99 * 3600 + 59 * 60 + 59;

/**
 * Parses a typed duration into whole seconds.
 *   "12:30" -> 750 (mm:ss)      "00:12:30" -> 750 (hh:mm:ss)
 *   "90" -> 90 (seconds)         "10s" / "2m" / "1h" / "1h30m" / "1m30s"
 * Returns null when the text is not a duration. Never negative: the sign is
 * chosen by the Add / Subtract button, not typed.
 */
export function parseDuration(input: string): number | null {
  const raw = (input || "").trim().toLowerCase();
  if (!raw) return null;

  if (/^\d+(:\d{1,2}){1,2}$/.test(raw)) {
    const parts = raw.split(":").map(Number);
    const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
    if (m > 59 && parts.length === 3) return null;
    if (s > 59) return null;
    const total = h * 3600 + m * 60 + s;
    return total <= MAX_SECONDS ? total : null;
  }
  if (/^\d+$/.test(raw)) {
    const total = Number(raw);
    return total <= MAX_SECONDS ? total : null;
  }
  const unit = /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?$/.exec(raw);
  if (unit && (unit[1] || unit[2] || unit[3])) {
    const total = Number(unit[1] || 0) * 3600 + Number(unit[2] || 0) * 60 + Number(unit[3] || 0);
    return total <= MAX_SECONDS ? total : null;
  }
  return null;
}

/** 750 -> "00:12:30" (always hh:mm:ss, for the start-value field). */
export function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** 75 -> "+1:15", -600 -> "-10:00", 0 -> "" (used for the "adjusted" note). */
export function formatSigned(seconds: number): string {
  if (!seconds) return "";
  const abs = Math.abs(Math.round(seconds));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const body = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
  return `${seconds < 0 ? "-" : "+"}${body}`;
}

/** New adjustment after adding `deltaSeconds`; with floorToZero the displayed value never goes below 0. */
export function nextAdjust(current: number, deltaSeconds: number, displayedSeconds: number, floorToZero: boolean): number {
  let next = current + deltaSeconds;
  if (floorToZero && displayedSeconds + deltaSeconds < 0) next = current - displayedSeconds;
  return next;
}
