import { Mic } from "lucide-react";
import type { LtcInput, LtcStatus } from "@/lib/ltc/useLtcInput";
import { diagnose, diagLines, inputLine } from "@/lib/ltc/diagnose";
import type { TimecodeCell } from "@/hooks/useTimecodeCell";
import { JAM_MIN_FRAMES } from "@/lib/timecode/jam";

// Display helpers + UI for the clock's Timecode mode (kept out of ClockCell to keep that file's diff small).
// Today the only source is the Deity TC-1 (LTC audio); see lib/timecode/sources.ts for adding more.

export const ltcIsLive = (s: LtcStatus) => s === "locked";

export function timecodeSubtitle(tc: TimecodeCell): string {
  const ltc = tc.ltc;
  const f = ltc.frame;
  const src = tc.info.shortLabel;
  if (tc.jamProgress) {
    const p = tc.jamProgress;
    return p.state === "collecting" && p.need ? `JAMMING… ${Math.min(p.frames, p.need)}/${p.need} FRAMES` : "JAMMING…";
  }
  if (tc.state === "live") {
    if (!f?.rateLocked) return `${src} · measuring frame rate…`;
    if (tc.hfr && tc.rateParts) return `${src} · ${tc.rateParts.num} fps${tc.rateParts.df ? " DF" : ""} · LIVE${tc.jam ? ` · ${tc.jamAgeText.toLowerCase()}` : ""}`;
    const sub = f.nominalFps === 30 && f.fpsLabel === "29.97" ? (f.drop ? " DF" : " NDF") : "";
    return `${src} · ${f.fpsLabel} fps${sub} · LIVE${tc.jam ? ` · ${tc.jamAgeText.toLowerCase()}` : ""}`;
  }
  if (tc.state === "freerun") return `FREE-RUN · ${tc.rateText} fps · ${tc.jamAgeText.toLowerCase()}`;
  switch (ltc.status) {
    case "nosignal": return "NO SIGNAL";
    case "notltc": return "AUDIO PRESENT · NO TIMECODE";
    case "requesting": return "WAITING FOR MIC PERMISSION…";
    case "denied": return "MIC PERMISSION DENIED";
    case "unsupported": return "NOT SUPPORTED HERE";
    case "error": return "AUDIO INPUT ERROR";
    default: return `${src} TIMECODE · INPUT OFF`;
  }
}

/** dBFS -> 0..1 meter position over a -60..0 dB scale. */
const meterPos = (db: number) => Math.max(0, Math.min(1, (db + 60) / 60));

export function LtcLevelMeter({ ltc }: { ltc: LtcInput; color?: string }) {
  const hot = ltc.clipping;
  const quiet = ltc.db < -40;
  return (
    <div className="w-full" data-testid="ltc-meter">
      <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          data-testid="ltc-meter-fill"
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
          style={{ width: `${meterPos(ltc.db) * 100}%`, backgroundColor: hot ? "#ef4444" : quiet ? "#f59e0b" : "#22c55e" }}
        />
      </div>
      <div className="mt-0.5 flex justify-between font-mono text-[9px] text-white/30">
        <span data-testid="ltc-db">{ltc.db <= -99 ? "-∞ dB" : `${ltc.db.toFixed(0)} dB`}</span>
        <span>{hot ? "TOO HOT – turn the output down" : quiet && ltc.status !== "nosignal" ? "LOW – turn the output up" : "level"}</span>
      </div>
    </div>
  );
}

/** Why isn't it locking? A one-line verdict (cell) or the full counters (settings). */
export function LtcDiagnostics({ tc, full }: { tc: TimecodeCell; full?: boolean }) {
  const ltc = tc.ltc;
  const running = ltc.status === "locked" || ltc.status === "nosignal" || ltc.status === "notltc";
  if (!running) return null;
  const v = diagnose(ltc.diag, true);
  const t = ltc.diag.totals;
  const rateNote = v.code === "ok" && !tc.canJam && !tc.jamProgress ? " · measuring the frame rate (Jam needs ~1 s of steady frames)" : "";
  const bad = v.code !== "ok" && v.code !== "idle";
  return (
    <div className="max-w-full text-center font-mono text-[10px] leading-snug" data-testid={full ? "ltc-diag" : "ltc-diag-verdict"} data-diag-code={v.code}>
      <p style={{ color: bad ? "rgba(252,211,77,0.85)" : "rgba(255,255,255,0.45)" }}>{v.text}{rateNote}</p>
      {bad && v.hint && <p className="text-white/35">{v.hint}</p>}
      {full && (
        <div className="mt-1 text-left text-white/35 break-words" data-testid="ltc-diag-detail">
          {inputLine(ltc.diag.input) && <p data-testid="ltc-diag-input">{inputLine(ltc.diag.input)}</p>}
          {diagLines(ltc.diag).map((l, i) => <p key={i} data-testid="ltc-diag-channel">{l}</p>)}
          <p data-testid="ltc-diag-totals">Totals since start: {t.frames} frames decoded · {t.syncs} sync words · {t.bad} rejected · {t.resets} glitches · {t.edges} edges</p>
        </div>
      )}
    </div>
  );
}

