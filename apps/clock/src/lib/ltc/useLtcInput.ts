import { useCallback, useEffect, useRef, useState } from "react";
import { DIAG_SILENCE_PEAK, type ChannelDiag, type InputInfo, type LtcDiag } from "./diagnose";

/**
 * Live LTC (SMPTE linear timecode) input from a Web Audio input device.
 *
 * Audio path: getUserMedia (echo cancellation / noise suppression / auto gain
 * all OFF - they wreck a square-wave timecode signal) -> AudioWorklet
 * (public/ltc-worklet.js) which decodes the biphase-mark signal and posts
 * frames + levels back here.
 */

export type LtcFrame = {
  h: number; m: number; s: number; f: number;
  drop: boolean;
  fps: number | null;          // measured frames per second
  fpsLabel: string | null;     // "23.98", "24", "25", "29.97", "30" once locked
  nominalFps: number | null;
  rateLocked: boolean;
  snapped: boolean;
};

export type LtcStatus =
  | "idle"        // not started yet (needs a click, so the browser prompt is user-initiated)
  | "requesting"  // waiting for the browser permission prompt / device
  | "denied"      // microphone permission refused
  | "unsupported" // no getUserMedia / AudioWorklet / insecure context
  | "error"       // device missing, in use, etc.
  | "nosignal"    // listening, silence
  | "notltc"      // listening, audio present but no timecode decoded
  | "locked";     // timecode is being decoded

export type LtcDevice = { deviceId: string; label: string };

export const NO_SIGNAL_MS = 1000;
const SILENCE_PEAK = DIAG_SILENCE_PEAK; // -60 dBFS: matches the decoder's edge floor, so a quiet TC-1 isn't reported as "no signal"
export const LTC_WORKLET_URL = `${import.meta.env.BASE_URL}ltc-worklet.js`;

export function levelToDb(peak: number): number {
  return peak <= 0.00001 ? -100 : 20 * Math.log10(peak);
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function ltcUnsupportedReason(): string | null {
  if (typeof window === "undefined") return "Not in a browser";
  if (!window.isSecureContext) return "Audio input needs a secure (https) page";
  if (!navigator.mediaDevices?.getUserMedia) return "This browser can't capture audio input";
  const Ctx = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
  if (!Ctx || typeof AudioWorkletNode === "undefined") return "This browser doesn't support AudioWorklet";
  return null;
}

export function describeLtcError(err: unknown): { status: LtcStatus; message: string } {
  const e = err as { name?: string; message?: string } | null;
  const name = e?.name;
  if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") {
    return { status: "denied", message: "Microphone access was blocked. Allow it for this site in your browser's address bar (lock icon), then press Start again." };
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return { status: "error", message: "No audio input found. Plug in your interface or adapter and pick it in settings." };
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return { status: "error", message: "The audio input is busy or unavailable. Close other apps using it and try again." };
  }
  return { status: "error", message: e?.message || "Couldn't start the audio input" };
}

type Opts = { enabled: boolean; deviceId?: string };

