export type TimeSyncSource = "tally" | "ntp" | "local";

export type TimeSyncResult = {
  offsetMs: number;
  source: TimeSyncSource;
  label: string;
};

export const TALLY_TIME_PATH = "/api/time";
export const TALLY_TIME_ABSOLUTE = "https://api.tallyconnect.app/api/time";

const FETCH_TIMEOUT_MS = 4000;

/**
 * Live Tally `GET /api/time` returns `{ serverTime, isoTime }`.
 * Accept the same shape from same-origin or the absolute API host.
 */
export function parseTallyTimePayload(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;

  if (typeof rec.serverTime === "number" && Number.isFinite(rec.serverTime)) {
    return rec.serverTime;
  }
  if (typeof rec.isoTime === "string") {
    const parsed = Date.parse(rec.isoTime);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

async function fetchOffset(
  url: string,
  parse: (data: unknown) => number | null,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<number | null> {
  const before = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    const after = Date.now();
    const data = await res.json();
    const serverTime = parse(data);
    if (serverTime == null || Number.isNaN(serverTime)) return null;
    const roundTrip = (after - before) / 2;
    return serverTime - (before + roundTrip);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Prefer Tally time. Same-origin `/api/time` works on api.tallyconnect.app
 * (and on tallyconnect.app once the Next route is deployed). Absolute Tally
 * is the next hop so Vercel / Vite preview still sync without Supabase.
 */
export async function syncServerTime(): Promise<TimeSyncResult> {
  const tallyUrls = [TALLY_TIME_PATH, TALLY_TIME_ABSOLUTE];
  for (const url of tallyUrls) {
    const offset = await fetchOffset(url, parseTallyTimePayload);
    if (offset != null) {
      return { offsetMs: offset, source: "tally", label: "Tally time" };
    }
  }

  const fallbacks: { url: string; parse: (data: unknown) => number | null }[] = [
    {
      url: "https://timeapi.io/api/time/current/zone?timeZone=UTC",
      parse: (data) => {
        if (!data || typeof data !== "object") return null;
        const dateTime = (data as { dateTime?: unknown }).dateTime;
        if (typeof dateTime !== "string") return null;
        const parsed = new Date(`${dateTime}Z`).getTime();
        return Number.isNaN(parsed) ? null : parsed;
      },
    },
    {
      url: "https://worldtimeapi.org/api/timezone/UTC",
      parse: (data) => {
        if (!data || typeof data !== "object") return null;
        const utc = (data as { utc_datetime?: unknown }).utc_datetime;
        if (typeof utc !== "string") return null;
        const parsed = new Date(utc).getTime();
        return Number.isNaN(parsed) ? null : parsed;
      },
    },
  ];

  for (const api of fallbacks) {
    const offset = await fetchOffset(api.url, api.parse);
    if (offset != null) {
      return { offsetMs: offset, source: "ntp", label: "NTP synced" };
    }
  }

  return { offsetMs: 0, source: "local", label: "Local clock" };
}
