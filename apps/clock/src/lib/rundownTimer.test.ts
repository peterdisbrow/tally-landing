import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeRundownReadout, formatRundownSeconds, maskRundownToken, parseRundownLink,
  resetRundownConnections, setRundownSocketFactory, subscribeRundownTimer,
  RUNDOWN_TIMER_WS_URL, type RundownTimerFeed, type RundownTimerSnapshot,
} from "./rundownTimer";
import { FakeSocket } from "@/test/fakeSocket";

const TOKEN = "a".repeat(32) + "0123456789abcdef0123456789abcdef";

describe("parseRundownLink", () => {
  it("reads the token from every display page", () => {
    for (const page of ["timer", "view", "show", "confidence", "clock", "follow", "prompter"]) {
      expect(parseRundownLink(`https://api.tallyconnect.app/rundown/${page}/${TOKEN}`)).toBe(TOKEN);
    }
  });
  it("accepts the standalone Rundown host, query strings and surrounding spaces", () => {
    expect(parseRundownLink(`  https://rundown.tallyconnect.app/rundown/timer/${TOKEN}?room=r1&mode=stage#x `)).toBe(TOKEN);
  });
  it("accepts the public API path and a bare token", () => {
    expect(parseRundownLink(`https://api.tallyconnect.app/api/public/rundown/${TOKEN}`)).toBe(TOKEN);
    expect(parseRundownLink(TOKEN)).toBe(TOKEN);
  });
  it("rejects other links, short tokens and junk", () => {
    expect(parseRundownLink("")).toBeNull();
    expect(parseRundownLink("hello world")).toBeNull();
    expect(parseRundownLink("https://example.com/")).toBeNull();
    expect(parseRundownLink("https://api.tallyconnect.app/rundown/timer/short")).toBeNull();
    expect(parseRundownLink("https://api.tallyconnect.app/rundown/nope/" + TOKEN)).toBeNull();
  });
  it("never shows the whole token", () => {
    expect(maskRundownToken(TOKEN)).not.toContain(TOKEN);
    expect(maskRundownToken(TOKEN)).toBe(`${TOKEN.slice(0, 4)}…${TOKEN.slice(-4)}`);
  });
});

describe("formatRundownSeconds", () => {
  it("uses mm:ss under an hour and h:mm:ss over", () => {
    expect(formatRundownSeconds(0)).toBe("00:00");
    expect(formatRundownSeconds(65)).toBe("01:05");
    expect(formatRundownSeconds(3600)).toBe("1:00:00");
    expect(formatRundownSeconds(5400 + 9)).toBe("1:30:09");
    expect(formatRundownSeconds(12, "+")).toBe("+00:12");
  });
});

const NOW = 1_800_000_000_000;
const feed = (snapshot: RundownTimerSnapshot | null, over: Partial<RundownTimerFeed> = {}): RundownTimerFeed =>
  ({ status: "open", snapshot, receivedAt: snapshot ? NOW : null, ended: false, ...over });
const live = (extra: RundownTimerSnapshot = {}): RundownTimerSnapshot => ({
  is_live: true, plan_title: "Between Sundays", cue_title: "Session 3", cue_duration_seconds: 4500,
  elapsed_seconds: 100, remaining_seconds: 300, overtime_seconds: 0, is_overtime: false, is_warning: false,
  service_elapsed: 1000, service_remaining: 2000, server_timestamp: NOW, ...extra,
});