/** Shown over the bottom of the cell in Timecode mode: start button, jam controls, errors, level meter. */
export function LtcCellOverlay({ tc, color }: { tc: TimecodeCell; color: string }) {
  const ltc = tc.ltc;
  const needsStart = ltc.status === "idle" || ltc.status === "denied" || ltc.status === "error";
  const listening = ltc.status === "locked" || ltc.status === "nosignal" || ltc.status === "notltc";
  const btn = "flex items-center gap-1.5 rounded border px-3 py-1 font-mono text-[11px] transition-colors hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent";
  const style = { color, borderColor: `${color}60` };
  return (
    <div className="absolute bottom-2 left-3 right-3 z-10 flex flex-col items-center gap-1" data-testid="ltc-overlay" data-ltc-status={ltc.status} data-tc-state={tc.state}>
      <div className="flex items-center gap-2">
        {needsStart && (
          <button onClick={ltc.start} className={btn} style={style}>
            <Mic size={12} /> {ltc.status === "idle" ? (tc.jam ? "Listen for TC-1 (to re-jam)" : "Start timecode input") : "Try again"}
          </button>
        )}
        {tc.jamProgress ? (
          <button onClick={tc.cancelJam} className={btn} style={style} data-testid="jam-cancel">Cancel jam</button>
        ) : (
          <>
            {listening && (
              <button onClick={tc.startJam} disabled={!tc.canJam} className={btn} style={style} data-testid="jam-button"
                title={tc.canJam ? "Lock to the timecode for a few seconds, then keep running without it" : "Needs a live, steady timecode first"}>
                {tc.jam ? "Re-jam" : "Jam"}
              </button>
            )}
            {tc.jam && (
              <button onClick={tc.clearJam} className={btn} style={style} data-testid="jam-clear">Clear jam</button>
            )}
          </>
        )}
      </div>
      {tc.jamError && <p className="max-w-full text-center font-mono text-[10px] leading-snug text-red-300/80" data-testid="jam-error">{tc.jamError}</p>}
      {ltc.message && (ltc.status === "denied" || ltc.status === "error" || ltc.status === "unsupported") && (
        <p className="max-w-full text-center font-mono text-[10px] leading-snug text-red-300/80" data-testid="ltc-message">{ltc.message}</p>
      )}
      {listening && <LtcLevelMeter ltc={ltc} color={color} />}
      {listening && ltc.status !== "locked" && <LtcDiagnostics tc={tc} />}
    </div>
  );
}

