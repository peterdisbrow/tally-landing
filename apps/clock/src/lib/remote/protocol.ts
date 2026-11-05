/**
 * Clock phone remote: pairing + signed messages.
 * - The pairing token (32 random bytes) lives only in the display's storage and the QR code's URL
 *   fragment (#k=…), which browsers never send to a server.
 * - The relay room id is SHA-256 of the token, so the relay never learns the token.
 * - Every message is HMAC-SHA-256 signed with the token and carries a sender id, a sequence number
 *   and a timestamp. The display drops anything unsigned, forged, stale (>30s) or replayed.
 */
export type RemoteMode = "clock" | "countup" | "countdown" | "countto";
export type RemoteCmd =
  | { cmd: "start" } | { cmd: "pause" } | { cmd: "toggle" } | { cmd: "reset" }
  | { cmd: "adjust"; seconds: number } | { cmd: "setCountdown"; seconds: number } | { cmd: "setMode"; mode: RemoteMode } | { cmd: "setCountTo"; time: string };
export type RemoteClockState = { id: string; name: string; mode: string; color: string; text: string; paused: boolean; canTime: boolean };
export type RemoteState = { variant: "single" | "multi"; clocks: RemoteClockState[]; exp?: number };
export type Body = { k: "cmd"; clockId?: string; c: RemoteCmd } | { k: "state"; s: RemoteState } | { k: "hello" } | { k: "ended"; reason: EndReason };
export type EndReason = "expired" | "revoked";
export type Envelope = { t: "msg"; from: string; seq: number; ts: number; body: string; sig: string };

export const TOKEN_BYTES = 32;
export const MAX_SKEW_MS = 30_000;
export const PAIRING_TTL_MS = 12 * 3600_000;

const enc = new TextEncoder();
const b64u = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

export function newToken(): string { const b = new Uint8Array(TOKEN_BYTES); crypto.getRandomValues(b); return b64u(b); }
export function isToken(t: unknown): t is string { return typeof t === "string" && /^[A-Za-z0-9_-]{43}$/.test(t); }
export function newSenderId(): string { const b = new Uint8Array(9); crypto.getRandomValues(b); return b64u(b); }

export async function roomId(token: string): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", enc.encode(`tally-clock-remote:v1:${token}`));
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function key(token: string) { return crypto.subtle.importKey("raw", fromB64u(token), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); }
const material = (e: Omit<Envelope, "sig" | "t">) => enc.encode(`${e.from}.${e.seq}.${e.ts}.${e.body}`);

export async function seal(token: string, from: string, seq: number, body: Body, now = Date.now()): Promise<Envelope> {
  const e = { from, seq, ts: now, body: JSON.stringify(body) };
  const sig = await crypto.subtle.sign("HMAC", await key(token), material(e));
  return { t: "msg", ...e, sig: b64u(sig) };
}

/** Verifier with per-sender replay protection. Returns the body, or null to drop the message. */
export function createVerifier(token: string, now: () => number = Date.now) {
  const lastSeq = new Map<string, number>();
  const kp = key(token);
  return async (raw: unknown): Promise<Body | null> => {
    const e = raw as Envelope;
    if (!e || e.t !== "msg" || typeof e.body !== "string" || typeof e.sig !== "string" || typeof e.from !== "string" || !Number.isFinite(e.seq) || !Number.isFinite(e.ts)) return null;
    if (Math.abs(now() - e.ts) > MAX_SKEW_MS) return null;
    if (e.seq <= (lastSeq.get(e.from) ?? -1)) return null;
    let sig: Uint8Array<ArrayBuffer>; try { sig = fromB64u(e.sig); } catch { return null; }
    const ok = await crypto.subtle.verify("HMAC", await kp, sig, material(e));
    if (!ok) return null;
    lastSeq.set(e.from, e.seq);
    try { return JSON.parse(e.body) as Body; } catch { return null; }
  };
}

const MODES: RemoteMode[] = ["clock", "countup", "countdown", "countto"];
/** Shape check for commands after the signature passes (defence in depth). */
export function validCmd(c: unknown): c is RemoteCmd {
  const x = c as Record<string, unknown>;
  if (!x || typeof x.cmd !== "string") return false;
  if (["start", "pause", "toggle", "reset"].includes(x.cmd)) return true;
  if (x.cmd === "adjust") return Number.isInteger(x.seconds) && Math.abs(x.seconds as number) <= 24 * 3600;
  if (x.cmd === "setCountdown") return Number.isInteger(x.seconds) && (x.seconds as number) >= 0 && (x.seconds as number) <= 24 * 3600;
  if (x.cmd === "setCountTo") return typeof x.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(x.time);
  if (x.cmd === "setMode") return MODES.includes(x.mode as RemoteMode);
  return false;
}

export function remoteUrl(token: string, variant: "single" | "multi", loc: Location = window.location, basename = ""): string {
  return `${loc.origin}${basename}/clock/remote#k=${token}&v=${variant}`;
}