describe("computeRundownReadout", () => {
  it("shows prompts until there is a link and a first message", () => {
    expect(computeRundownReadout(feed(null, { status: "idle" }), "cue", NOW, false).subtitle).toBe("Paste Rundown link");
    expect(computeRundownReadout(feed(null, { status: "connecting" }), "cue", NOW, true).subtitle).toBe("Connecting…");
    expect(computeRundownReadout(feed(null, { status: "invalid" }), "cue", NOW, true).subtitle).toBe("Link not valid or expired");
  });

  it("counts the current cue down, advancing between messages with the synced clock", () => {
    const f = feed(live());
    expect(computeRundownReadout(f, "cue", NOW, true).text).toBe("05:00");
    expect(computeRundownReadout(f, "cue", NOW + 2500, true).text).toBe("04:57");
    const r = computeRundownReadout(f, "cue", NOW + 2500, true);
    expect(r.subtitle).toBe("Session 3");
    expect(r.overtime).toBe(false);
  });

  it("flags the warning window and keeps it below zero as overtime", () => {
    expect(computeRundownReadout(feed(live({ remaining_seconds: 20, is_warning: true })), "cue", NOW, true).warning).toBe(true);
    const r = computeRundownReadout(feed(live({ remaining_seconds: 2, is_warning: true })), "cue", NOW + 5000, true);
    expect(r.overtime).toBe(true);
    expect(r.text).toBe("+00:03");
  });

  it("shows overtime as +mm:ss and keeps counting up", () => {
    const f = feed(live({ is_overtime: true, remaining_seconds: 0, overtime_seconds: 65 }));
    const r = computeRundownReadout(f, "cue", NOW + 1000, true);
    expect(r.overtime).toBe(true);
    expect(r.text).toBe("+01:06");
    expect(r.subtitle).toBe("OVER · Session 3");
  });

  it("holds a paused cue but not the show clocks", () => {
    const f = feed(live({ is_paused: true }));
    expect(computeRundownReadout(f, "cue", NOW + 10_000, true).text).toBe("05:00");
    expect(computeRundownReadout(f, "cue", NOW + 10_000, true).subtitle).toBe("PAUSED · Session 3");
    expect(computeRundownReadout(f, "elapsed", NOW + 10_000, true).text).toBe("16:50");
  });

  it("counts a cue with no length up from its start", () => {
    const f = feed(live({ remaining_seconds: null, cue_duration_seconds: 0, elapsed_seconds: 30 }));
    const r = computeRundownReadout(f, "cue", NOW + 1000, true);
    expect(r.text).toBe("00:31");
    expect(r.overtime).toBe(false);
  });

  it("shows show remaining and show elapsed", () => {
    const f = feed(live({ service_elapsed: 5400, service_remaining: 3600 }));
    expect(computeRundownReadout(f, "remaining", NOW + 1000, true).text).toBe("59:59");
    expect(computeRundownReadout(f, "remaining", NOW + 1000, true).subtitle).toBe("SHOW REMAINING · Between Sundays");
    expect(computeRundownReadout(f, "elapsed", NOW + 1000, true).text).toBe("1:30:01");
    expect(computeRundownReadout(feed(live({ service_remaining: 20 })), "remaining", NOW + 25_000, true).text).toBe("00:00");
  });

  it("never runs backwards when the relay stamp is ahead of the synced clock", () => {
    const f = feed(live({ server_timestamp: NOW + 4000 }));
    expect(computeRundownReadout(f, "cue", NOW, true).text).toBe("05:00");
  });

  it("says Not live / Ended instead of stale numbers", () => {
    expect(computeRundownReadout(feed({ is_live: false, plan_title: "Between Sundays" }), "cue", NOW, true).subtitle).toBe("Between Sundays · Not live");
    const ended = computeRundownReadout(feed({ is_live: false, plan_title: "Between Sundays" }, { ended: true }), "elapsed", NOW, true);
    expect(ended.subtitle).toBe("Between Sundays · Ended");
    expect(ended.text).toBe("- - -");
  });

  it("stops trusting a snapshot after 30s without a connection", () => {
    const f = feed(live(), { status: "reconnecting" });
    expect(computeRundownReadout(f, "cue", NOW + 10_000, true).text).toBe("04:50");
    const old = computeRundownReadout(f, "cue", NOW + 31_000, true);
    expect(old.text).toBe("- - -");
    expect(old.subtitle).toBe("Reconnecting…");
    expect(computeRundownReadout(feed(live()), "cue", NOW + 31_000, true).subtitle).toBe("No signal");
  });
});

