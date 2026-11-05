import { useEffect, useMemo, useState } from "react";
import { parseTimeOfDay } from "@/lib/countTo";
import { Minus, Pause, Play, Plus, QrCode, RotateCcw, Smartphone, WifiOff } from "lucide-react";
import { isToken, type RemoteMode } from "@/lib/remote/protocol";
import { useRemoteController } from "@/lib/remote/useRemote";
import { parseDuration } from "@/lib/timerAdjust";

const SS_KEY = "clock-remote-token";
/** Read the pairing token from the URL fragment, keep it for this tab only, and strip it from the address bar. */
function readToken(): { token: string | null; variant: string } {
  const h = new URLSearchParams(location.hash.slice(1));
  const k = h.get("k");
  if (isToken(k)) {
    sessionStorage.setItem(SS_KEY, JSON.stringify({ k, v: h.get("v") || "single" }));
    history.replaceState(null, "", location.pathname + location.search);
  }
  try { const s = JSON.parse(sessionStorage.getItem(SS_KEY) || "null"); if (s && isToken(s.k)) return { token: s.k, variant: s.v }; } catch { /* ignore */ }
  return { token: null, variant: "single" };
}

const MODES: { value: RemoteMode; label: string }[] = [{ value: "clock", label: "Clock" }, { value: "countup", label: "Count Up" }, { value: "countdown", label: "Countdown" }, { value: "countto", label: "Count To" }];
const QUICK = [300, 600, 900, 1800, 3600];
const MODE_NAME: Record<string, string> = { clock: "Clock", countup: "Count Up", countdown: "Countdown", countto: "Count To", rundown: "Rundown", timecode: "Timecode" };

