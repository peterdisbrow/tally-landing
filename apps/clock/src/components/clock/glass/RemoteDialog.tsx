import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, RefreshCw, Smartphone, Unlink, X } from "lucide-react";
import { remoteUrl } from "@/lib/remote/protocol";
import { getRouterBasename } from "@/lib/clockBasename";
import type { useRemoteDisplay } from "@/lib/remote/useRemote";

type Remote = ReturnType<typeof useRemoteDisplay>;

/** "Control from phone": shows a QR code that pairs one phone (or a few) with this display only. */
export default function RemoteDialog({ variant, remote, onClose }: { variant: "single" | "multi"; remote: Remote; onClose: () => void }) {
  const { pairing, pair, unpair, peers, status } = remote;
  useEffect(() => { if (!pairing) pair(); }, [pairing, pair]);
  const url = useMemo(() => {
    if (!pairing) return "";
    const u = remoteUrl(pairing.token, variant, window.location, getRouterBasename() || "");
    const t = new URLSearchParams(location.search).get("remoteTransport");
    return t ? u.replace("/clock/remote#", `/clock/remote?remoteTransport=${t}#`) : u;
  }, [pairing, variant]);
  const [svg, setSvg] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (url) QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b0d0c", light: "#ffffff" } }).then(setSvg); }, [url]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const hours = pairing ? Math.max(0, Math.round((pairing.exp - Date.now()) / 3600e3)) : 0;
  const live = status === "open";
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose} data-testid="remote-dialog">
      <div className="gs-card gs-dialog rounded-3xl w-[400px] max-w-[92vw] p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Control from phone">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl grid place-items-center bg-[#22c55e]/15 text-[#22c55e] shrink-0"><Smartphone size={18} /></span>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-white">Control from phone</h2>
            <p className="text-[12px] text-white/50">Scan with your phone camera. No app or sign-in needed.</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white shrink-0" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="self-center rounded-2xl bg-white p-3 w-[232px] h-[232px]" data-testid="remote-qr" dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="flex items-center justify-center gap-2 text-[12px]" data-testid="remote-status">
          <span className={`w-2 h-2 rounded-full ${peers.remotes > 0 ? "bg-[#22c55e]" : live ? "bg-white/40" : "bg-amber-400 animate-pulse"}`} />
          <span className="text-white/70">{peers.remotes > 0 ? `${peers.remotes} phone${peers.remotes > 1 ? "s" : ""} connected` : live ? "Waiting for a phone" : "Connecting…"}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-white/40 text-center">This code only controls this screen. It is private to this pairing and expires in {hours} h. Anyone with the code can control the clock, so share it only with your team.</p>
        <div className="grid grid-cols-3 gap-2">
          <button className="gs-chip rounded-lg px-2 py-2 text-[12px] whitespace-nowrap flex items-center gap-1.5 justify-center" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}><Copy size={13} />{copied ? "Copied" : "Copy link"}</button>
          <button className="gs-chip rounded-lg px-2 py-2 text-[12px] whitespace-nowrap flex items-center gap-1.5 justify-center" onClick={() => pair()} title="Disconnects phones paired with the old code" data-testid="remote-new-code"><RefreshCw size={13} />New code</button>
          <button className="gs-chip rounded-lg px-2 py-2 text-[12px] whitespace-nowrap flex items-center gap-1.5 justify-center" onClick={() => { unpair(); onClose(); }} data-testid="remote-unpair"><Unlink size={13} />Turn off</button>
        </div>
      </div>
    </div>
  );
}
