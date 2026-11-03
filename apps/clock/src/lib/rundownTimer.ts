/**
 * Rundown timer feed for the clock (Tally sign-in only).
 *
 * A Rundown display/share link carries a share token. The clock connects to the
 * Tally relay at wss://api.tallyconnect.app/rundown-timer?token=... (Tally
 * forwards it to the Rundown service when RUNDOWN_UPSTREAM is set) and receives
 * `timer_state` / `rundown_timer` snapshots about once a second while a rundown
 * is live, plus `rundown_ended` when the show is over.
 *
 * Snapshots are whole seconds and carry the relay's `server_timestamp`. The
 * cell advances them locally using the clock's own Tally time sync
 * (`syncServerTime`, which measures against the same api.tallyconnect.app host),
 * so the display ticks smoothly between messages.
 */

export const RUNDOWN_TIMER_WS_URL = "wss://api.tallyconnect.app/rundown-timer";

export type RundownTimerSub = "cue" | "remaining" | "elapsed";

export const RUNDOWN_SUB_LABELS: Record<RundownTimerSub, string> = {
  cue: "Cue countdown",
  remaining: "Show remaining",
  elapsed: "Show elapsed",
};

export type RundownTimerSnapshot = {
  plan_id?: string;
  plan_title?: string;
  cue_title?: string;
  cue_index?: number;
  total_cues?: number;
  cue_duration_seconds?: number;
  elapsed_seconds?: number;
  remaining_seconds?: number | null;
  overtime_seconds?: number;
  is_overtime?: boolean;
  is_warning?: boolean;
  is_live?: boolean;
  is_paused?: boolean;
  next_cue_title?: string | null;
  service_elapsed?: number;
  service_remaining?: number;
  server_timestamp?: number;
};

export type RundownConnectionStatus = "idle" | "connecting" | "open" | "reconnecting" | "invalid";

export type RundownTimerFeed = {
  status: RundownConnectionStatus;
  /** Latest snapshot (null until the first message arrives). */
  snapshot: RundownTimerSnapshot | null;
  /** Local epoch ms when the latest message arrived. */
  receivedAt: number | null;
  /** True after the relay said the show ended and until a new live snapshot. */
  ended: boolean;
};

const SHARE_PAGES = ["view", "timer", "show", "confidence", "clock", "follow", "prompter"];
const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * Accepts any Rundown display/share link
 * (https://.../rundown/timer/<token>, /rundown/view/<token>, /api/public/rundown/<token>)
 * or a bare share token, and returns the token. Returns null when it is not one.
 */
export function parseRundownLink(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  if (TOKEN_RE.test(raw)) return raw;

  let path = raw;
  try {
    path = new URL(raw, "https://placeholder.invalid").pathname;
  } catch {
    return null;
  }
  const parts = path.split("/").filter(Boolean).map((p) => {
    try { return decodeURIComponent(p); } catch { return p; }
  });
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] === "rundown" && SHARE_PAGES.includes(parts[i + 1]) && parts[i + 2] && TOKEN_RE.test(parts[i + 2])) {
      return parts[i + 2];
    }
    if (parts[i] === "public" && parts[i + 1] === "rundown" && parts[i + 2] && TOKEN_RE.test(parts[i + 2])) {
      return parts[i + 2];
    }
  }
  return null;
}

/** Shown in the settings panel instead of the secret token. */
export function maskRundownToken(token: string): string {
  return token.length <= 10 ? "••••" : `${token.slice(0, 4)}…${token.slice(-4)}`;
}

/** Extrapolating past this long without a message is not trusted. */
export const RUNDOWN_STALE_AFTER_MS = 30_000;

export type RundownReadout = {
  /** Digits to show, or "- - -" when there is nothing trustworthy to show. */
  text: string;
  subtitle: string;
  /** Cue is past its time (cue mode). */
  overtime: boolean;
  /** Cue is inside its warning window (cue mode). */
  warning: boolean;
  /** True when the feed is live and the numbers are being updated. */
  live: boolean;
  /** Seconds the displayed value is derived from; null when no digits. */
  seconds: number | null;
};

