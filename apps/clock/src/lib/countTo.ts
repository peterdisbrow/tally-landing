/**
 * Count To targets a time of day (e.g. 10:30 AM), stored as "HH:MM" (24h).
 * The target is always today's occurrence: it never rolls to tomorrow. Once it
 * passes, the clock counts up as overtime (+, red) showing time past the target.
 */
export function parseTimeOfDay(input: string): string | null {
  const m = input.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(a|p|am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]); const min = Number(m[2] ?? 0); const ap = m[3];
  if (min > 59) return null;
  if (ap) { if (h < 1 || h > 12) return null; h = (h % 12) + (ap.startsWith("p") ? 12 : 0); }
  else if (h > 23) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function targetToday(hhmm: string, now: Date = new Date()): number {
  const [h, m] = hhmm.split(":").map(Number);
  const t = new Date(now); t.setHours(h, m, 0, 0);
  return t.getTime();
}

export function timeOfDayOf(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatTimeOfDay(hhmm: string, is24h: boolean): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (is24h) return hhmm;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Default target: the next half hour from now (today, or 23:30 cap so it stays today). */
export function defaultCountToTime(now: Date = new Date()): string {
  const t = new Date(now); t.setSeconds(0, 0); t.setMinutes(t.getMinutes() < 30 ? 30 : 60);
  if (t.getDate() !== now.getDate()) return "23:59";
  return timeOfDayOf(t.getTime());
}

/** Signed seconds until the target (negative = overtime, time past the target). */
export function countToRemainingMs(target: number, nowMs: number): number { return target - nowMs; }
