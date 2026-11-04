import { useCallback, useEffect, useRef, useState } from "react";
import { connect, type Peers } from "./transport";
import { type EndReason, createVerifier, isToken, newSenderId, newToken, PAIRING_TTL_MS, roomId, seal, validCmd, type Body, type RemoteCmd, type RemoteState } from "./protocol";

type Pairing = { token: string; exp: number };
const KEY = (v: string) => `clock-remote-pairing-${v}`;
const load = (v: string): Pairing | null => { try { const p = JSON.parse(localStorage.getItem(KEY(v)) || "null"); return p && isToken(p.token) && p.exp > Date.now() ? p : null; } catch { return null; } };

/** Display side: owns the pairing token, obeys only signed commands from it, publishes state. */
export function useRemoteDisplay(variant: "single" | "multi", getState: () => RemoteState, onCommand: (c: RemoteCmd, clockId?: string) => void) {
  const [pairing, setPairing] = useState<Pairing | null>(() => load(variant));
  const [peers, setPeers] = useState<Peers>({ display: true, remotes: 0 });
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("closed");
  const getRef = useRef(getState); getRef.current = getState;
  const cmdRef = useRef(onCommand); cmdRef.current = onCommand;

  // Why the current pairing is ending (set just before it changes), so phones can be told.
  const endRef = useRef<EndReason | null>(null);
  const pair = useCallback(() => { endRef.current = "revoked"; const p = { token: newToken(), exp: Date.now() + PAIRING_TTL_MS }; localStorage.setItem(KEY(variant), JSON.stringify(p)); setPairing(p); return p; }, [variant]);
  const unpair = useCallback((reason: EndReason = "revoked") => { endRef.current = reason; localStorage.removeItem(KEY(variant)); setPairing(null); }, [variant]);

  useEffect(() => {
    if (!pairing) return;
    let link: ReturnType<typeof connect> | null = null, stop = false, seq = 0;
    const from = newSenderId(); const verify = createVerifier(pairing.token);
    const push = async () => { if (link) link.send(await seal(pairing.token, from, seq++, { k: "state", s: { ...getRef.current(), exp: pairing.exp } })); };
    roomId(pairing.token).then((room) => {
      if (stop) return;
      link = connect({ room, as: "display", onStatus: setStatus, onPeers: (p) => { setPeers(p); push(); },
        onMessage: async (m) => { const b = await verify(m) as Body | null; if (!b) return; if (b.k === "cmd" && validCmd(b.c)) { cmdRef.current(b.c, b.clockId); setTimeout(push, 120); } else if (b.k === "hello") push(); } });
    });
    const id = setInterval(push, 1000);
    const expire = setTimeout(() => unpair("expired"), Math.max(0, pairing.exp - Date.now()));
    endRef.current = null;
    return () => {
      stop = true; clearInterval(id); clearTimeout(expire);
      const l = link, reason = endRef.current;
      if (l && reason) seal(pairing.token, from, seq++, { k: "ended", reason }).then((e) => { l.send(e); setTimeout(() => l.close(), 400); }, () => l.close());
      else l?.close();
    };
  }, [pairing, unpair]);

  return { pairing, pair, unpair, peers, status };
}

/** Phone side: verifies the display's signed state and sends signed commands. */
export function useRemoteController(token: string | null) {
  const [state, setState] = useState<RemoteState | null>(null);
  const [ended, setEnded] = useState<EndReason | null>(null);
  const [peers, setPeers] = useState<Peers>({ display: false, remotes: 0 });
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("closed");
  const sendRef = useRef<(b: Body) => void>(() => {});
  useEffect(() => {
    if (!token) return;
    let link: ReturnType<typeof connect> | null = null, stop = false, seq = 0;
    const from = newSenderId(); const verify = createVerifier(token);
    sendRef.current = async (b) => { if (link) link.send(await seal(token, from, seq++, b)); };
    roomId(token).then((room) => {
      if (stop) return;
      link = connect({ room, as: "remote", onStatus: (s) => { setStatus(s); if (s === "open") sendRef.current({ k: "hello" }); }, onPeers: setPeers,
        onMessage: async (m) => { const b = await verify(m); if (b?.k === "state") setState(b.s); else if (b?.k === "ended") setEnded(b.reason); } });
    });
    return () => { stop = true; link?.close(); };
  }, [token]);
  const send = useCallback((c: RemoteCmd, clockId?: string) => sendRef.current({ k: "cmd", c, clockId }), []);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const endedReason: EndReason | null = ended || (state?.exp && now > state.exp ? "expired" : null);
  return { state, peers, status, send, ended: endedReason };
}
