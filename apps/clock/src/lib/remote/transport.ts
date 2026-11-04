/**
 * Transport for the phone remote. Production: the Tally relay's blind `clock-remote` WebSocket
 * (wss://api.tallyconnect.app/clock-remote, already allowed by the site CSP). Tests/local: a
 * BroadcastChannel with the same semantics (`?remoteTransport=local` or VITE_CLOCK_REMOTE_WS=local).
 */
export type Peers = { display: boolean; remotes: number };
export type Link = { send: (data: unknown) => void; close: () => void };
type Opts = { room: string; as: "display" | "remote"; onMessage: (m: unknown) => void; onPeers: (p: Peers) => void; onStatus: (s: "connecting" | "open" | "closed") => void };

export function remoteEndpoint(): string {
  const qs = typeof location !== "undefined" ? new URLSearchParams(location.search).get("remoteTransport") : null;
  if (qs === "local") return "local";
  return (import.meta.env.VITE_CLOCK_REMOTE_WS as string | undefined) || "wss://api.tallyconnect.app/clock-remote";
}

export function connect(o: Opts, endpoint = remoteEndpoint()): Link {
  if (endpoint === "local") return localLink(o);
  let ws: WebSocket | null = null, closed = false, retry = 0, timer: ReturnType<typeof setTimeout> | null = null;
  const open = () => {
    if (closed) return;
    o.onStatus("connecting");
    ws = new WebSocket(endpoint);
    ws.onopen = () => { retry = 0; ws!.send(JSON.stringify({ t: "join", room: o.room, as: o.as })); o.onStatus("open"); };
    ws.onmessage = (ev) => { let m: { t?: string; display?: boolean; remotes?: number }; try { m = JSON.parse(String(ev.data)); } catch { return; } if (m.t === "peers") o.onPeers({ display: !!m.display, remotes: m.remotes || 0 }); else o.onMessage(m); };
    ws.onclose = () => { o.onStatus("closed"); if (!closed) timer = setTimeout(open, Math.min(15000, 500 * 2 ** retry++)); };
    ws.onerror = () => ws?.close();
  };
  open();
  return { send: (d) => { if (ws?.readyState === 1) ws.send(JSON.stringify(d)); }, close: () => { closed = true; if (timer) clearTimeout(timer); ws?.close(); } };
}

function localLink(o: Opts): Link {
  const ch = new BroadcastChannel(`clock-remote:${o.room}`);
  const me = Math.random().toString(36).slice(2);
  const seen = new Map<string, { as: string; at: number }>();
  const emitPeers = () => { const now = Date.now(); for (const [k, v] of seen) if (now - v.at > 4000) seen.delete(k); const v = [...seen.values()]; o.onPeers({ display: o.as === "display" || v.some((x) => x.as === "display"), remotes: v.filter((x) => x.as === "remote").length + (o.as === "remote" ? 1 : 0) }); };
  ch.onmessage = (ev) => { const m = ev.data as { t: string; as?: string; id?: string; data?: unknown }; if (m.t === "hb") { seen.set(m.id!, { as: m.as!, at: Date.now() }); emitPeers(); } else if (m.t === "data" && m.as !== o.as) o.onMessage(m.data); };
  const hb = () => ch.postMessage({ t: "hb", as: o.as, id: me });
  hb(); const id = setInterval(() => { hb(); emitPeers(); }, 1000);
  setTimeout(() => o.onStatus("open"), 0);
  return { send: (d) => ch.postMessage({ t: "data", as: o.as, data: d }), close: () => { clearInterval(id); ch.close(); } };
}