export default function Remote() {
  const { token } = useMemo(readToken, []);
  const { state, peers, status, send, ended } = useRemoteController(token);
  const [sel, setSel] = useState<string | null>(null);
  const [entry, setEntry] = useState("");
  const [toEntry, setToEntry] = useState("");
  useEffect(() => { document.documentElement.dataset.look = "glass"; document.title = "Clock remote · TallyConnect"; }, []);
  const clocks = state?.clocks || [];
  const cur = clocks.find((c) => c.id === sel) || clocks[0];
  const online = status === "open" && peers.display && !!state;
  const timing = cur && (cur.mode === "countup" || cur.mode === "countdown" || cur.mode === "countto");
  const go = (c: Parameters<typeof send>[0]) => { if (cur) { send(c, cur.id); navigator.vibrate?.(10); } };

  if (!token) return (
    <div className="min-h-[100dvh] grid place-items-center p-6 text-center" data-testid="remote-unpaired">
      <div className="gs-card gs-dialog rounded-3xl p-6 max-w-sm flex flex-col items-center gap-3">
        <Smartphone className="text-[#22c55e]" />
        <h1 className="text-white text-lg font-semibold">Scan the code on the clock</h1>
        <p className="text-white/50 text-sm">On the TallyConnect clock, open the phone button (Control from phone) and scan the QR code with your camera.</p>
      </div>
    </div>
  );

  if (ended) return (
    <div className="min-h-[100dvh] grid place-items-center p-6 text-center" data-testid="remote-ended" data-reason={ended}>
      <div className="gs-card gs-dialog rounded-3xl p-6 max-w-sm flex flex-col items-center gap-3">
        <span className="w-11 h-11 rounded-2xl grid place-items-center bg-amber-400/15 text-amber-300"><QrCode size={22} /></span>
        <h1 className="text-white text-lg font-semibold">{ended === "expired" ? "This pairing has expired" : "This code was turned off"}</h1>
        <p className="text-white/55 text-sm">{ended === "expired" ? "Pairings last 12 hours." : "The clock made a new code or stopped phone control."} Scan the new QR code on the clock (phone button, Control from phone) to keep going.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto px-4 pt-4 pb-8 flex flex-col gap-4 select-none" data-testid="remote-page">
      <header className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl grid place-items-center bg-[#22c55e]/15 text-[#22c55e] shrink-0"><Smartphone size={18} /></span>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-[15px] font-semibold truncate">Clock remote</h1>
          <p className="text-[12px] text-white/45 truncate">TallyConnect{state?.variant === "multi" ? " · Multi-clock" : ""}</p>
        </div>
        <span className={`flex items-center gap-1.5 text-[12px] shrink-0 ${online ? "text-[#4ade80]" : "text-amber-300"}`} data-testid="remote-link">
          {online ? <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> : <WifiOff size={14} />}{online ? "Connected" : status === "open" ? "Clock offline" : "Connecting…"}
        </span>
      </header>

      {clocks.length > 1 && (
        <div className="grid grid-cols-2 gap-2" data-testid="remote-clocks">
          {clocks.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)} data-on={cur?.id === c.id ? "" : undefined} className="gs-chip rounded-xl px-3 py-2 text-left min-w-0">
              <span className="flex items-center gap-2 min-w-0"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} /><span className="truncate text-[13px] font-semibold">{c.name}</span></span>
              <span className="block font-mono text-[12px] text-white/50 truncate">{c.text || "—"}</span>
            </button>
          ))}
        </div>
      )}

      <section className="gs-card rounded-3xl p-5 flex flex-col items-center gap-1" data-testid="remote-readout">
        <span className="text-[12px] uppercase tracking-[.18em] text-white/45 truncate max-w-full">{cur ? `${cur.name} · ${MODE_NAME[cur.mode] || cur.mode}` : "Waiting for the clock"}</span>
        <span className="font-mono text-[44px] leading-tight tabular-nums truncate max-w-full" style={{ color: cur?.color || "#fff" }}>{cur?.text || "--:--:--"}</span>
        {timing && <span className="text-[12px] text-white/45">{cur.paused ? "Paused" : "Running"}</span>}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button disabled={!online || !timing || cur?.mode === "countto"} onClick={() => go({ cmd: "toggle" })} className="gs-primary rounded-2xl h-16 flex items-center justify-center gap-2 text-[16px] font-semibold disabled:opacity-40" data-testid="remote-toggle">
          {cur && !cur.paused ? <><Pause size={20} />Pause</> : <><Play size={20} />Start</>}
        </button>
        <button disabled={!online || !timing} onClick={() => go({ cmd: "reset" })} className="gs-chip rounded-2xl h-16 flex items-center justify-center gap-2 text-[16px] font-semibold disabled:opacity-40" data-testid="remote-reset"><RotateCcw size={18} />Reset</button>
      </div>

      <div className="grid grid-cols-4 gap-2" data-testid="remote-adjust">
        {[-60, -10, 10, 60].map((d) => (
          <button key={d} disabled={!online || !timing} onClick={() => go({ cmd: "adjust", seconds: d })} className="gs-step rounded-xl h-12 flex items-center justify-center gap-1 text-[14px] font-semibold disabled:opacity-40">
            {d < 0 ? <Minus size={14} /> : <Plus size={14} />}{Math.abs(d) >= 60 ? `${Math.abs(d) / 60}m` : `${Math.abs(d)}s`}
          </button>
        ))}
      </div>

      <section className="gs-card rounded-2xl p-4 flex flex-col gap-3">
        <span className="text-[12px] uppercase tracking-[.14em] text-white/45">Mode</span>
        <div className="gs-seg rounded-xl p-1 grid grid-cols-4 gap-1" data-testid="remote-modes">
          {MODES.map((m) => (
            <button key={m.value} disabled={!online} onClick={() => go({ cmd: "setMode", mode: m.value })} data-on={cur?.mode === m.value ? "" : undefined} className="gs-seg-btn rounded-lg py-2 text-[12px] font-semibold whitespace-nowrap disabled:opacity-40">{m.label}</button>
          ))}
        </div>
      </section>

      <section className="gs-card rounded-2xl p-4 flex flex-col gap-3">
        <span className="text-[12px] uppercase tracking-[.14em] text-white/45">Count to a time of day</span>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = parseTimeOfDay(toEntry); if (t) { go({ cmd: "setCountTo", time: t }); setToEntry(""); } }}>
          <input value={toEntry} onChange={(e) => setToEntry(e.target.value)} inputMode="text" placeholder="10:30 AM or 22:30" className="gs-input gs-time rounded-xl flex-1 min-w-0 h-12 px-3 text-[18px] outline-none" data-testid="remote-countto-input" />
          <button disabled={!online || !parseTimeOfDay(toEntry)} className="gs-primary rounded-xl px-4 h-12 text-[14px] font-semibold disabled:opacity-40" data-testid="remote-countto-set">Set</button>
        </form>
      </section>

      <section className="gs-card rounded-2xl p-4 flex flex-col gap-3">
        <span className="text-[12px] uppercase tracking-[.14em] text-white/45">Set countdown</span>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const s = parseDuration(entry); if (s) { go({ cmd: "setCountdown", seconds: s }); setEntry(""); } }}>
          <input value={entry} onChange={(e) => setEntry(e.target.value)} inputMode="text" placeholder="10:00 or 5m" className="gs-input gs-time rounded-xl flex-1 min-w-0 h-12 px-3 text-[18px] outline-none" data-testid="remote-countdown-input" />
          <button disabled={!online || !parseDuration(entry)} className="gs-primary rounded-xl px-4 h-12 text-[14px] font-semibold disabled:opacity-40" data-testid="remote-countdown-set">Set</button>
        </form>
        <div className="grid grid-cols-5 gap-2">
          {QUICK.map((q) => <button key={q} disabled={!online} onClick={() => go({ cmd: "setCountdown", seconds: q })} className="gs-chip rounded-lg py-2 text-[13px] font-semibold disabled:opacity-40">{q >= 3600 ? "1h" : `${q / 60}m`}</button>)}
        </div>
      </section>
      <p className="text-[11px] text-white/35 text-center">Paired with one screen only. Ask whoever runs the clock for a new code if this stops working.</p>
    </div>
  );
}