/** Settings-panel section: source, input device picker, start/stop, jam status + controls. */
export function LtcSettings({ tc, color, deviceId, onDeviceChange, highFrameRate, onHighFrameRateChange }: { tc: TimecodeCell; color: string; deviceId?: string; onDeviceChange: (id: string | undefined) => void; highFrameRate: boolean; onHighFrameRateChange: (v: boolean) => void }) {
  const ltc = tc.ltc;
  const running = ltc.status === "locked" || ltc.status === "nosignal" || ltc.status === "notltc";
  const current = deviceId ?? "";
  const small = "px-2 py-0.5 text-[10px] font-mono border transition-colors disabled:opacity-40";
  const style = { color, borderColor: `${color}60` };
  return (
    <div className="flex flex-col gap-2" data-testid="ltc-settings">
      <p className="text-white/30 text-[10px] font-mono">Timecode source</p>
      <p className="text-white/70 text-xs font-mono" data-testid="tc-source-label">{tc.info.label}</p>
      <select
        aria-label="Audio input device"
        value={current}
        onChange={(e) => onDeviceChange(e.target.value || undefined)}
        className="bg-black border border-white/20 text-xs font-mono text-white/70 px-2 py-1 rounded max-w-full"
      >
        <option value="">System default input</option>
        {ltc.devices.filter((d) => d.deviceId && d.deviceId !== "default").map((d) => (
          <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
        ))}
      </select>
      {ltc.devices.length === 0 && <p className="text-white/30 text-[10px] font-mono">Device names appear after you allow microphone access.</p>}
      <div className="flex gap-1">
        <button onClick={running ? ltc.stop : ltc.start} className={small} style={style}>{running ? "Stop listening" : "Start listening"}</button>
      </div>
      {running && <LtcLevelMeter ltc={ltc} color={color} />}
      {running && <LtcDiagnostics tc={tc} full />}

      <p className="text-white/30 text-[10px] font-mono mt-1">Show as</p>
      <div className="flex gap-1 flex-wrap" role="group" aria-label="Frame rate shown">
        <button onClick={() => onHighFrameRateChange(false)} aria-pressed={!highFrameRate} data-testid="tc-rate-normal" className={small}
          style={{ color: !highFrameRate ? color : "rgba(255,255,255,0.3)", borderColor: !highFrameRate ? `${color}60` : "rgba(255,255,255,0.1)" }}>As received</button>
        <button onClick={() => onHighFrameRateChange(true)} aria-pressed={highFrameRate} data-testid="tc-rate-x2" className={small}
          style={{ color: highFrameRate ? color : "rgba(255,255,255,0.3)", borderColor: highFrameRate ? `${color}60` : "rgba(255,255,255,0.1)" }}>×2 · 59.94 / 60 fps</button>
      </div>
      <p className="text-white/30 text-[10px] font-mono leading-snug" data-testid="tc-rate-help">
        {highFrameRate
          ? `Frame counts 00-59. Set the TC-1 to 29.97, 29.97 DF or 30 for a 59.94 / 60 fps show (${tc.info.highFrameRates.join(", ")}). 29.97 and 59.94 look identical on the cable, so you pick which one you're running.${tc.hfrAvailable ? "" : " (Only applies to 29.97 / 30 timecode.)"}`
          : "Pick ×2 when your show runs at 59.94 or 60 fps; the TC-1 sends those as 29.97 / 30 timecode."}
      </p>

      <p className="text-white/30 text-[10px] font-mono mt-1">Jam sync</p>
      <p className="text-white/60 text-[10px] font-mono leading-snug" data-testid="jam-status">
        {tc.jam
          ? `${tc.jamAgeText} · ${tc.rateText} fps · ${tc.state === "live" ? "live signal present" : "free-running on this computer's clock"}`
          : "Not jammed. Press Jam while the TC-1 is connected and running; the clock then keeps going after you unplug it."}
      </p>
      {tc.jam && tc.driftFrames !== null && (
        <p className="text-white/30 text-[10px] font-mono" data-testid="jam-drift">
          Free-run vs live signal right now: {tc.driftFrames > 0 ? "+" : ""}{Math.round(tc.driftFrames)} frame{Math.abs(Math.round(tc.driftFrames)) === 1 ? "" : "s"}
        </p>
      )}
      <div className="flex gap-1 flex-wrap">
        {tc.jamProgress
          ? <button onClick={tc.cancelJam} className={small} style={style}>Cancel jam</button>
          : <button onClick={tc.startJam} disabled={!tc.canJam} className={small} style={style} data-testid="jam-button-settings">{tc.jam ? "Re-jam" : "Jam"}</button>}
        {tc.jam && <button onClick={tc.clearJam} className={small} style={style}>Clear jam</button>}
      </div>
      {tc.jamProgress && <p className="text-white/40 text-[10px] font-mono">Locking… needs {JAM_MIN_FRAMES}+ clean consecutive frames over a few seconds.</p>}
      {tc.jamError && <p className="text-red-300/80 text-[10px] font-mono leading-snug">{tc.jamError}</p>}

      <p className="text-white/30 text-[10px] font-mono mt-1">Frame offset (fine trim)</p>
      <div className="flex items-center gap-1">
        <button onClick={() => tc.setTrim(tc.trim - 1)} className={small} style={style} aria-label="Trim one frame earlier">−1f</button>
        <span className="text-white/60 text-[10px] font-mono w-14 text-center" data-testid="tc-trim">{tc.trim > 0 ? "+" : ""}{tc.trim} frames</span>
        <button onClick={() => tc.setTrim(tc.trim + 1)} className={small} style={style} aria-label="Trim one frame later">+1f</button>
      </div>

      <p className="text-white/30 text-[10px] font-mono leading-snug">
        {tc.info.hookup} Reads {tc.info.supportedRates.join(", ")} fps (and 59.94 / 60 via ×2). 50 fps isn't supported. Echo cancellation, noise suppression and auto-gain are turned off for you.
      </p>
    </div>
  );
}

export const LtcIcon = Mic;