describe("rundown timer connection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    FakeSocket.reset();
    resetRundownConnections();
    setRundownSocketFactory((url) => new FakeSocket(url) as unknown as WebSocket);
    vi.stubGlobal("WebSocket", FakeSocket);
  });
  afterEach(() => {
    resetRundownConnections();
    setRundownSocketFactory(null);
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("connects through the Tally proxy and subscribes", () => {
    const seen: RundownTimerFeed[] = [];
    subscribeRundownTimer(TOKEN, (f) => seen.push(f));
    const ws = FakeSocket.last;
    expect(ws.url).toBe(`${RUNDOWN_TIMER_WS_URL}?token=${TOKEN}`);
    expect(ws.url.startsWith("wss://api.tallyconnect.app/rundown-timer?")).toBe(true);
    ws.serverOpen();
    expect(JSON.parse(ws.sent[0])).toEqual({ type: "subscribe_timer", token: TOKEN });
    ws.serverSend({ type: "timer_state", ...live() });
    const last = seen[seen.length - 1];
    expect(last.status).toBe("open");
    expect(last.snapshot?.cue_title).toBe("Session 3");
    ws.serverSend({ type: "rundown_ended", planTitle: "Between Sundays" });
    expect(seen[seen.length - 1].ended).toBe(true);
    ws.serverSend({ type: "rundown_timer", ...live() });
    expect(seen[seen.length - 1].ended).toBe(false);
  });

  it("shares one socket between cells with the same link and closes it when none remain", () => {
    const a = subscribeRundownTimer(TOKEN, () => {});
    const b = subscribeRundownTimer(TOKEN, () => {});
    expect(FakeSocket.instances).toHaveLength(1);
    a(); b();
    vi.advanceTimersByTime(2000);
    expect(FakeSocket.last.readyState).toBe(3);
  });

  it("reconnects with backoff after a drop and keeps the last snapshot", () => {
    const seen: RundownTimerFeed[] = [];
    subscribeRundownTimer(TOKEN, (f) => seen.push(f));
    let ws = FakeSocket.last;
    ws.serverOpen();
    ws.serverSend({ type: "timer_state", ...live() });
    ws.serverClose(1006);
    expect(seen[seen.length - 1].status).toBe("reconnecting");
    expect(seen[seen.length - 1].snapshot).not.toBeNull();
    expect(FakeSocket.instances).toHaveLength(1);
    vi.advanceTimersByTime(1300);
    expect(FakeSocket.instances).toHaveLength(2);
    ws = FakeSocket.last;
    ws.serverClose(1006); // second failure waits longer
    vi.advanceTimersByTime(1000);
    expect(FakeSocket.instances).toHaveLength(2);
    vi.advanceTimersByTime(1500);
    expect(FakeSocket.instances).toHaveLength(3);
    FakeSocket.last.serverOpen();
    expect(seen[seen.length - 1].status).toBe("open");
    // backoff resets after a good connection
    FakeSocket.last.serverClose(1006);
    vi.advanceTimersByTime(1300);
    expect(FakeSocket.instances).toHaveLength(4);
  });

  it("does not retry a share link the relay rejects", () => {
    const seen: RundownTimerFeed[] = [];
    subscribeRundownTimer(TOKEN, (f) => seen.push(f));
    FakeSocket.last.serverClose(1008, "invalid share token");
    expect(seen[seen.length - 1].status).toBe("invalid");
    vi.advanceTimersByTime(60_000);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it("drops a half-open socket that went silent and reconnects", () => {
    subscribeRundownTimer(TOKEN, () => {});
    const ws = FakeSocket.last;
    ws.serverOpen();
    vi.advanceTimersByTime(10_000);
    expect(ws.sent.some((m) => JSON.parse(m).type === "ping")).toBe(true);
    vi.advanceTimersByTime(20_000); // no pong, no data for > 25s
    expect(ws.readyState).toBe(3);
    vi.advanceTimersByTime(1500);
    expect(FakeSocket.instances.length).toBeGreaterThanOrEqual(2);
  });
});
