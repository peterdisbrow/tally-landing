import { useCallback, useEffect, useRef, useState } from "react";
import { connect, type Peers } from "./transport";
import { createVerifier, isToken, newSenderId, newToken, PAIRING_TTL_MS, roomId, seal, validCmd, type Body, type RemoteCmd, type RemoteState } from "./protocol";

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

  const pair = useCallback(() => { const p = { token: newToken(), exp: Date.now() + PAIRING_TTL_MS }; localStorage.setItem(KEY(variant), JSON.stringify(p)); setPairing(p); return p; }, [variant]);
  const unpair = useCallback(() => { localStorage.removeItem(KEY(variant)); setPairing(null); }, [variant]);

  useEffect(() => {
    if (!pairing) return;
    let link: ReturnType<typeof connect> | null = null, stop = false, seq = 0;
    const from = newSenderId(); const verify = createVerifier(pairing.token);
    const push = async () => { if (link) link.send(await seal(pairing.token, from, seq++, { k: "state", s: getRef.current() })); };
    roomId(pairing.token).then((room) => {
      if (stop) return;
      link = connect({ room, as: "display", onStatus: setStatus, onPeers: (p) => { setPeers(p); push(); },
        onMessage: async (m) => { const b = await verify(m) as Body | null; if (!b) return; if (b.k === "cmd" && validCmd(b.c)) { cmdRef.current(b.c, b.clockId); setTimeout(push, 120); } else if (b.k === "hello") push(); } });
    });
    const id = setInterval(push, 1000);
    const expire = setTimeout(() => unpair(), Math.max(0, pairing.exp - Date.now()));
    return () => { stop = true; clearInterval(id); clearTimeout(expire); link?.close(); };
  }, [pairing, unpair]);

  return { pairing, pair, unpair, peers, status };
}

/** Phone side: verifies the display's signed state and sends signed commands. */
export function useRemoteController(token: string | null) {
  const [state, setState] = useState<RemoteState | null>(null);
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
        onMessage: async (m) => { const b = await verify(m); if (b?.k === "state") setState(b.s); } });
    });
    return () => { stop = true; link?.close(); };
  }, [token]);
  const send = useCallback((c: RemoteCmd, clockId?: string) => sendRef.current({ k: "cmd", c, clockId }), []);
  return { state, peers, status, send };
}