export function useLtcInput({ enabled, deviceId }: Opts) {
  const [status, setStatus] = useState<LtcStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [frame, setFrame] = useState<LtcFrame | null>(null);
  const [peak, setPeak] = useState(0);
  const [devices, setDevices] = useState<LtcDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  const generation = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastFrameAt = useRef(0);
  const latest = useRef<{ frame: LtcFrame | null; peak: number; channel: number | null; dirty: boolean }>({ frame: null, peak: 0, channel: null, dirty: false });
  const running = useRef(false);
  const [inputInfo, setInputInfo] = useState<InputInfo | null>(null);
  // Decoder counters, windowed (~2 s) for per-second rates, plus running totals.
  type LevelMsg = { peak: number; squareness?: number; diag?: { edges: number; syncs: number; bad: number; resets: number; frames: number; cadence: number; bitRate: number | null } };
  const diagWin = useRef<{ t: number; levels: LevelMsg[] }[]>([]);
  const diagTotals = useRef({ edges: 0, syncs: 0, bad: 0, resets: 0, frames: 0 });
  const [tick, setTick] = useState(0);
  // Un-throttled per-frame listeners (jam-sync needs every frame, and the React state below is rAF-throttled).
  const listeners = useRef(new Set<(frame: LtcFrame, wallMs: number) => void>());
  const subscribe = useCallback((cb: (frame: LtcFrame, wallMs: number) => void) => {
    listeners.current.add(cb);
    return () => { listeners.current.delete(cb); };
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter((d) => d.kind === "audioinput").map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Audio input ${i + 1}` })));
    } catch { /* ignore */ }
  }, []);

  const teardown = useCallback(() => {
    running.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const ctx = ctxRef.current;
    ctxRef.current = null;
    if (ctx && ctx.state !== "closed") ctx.close().catch(() => {});
    latest.current = { frame: null, peak: 0, channel: null, dirty: false };
    diagWin.current = []; diagTotals.current = { edges: 0, syncs: 0, bad: 0, resets: 0, frames: 0 };
    setFrame(null); setPeak(0); setActiveDeviceId(null); setInputInfo(null);
  }, []);

  const start = useCallback(async () => {
    const unsupported = ltcUnsupportedReason();
    if (unsupported) { setStatus("unsupported"); setMessage(unsupported); return; }
    teardown();
    const gen = ++generation.current;
    setStatus("requesting"); setMessage("");
    try {
      const audioBase: MediaTrackConstraints = {
        echoCancellation: false, noiseSuppression: false, autoGainControl: false,
        channelCount: { ideal: 2 }, sampleRate: { ideal: 48000 },
        // Chrome/macOS "voice isolation" is another processing stage that would eat a square wave
        ...({ voiceIsolation: false } as MediaTrackConstraints),
      };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { ...audioBase, deviceId: { exact: deviceId } } : audioBase,
        });
      } catch (e) {
        const en = (e as { name?: string })?.name;
        // A saved device that's no longer plugged in: fall back to the default input.
        if (deviceId && (en === "OverconstrainedError" || en === "NotFoundError")) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: audioBase });
        } else throw e;
      }
      if (gen !== generation.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;
      const track = stream.getAudioTracks()[0];
      setActiveDeviceId(track?.getSettings().deviceId ?? null);
      // Some browsers/OS combinations keep processing on despite the request: ask again, then report what we really got.
      type Fx = MediaTrackSettings & { echoCancellation?: boolean; noiseSuppression?: boolean; autoGainControl?: boolean };
      let fx = (track?.getSettings() ?? {}) as Fx;
      if (track && (fx.echoCancellation || fx.noiseSuppression || fx.autoGainControl)) {
        await track.applyConstraints({ echoCancellation: false, noiseSuppression: false, autoGainControl: false }).catch(() => {});
        fx = track.getSettings() as Fx;
      }
      track?.addEventListener("ended", () => {
        if (gen !== generation.current) return;
        teardown(); setStatus("error"); setMessage("The audio input was disconnected."); 
      });

      const Ctx = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      const ctx: AudioContext = new Ctx({ latencyHint: "interactive" });
      ctxRef.current = ctx;
      await ctx.audioWorklet.addModule(LTC_WORKLET_URL);
      if (gen !== generation.current) return;
      setInputInfo({
        label: track?.label || "", sampleRate: ctx.sampleRate, channelCount: fx.channelCount ?? null,
        echoCancellation: fx.echoCancellation ?? null, noiseSuppression: fx.noiseSuppression ?? null, autoGainControl: fx.autoGainControl ?? null,
      });
      const src = ctx.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(ctx, "ltc-decoder", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCountMode: "explicit", channelCount: 2 });
      node.port.onmessage = (e) => {
        const d = e.data;
        if (d?.type === "frame") {
          const l = latest.current;
          // Follow whichever channel is decoding; a second channel only takes over if the first goes quiet.
          if (l.channel === null || l.channel === d.channel || performance.now() - lastFrameAt.current > NO_SIGNAL_MS) {
            l.channel = d.channel; l.frame = d.frame; l.dirty = true;
            lastFrameAt.current = performance.now();
            const wallMs = Date.now();
            listeners.current.forEach((cb) => cb(d.frame as LtcFrame, wallMs));
          }
        } else if (d?.type === "level") {
          let p = 0; for (const lv of d.levels as { peak: number }[]) if (lv.peak > p) p = lv.peak;
          latest.current.peak = p; latest.current.dirty = true;
          const now = performance.now();
          const win = diagWin.current;
          win.push({ t: now, levels: d.levels as LevelMsg[] });
          while (win.length && now - win[0].t > 2000) win.shift();
          (d.levels as LevelMsg[]).forEach((lv) => {
            const g = lv.diag; if (!g) return;
            const t = diagTotals.current;
            t.edges += g.edges; t.syncs += g.syncs; t.bad += g.bad; t.resets += g.resets; t.frames += g.frames;
          });
        }
      };
      const mute = ctx.createGain(); mute.gain.value = 0;
      src.connect(node); node.connect(mute); mute.connect(ctx.destination);
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});
      if (gen !== generation.current) return;
      lastFrameAt.current = 0;
      running.current = true;
      setStatus("nosignal");
      refreshDevices(); // labels become available once permission is granted
    } catch (err) {
      if (gen !== generation.current) return;
      teardown();
      const d = describeLtcError(err);
      setStatus(d.status); setMessage(d.message);
    }
  }, [deviceId, refreshDevices, teardown]);

  const stop = useCallback(() => {
    generation.current++;
    teardown();
    setStatus("idle"); setMessage("");
  }, [teardown]);

  // Start / stop with the clock mode. Starts on its own only if the browser
  // already remembers a "granted" choice; otherwise waits for a click so the
  // permission prompt is clearly user-initiated.
  const restartOnNextRun = useRef(false);
  useEffect(() => {
    if (!enabled) { restartOnNextRun.current = false; generation.current++; teardown(); setStatus("idle"); setMessage(""); return; }
    const unsupported = ltcUnsupportedReason();
    if (unsupported) { setStatus("unsupported"); setMessage(unsupported); return; }
    let cancelled = false;
    if (restartOnNextRun.current) {
      // The device was changed while listening: carry on with the new one.
      restartOnNextRun.current = false;
      start();
    } else {
      (async () => {
        try {
          const p = await navigator.permissions?.query({ name: "microphone" as PermissionName });
          if (cancelled || !p) return;
          if (p.state === "granted") { start(); }
          else if (p.state === "denied") { const d = describeLtcError({ name: "NotAllowedError" }); setStatus(d.status); setMessage(d.message); }
        } catch { /* Safari: no microphone permission query; wait for a click */ }
      })();
    }
    return () => { cancelled = true; restartOnNextRun.current = running.current; generation.current++; teardown(); };
    // restart whenever the chosen device changes while enabled
  }, [enabled, deviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Throttle worklet messages (~30/s) into at most one React update per animation frame, and
  // derive no-signal / locked.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const loop = () => {
      const l = latest.current;
      if (l.dirty) { l.dirty = false; setFrame(l.frame); setPeak(l.peak); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => { cancelAnimationFrame(raf); clearInterval(id); };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onChange = () => refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", onChange);
  }, [enabled, refreshDevices]);

  // Derived live status (re-evaluated on every tick / frame)
  let live: LtcStatus = status;
  if (running.current && (status === "nosignal" || status === "notltc" || status === "locked")) {
    const fresh = lastFrameAt.current > 0 && performance.now() - lastFrameAt.current < NO_SIGNAL_MS;
    live = fresh ? "locked" : peak > SILENCE_PEAK ? "notltc" : "nosignal";
  }
  void tick;

  // Decoder diagnostics over the last ~2 s: what the signal looks like even when nothing decodes.
  const diag: LtcDiag = (() => {
    const win = diagWin.current;
    const nCh = win.reduce((m, w) => Math.max(m, w.levels.length), 0);
    const span = win.length > 1 ? (win[win.length - 1].t - win[0].t) / 1000 + 0.05 : 0.05;
    const channels: ChannelDiag[] = [];
    for (let c = 0; c < nCh; c++) {
      let peak = 0, sq = 0, sqN = 0, edges = 0, syncs = 0, bad = 0, resets = 0, frames = 0, cadence = 0, cadN = 0, bitRate: number | null = null;
      for (const w of win) {
        const lv = w.levels[c]; if (!lv) continue;
        peak = Math.max(peak, lv.peak);
        if (lv.peak > DIAG_SILENCE_PEAK && lv.squareness !== undefined) { sq += lv.squareness; sqN++; }
        const g = lv.diag; if (!g) continue;
        edges += g.edges; syncs += g.syncs; bad += g.bad; resets += g.resets; frames += g.frames;
        cadence = g.cadence; cadN++; bitRate = g.bitRate ?? bitRate;
      }
      void cadN;
      channels.push({ peak, squareness: sqN ? sq / sqN : 0, edgesPerSec: edges / span, syncsPerSec: syncs / span, badPerSec: bad / span, resetsPerSec: resets / span, framesPerSec: frames / span, cadence, bitRate });
    }
    return { channels, totals: { ...diagTotals.current }, input: inputInfo };
  })();

  return {
    diag,
    status: live, message, frame: live === "locked" ? frame : null, lastFrame: frame,
    peak, db: levelToDb(peak), clipping: peak >= 0.98,
    devices, activeDeviceId, start, stop, subscribe,
  };
}

export type LtcInput = ReturnType<typeof useLtcInput>;