export function formatRundownSeconds(totalSeconds: number, prefix = ""): string {
  const abs = Math.max(0, Math.floor(Math.abs(totalSeconds)));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const body = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${prefix}${body}`;
}

const BLANK = "- - -";

/**
 * Turn the latest snapshot into what the cell shows right now.
 * `nowMs` must already include the clock's Tally time-sync offset.
 */
export function computeRundownReadout(
  feed: RundownTimerFeed,
  sub: RundownTimerSub,
  nowMs: number,
  hasLink: boolean,
): RundownReadout {
  const off = (subtitle: string): RundownReadout =>
    ({ text: BLANK, subtitle, overtime: false, warning: false, live: false, seconds: null });

  if (!hasLink) return off("Paste Rundown link");
  if (feed.status === "invalid") return off("Link not valid or expired");

  const snap = feed.snapshot;
  const received = feed.receivedAt;
  if (!snap || received == null) {
    return off(feed.status === "reconnecting" ? "Reconnecting…" : "Connecting…");
  }

  const plan = snap.plan_title ? snap.plan_title : "Rundown";
  if (feed.ended || !snap.is_live) return off(feed.ended ? `${plan} · Ended` : `${plan} · Not live`);

  // A live show sends a snapshot every second. Silence this long means we lost
  // the feed, so show that instead of a number that may be wrong.
  if (nowMs - received > RUNDOWN_STALE_AFTER_MS) {
    return off(feed.status === "open" ? "No signal" : "Reconnecting…");
  }

  // How long ago the relay produced this snapshot, on the synced clock.
  const stamp = typeof snap.server_timestamp === "number" ? snap.server_timestamp : null;
  const sinceMs = stamp != null ? nowMs - stamp : nowMs - received;
  // A skewed offset must never run the display backwards or far ahead.
  const delta = Math.min(RUNDOWN_STALE_AFTER_MS, Math.max(0, sinceMs)) / 1000;

  if (sub === "elapsed") {
    const base = snap.service_elapsed;
    if (typeof base !== "number") return off(`${plan} · No show time`);
    const seconds = base + delta;
    return { text: formatRundownSeconds(seconds), subtitle: `SHOW ELAPSED · ${plan}`, overtime: false, warning: false, live: true, seconds };
  }

  if (sub === "remaining") {
    const base = snap.service_remaining;
    if (typeof base !== "number") return off(`${plan} · No show time`);
    const seconds = Math.max(0, base - delta);
    return { text: formatRundownSeconds(seconds), subtitle: `SHOW REMAINING · ${plan}`, overtime: false, warning: false, live: true, seconds };
  }

  // Current cue countdown. Paused cues hold their value.
  const advance = snap.is_paused ? 0 : delta;
  const title = snap.cue_title || "";
  const label = title ? title : "No cue";
  const paused = snap.is_paused ? "PAUSED · " : "";

  if (snap.is_overtime) {
    const seconds = (snap.overtime_seconds || 0) + advance;
    return { text: formatRundownSeconds(seconds, "+"), subtitle: `${paused}OVER · ${label}`, overtime: true, warning: false, live: true, seconds };
  }
  if (typeof snap.remaining_seconds === "number") {
    const remaining = snap.remaining_seconds - advance;
    if (remaining < 0) {
      // Snapshot says on time but we advanced past zero before the next one arrived.
      return { text: formatRundownSeconds(-remaining, "+"), subtitle: `${paused}OVER · ${label}`, overtime: true, warning: false, live: true, seconds: -remaining };
    }
    return {
      text: formatRundownSeconds(remaining),
      subtitle: `${paused}${label}`,
      overtime: false,
      warning: !!snap.is_warning && remaining > 0,
      live: true,
      seconds: remaining,
    };
  }
  // Cue without a set length: count up from its start.
  const seconds = (snap.elapsed_seconds || 0) + advance;
  return { text: formatRundownSeconds(seconds), subtitle: `${paused}${label} · no length set`, overtime: false, warning: false, live: true, seconds };
}

// ─── Connection (one socket per share token, shared by every cell using it) ───

type Listener = (feed: RundownTimerFeed) => void;

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10_000;
const PING_EVERY_MS = 10_000;
const DEAD_AFTER_MS = 25_000;

export type SocketFactory = (url: string) => WebSocket;

class RundownTimerConnection {
  feed: RundownTimerFeed = { status: "connecting", snapshot: null, receivedAt: null, ended: false };
  private listeners = new Set<Listener>();
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private attempt = 0;
  private lastMessageAt = 0;
  private destroyed = false;

  constructor(
    private token: string,
    private makeSocket: SocketFactory,
    private onIdle: () => void,
  ) {
    this.onOnline = this.onOnline.bind(this);
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.onOnline);
      document.addEventListener("visibilitychange", this.onOnline);
    }
    this.connect();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.feed);
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0) {
        // Let React strict-mode remounts and quick re-renders reuse the socket.
        setTimeout(() => { if (this.listeners.size === 0) this.onIdle(); }, 1500);
      }
    };
  }

  private set(next: Partial<RundownTimerFeed>) {
    this.feed = { ...this.feed, ...next };
    this.listeners.forEach((fn) => fn(this.feed));
  }

  restart() {
    if (this.destroyed) return;
    this.attempt = 0;
    this.connect();
  }

  private onOnline() {
    if (this.destroyed || this.feed.status === "invalid") return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
      this.attempt = 0;
      this.connect();
    }
  }

  private connect() {
    if (this.destroyed) return;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    this.teardownSocket();
    this.set({ status: this.feed.snapshot ? "reconnecting" : "connecting" });

    let ws: WebSocket;
    try {
      ws = this.makeSocket(`${RUNDOWN_TIMER_WS_URL}?token=${encodeURIComponent(this.token)}`);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      if (this.ws !== ws) return;
      this.attempt = 0;
      this.lastMessageAt = Date.now();
      this.set({ status: "open" });
      try { ws.send(JSON.stringify({ type: "subscribe_timer", token: this.token })); } catch { /* closed */ }
      this.startPing();
    };

    ws.onmessage = (evt) => {
      if (this.ws !== ws) return;
      this.lastMessageAt = Date.now();
      let msg: { type?: string } & RundownTimerSnapshot;
      try { msg = JSON.parse(String(evt.data)); } catch { return; }
      if (msg.type === "rundown_timer" || msg.type === "timer_state") {
        this.set({ snapshot: msg, receivedAt: Date.now(), ended: false, status: "open" });
      } else if (msg.type === "rundown_ended") {
        const planTitle = (msg as { planTitle?: string }).planTitle || msg.plan_title;
        this.set({ snapshot: { is_live: false, plan_title: planTitle }, receivedAt: Date.now(), ended: true });
      }
    };

    ws.onerror = () => { try { ws.close(); } catch { /* already closed */ } };

    ws.onclose = (evt) => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.stopPing();
      if (this.destroyed) return;
      // The relay closes 1008 for a share token it does not know or has expired.
      if (evt.code === 1008) {
        this.set({ status: "invalid" });
        return;
      }
      this.scheduleReconnect();
    };
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      const ws = this.ws;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (Date.now() - this.lastMessageAt > DEAD_AFTER_MS) {
        // Half-open socket (laptop sleep, Wi-Fi change): drop it and start over.
        try { ws.close(); } catch { /* already closed */ }
        return;
      }
      try { ws.send(JSON.stringify({ type: "ping" })); } catch { /* closing */ }
    }, PING_EVERY_MS);
  }

  private stopPing() {
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null; }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer) return;
    this.set({ status: "reconnecting" });
    const base = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(1.5, this.attempt));
    const delay = Math.round(base * (0.8 + Math.random() * 0.4));
    this.attempt++;
    this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; this.connect(); }, delay);
  }

  private teardownSocket() {
    this.stopPing();
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
      try { ws.close(); } catch { /* already closed */ }
    }
  }

  destroy() {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.teardownSocket();
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.onOnline);
      document.removeEventListener("visibilitychange", this.onOnline);
    }
    this.listeners.clear();
  }
}

const connections = new Map<string, RundownTimerConnection>();
let socketFactory: SocketFactory = (url) => new WebSocket(url);

/** Tests inject a fake socket. */
export function setRundownSocketFactory(factory: SocketFactory | null) {
  socketFactory = factory ?? ((url) => new WebSocket(url));
}

export function resetRundownConnections() {
  connections.forEach((c) => c.destroy());
  connections.clear();
}

/** Subscribe to a share token's timer feed. Cells with the same token share one socket. */
export function subscribeRundownTimer(token: string, fn: Listener): () => void {
  let conn = connections.get(token);
  if (!conn) {
    const created = new RundownTimerConnection(token, socketFactory, () => {
      if (connections.get(token) === created) connections.delete(token);
      created.destroy();
    });
    connections.set(token, created);
    conn = created;
  }
  return conn.subscribe(fn);
}

/** Retry now (used by the cell's Reconnect button after an invalid link). */
export function restartRundownTimer(token: string) {
  connections.get(token)?.restart();
}
