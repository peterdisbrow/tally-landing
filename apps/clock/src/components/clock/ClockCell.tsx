import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Trash2, GripVertical, Play, Pause, RotateCcw } from "lucide-react";
import AnalogClock from "./AnalogClock";
import { supabase } from "@/integrations/supabase/client";
import type { ProPresenterStatus, HyperDeckStatus, AtemStatus } from "@/hooks/useTallyConnect";

type ClockFont = {
  name: string;
  label: string;
  css: string;
  weight: number;
};

type ClockMode = "clock" | "countup" | "countdown" | "countto" | "propresenter" | "hyperdeck" | "service" | "streamtime" | "recordtime" | "lastcue" | "atemrecord" | "atemtimecode";
type DisplayStyle = "digital" | "analog";

export type ClockCellConfig = {
  id: string;
  clockName: string;
  clockColor: string;
  fontName: string;
  timezone: string;
  is24h: boolean;
  mode?: ClockMode;
  countdownFrom?: number;
  countToTarget?: number;
  displayStyle?: DisplayStyle;
  thickness?: number;
  overtimeWarningColor?: string;
  allowOverrun?: boolean;
  hyperdeckIndex?: number; // which hyperdeck (0-based)
  serviceStartTime?: number; // timestamp for service countdown mode
  sizeScale?: number; // 0.5 to 2.0, default 1.0
  showSeconds?: boolean; // default true; when false, clock/countup/countdown/countto show HH:MM
};

const CLOCK_FONTS: ClockFont[] = [
  { name: "dseg7", label: "7-Segment", css: "'DSEG7-Classic', monospace", weight: 700 },
  { name: "dseg14", label: "14-Segment", css: "'DSEG14-Classic', monospace", weight: 700 },
  { name: "dseg7modern", label: "7-Seg Modern", css: "'DSEG7-Modern', monospace", weight: 700 },
  { name: "digital", label: "Digital", css: "'Share Tech Mono', monospace", weight: 400 },
  { name: "mono", label: "Classic Mono", css: "'JetBrains Mono', monospace", weight: 700 },
  { name: "system", label: "System", css: "ui-monospace, monospace", weight: 700 },
];

const COLOR_PRESETS = [
  { label: "Red", value: "#ef4444" },
  { label: "Green", value: "#22c55e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "White", value: "#ffffff" },
  { label: "Magenta", value: "#d946ef" },
];

const COMMON_TIMEZONES = [
  { label: "Local", value: "local" },
  { label: "UTC", value: "UTC" },
  { label: "US Eastern", value: "America/New_York" },
  { label: "US Central", value: "America/Chicago" },
  { label: "US Mountain", value: "America/Denver" },
  { label: "US Pacific", value: "America/Los_Angeles" },
  { label: "London", value: "Europe/London" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Hong Kong", value: "Asia/Hong_Kong" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Mumbai", value: "Asia/Kolkata" },
];

const COUNTDOWN_PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 300 },
  { label: "10m", seconds: 600 },
  { label: "15m", seconds: 900 },
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
  { label: "2h", seconds: 7200 },
];

const getTimeInZone = (date: Date, timezone: string) => {
  if (timezone === "local") {
    return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
  }
  const str = date.toLocaleString("en-US", {
    timeZone: timezone, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = str.split(":");
  return { hours: parseInt(parts[0]) % 24, minutes: parseInt(parts[1]), seconds: parseInt(parts[2]) };
};

const formatTimer = (totalMs: number, showSeconds: boolean = true) => {
  const negative = totalMs < 0;
  const abs = Math.abs(totalMs);
  const totalSec = Math.floor(abs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  let text: string;
  if (showSeconds) {
    const ms = Math.floor((abs % 1000) / 10);
    text = h > 0
      ? `${String(h)}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  } else {
    text = h > 0
      ? `${String(h)}:${String(m).padStart(2, "0")}`
      : `00:${String(m).padStart(2, "0")}`;
  }
  return { text, negative };
};

interface ClockCellProps {
  config: ClockCellConfig;
  onUpdate: (config: ClockCellConfig) => void;
  onRemove: (id: string) => void;
  globalScale?: number;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  proPresenter?: ProPresenterStatus;
  hyperdecks?: HyperDeckStatus[];
  atem?: AtemStatus;
  isTallyConnected?: boolean;
  streamStartedAt?: number | null;
  recordingStartedAt?: number | null;
  atemRecordingStartedAt?: number | null;
  lastCueAt?: number | null;
  atemTimecode?: string | null;
}

const ClockCell = ({ config, onUpdate, onRemove, globalScale = 1, isDragging, isDropTarget, onDragStart, onDragEnd, onDragOver, onDrop, onTouchStart, onTouchMove, onTouchEnd, proPresenter, hyperdecks, atem, isTallyConnected, streamStartedAt, recordingStartedAt, atemRecordingStartedAt, lastCueAt, atemTimecode }: ClockCellProps) => {
  const [now, setNow] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [countToInput, setCountToInput] = useState("");
  const cellRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(80);
  const [ntpOffset, setNtpOffset] = useState(0);

  const mode = config.mode || "clock";
  const countdownFrom = config.countdownFrom || 300;
  const displayStyle = config.displayStyle || "digital";
  const thickness = config.thickness || 3;
  const overtimeWarningColor = config.overtimeWarningColor || "#f59e0b";
  const allowOverrun = config.allowOverrun ?? true;
  const hyperdeckIndex = config.hyperdeckIndex ?? 0;
  const showSeconds = config.showSeconds !== false;

  // Ms-precision timer tracking
  const timerStartRef = useRef<number | null>(null);
  const timerAccRef = useRef(0);
  const [timerElapsedMs, setTimerElapsedMs] = useState(0);
  const [paused, setPaused] = useState(true);

  const font = CLOCK_FONTS.find(f => f.name === config.fontName) || CLOCK_FONTS[0];
  const tzLabel = COMMON_TIMEZONES.find(t => t.value === config.timezone)?.label || config.timezone;

  const startTimer = useCallback(() => { timerStartRef.current = Date.now(); setPaused(false); }, []);
  const pauseTimer = useCallback(() => {
    if (timerStartRef.current !== null) { timerAccRef.current += Date.now() - timerStartRef.current; timerStartRef.current = null; }
    setPaused(true);
  }, []);
  const togglePause = useCallback(() => { if (paused) startTimer(); else pauseTimer(); }, [paused, startTimer, pauseTimer]);
  const resetTimer = useCallback((andStart = false) => {
    timerAccRef.current = 0; timerStartRef.current = andStart ? Date.now() : null; setTimerElapsedMs(0); setPaused(!andStart);
  }, []);

  // NTP sync
  const syncTime = useCallback(async () => {
    try {
      const before = Date.now();
      const { data, error } = await supabase.functions.invoke("time-sync");
      const after = Date.now();
      if (!error && data?.timestamp) { setNtpOffset(data.timestamp - (before + (after - before) / 2)); return; }
    } catch {}
    setNtpOffset(0);
  }, []);

  useEffect(() => { syncTime(); const id = setInterval(syncTime, 60000); return () => clearInterval(id); }, [syncTime]);
  useEffect(() => { const id = setInterval(() => setNow(new Date(Date.now() + ntpOffset)), 200); return () => clearInterval(id); }, [ntpOffset]);

  useEffect(() => {
    if (mode === "clock" || mode === "propresenter" || mode === "hyperdeck") return;
    const id = setInterval(() => {
      setTimerElapsedMs(timerAccRef.current + (timerStartRef.current !== null ? Date.now() - timerStartRef.current : 0));
    }, 33);
    return () => clearInterval(id);
  }, [mode, paused]);

  // Fast clock update for live elapsed modes (streamtime, recordtime, lastcue, atemrecord, service)
  useEffect(() => {
    if (mode !== "streamtime" && mode !== "recordtime" && mode !== "lastcue" && mode !== "atemrecord" && mode !== "atemtimecode" && mode !== "service") return;
    const id = setInterval(() => setNow(new Date(Date.now() + ntpOffset)), 1000);
    return () => clearInterval(id);
  }, [mode, ntpOffset]);

  useEffect(() => { resetTimer(false); }, [countdownFrom, resetTimer]);

  // Auto-size
  const sizeScaleRef = useRef((config.sizeScale || 1) * globalScale);
  sizeScaleRef.current = (config.sizeScale || 1) * globalScale;

  useEffect(() => {
    if (!cellRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!cellRef.current) return;
      const w = cellRef.current.clientWidth * 0.85;
      const base = Math.max(20, Math.min(Math.floor(w / 6), 300));
      setFontSize(Math.round(base * sizeScaleRef.current));
    });
    observer.observe(cellRef.current);
    return () => observer.disconnect();
  }, []);

  // Re-apply scale when sizeScale or globalScale changes (without needing a resize event)
  useEffect(() => {
    if (!cellRef.current) return;
    const w = cellRef.current.clientWidth * 0.85;
    const base = Math.max(20, Math.min(Math.floor(w / 6), 300));
    setFontSize(Math.round(base * (config.sizeScale || 1) * globalScale));
  }, [config.sizeScale, globalScale]);

  // Helper: format elapsed ms as HH:MM:SS
  const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Build display
  let timeText: string;
  let ampm = "";
  let analogHours = 0, analogMinutes = 0, analogSeconds = 0;
  let isNegative = false;
  let subtitleText = "";

  if (mode === "service") {
    // Service Countdown: count down to start time, then show elapsed
    const target = config.serviceStartTime;
    if (!target) {
      timeText = "- - -";
      subtitleText = "Set Service Time";
    } else {
      const diffMs = target - now.getTime();
      if (diffMs > 0) {
        // Counting down to service start
        const totalSec = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        timeText = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        subtitleText = "UNTIL SERVICE";
        analogHours = h; analogMinutes = m; analogSeconds = s;
      } else {
        // Service has started — show elapsed
        const elapsedMs = Math.abs(diffMs);
        timeText = formatElapsed(elapsedMs);
        const totalSec = Math.floor(elapsedMs / 1000);
        analogHours = Math.floor(totalSec / 3600);
        analogMinutes = Math.floor((totalSec % 3600) / 60);
        analogSeconds = totalSec % 60;
        subtitleText = "SERVICE ELAPSED";
      }
    }
  } else if (mode === "streamtime") {
    if (!isTallyConnected) {
      timeText = "- - -";
      subtitleText = "Not Connected";
    } else if (!streamStartedAt) {
      timeText = "00:00:00";
      subtitleText = atem?.streaming ? "STREAMING" : "Waiting for Stream";
    } else {
      const elapsed = now.getTime() - streamStartedAt;
      timeText = formatElapsed(elapsed);
      subtitleText = "STREAM TIME";
    }
  } else if (mode === "recordtime") {
    if (!isTallyConnected) {
      timeText = "- - -";
      subtitleText = "Not Connected";
    } else if (!recordingStartedAt) {
      timeText = "00:00:00";
      subtitleText = "Waiting for Recording";
    } else {
      const elapsed = now.getTime() - recordingStartedAt;
      timeText = formatElapsed(elapsed);
      subtitleText = "REC DURATION";
    }
  } else if (mode === "lastcue") {
    if (!isTallyConnected) {
      timeText = "- - -";
      subtitleText = "Not Connected";
    } else if (!proPresenter?.connected) {
      timeText = "- - -";
      subtitleText = "ProPresenter Offline";
    } else if (!lastCueAt) {
      timeText = "00:00:00";
      subtitleText = "Waiting for Cue";
    } else {
      const elapsed = now.getTime() - lastCueAt;
      timeText = formatElapsed(elapsed);
      subtitleText = "SINCE LAST CUE";
    }
  } else if (mode === "atemrecord") {
    if (!isTallyConnected) {
      timeText = "- - -";
      subtitleText = "Not Connected";
    } else if (!atemRecordingStartedAt) {
      timeText = "00:00:00";
      subtitleText = atem?.recording ? "RECORDING" : "Waiting for Recording";
    } else {
      const elapsed = now.getTime() - atemRecordingStartedAt;
      timeText = formatElapsed(elapsed);
      subtitleText = "ATEM REC";
    }
  } else if (mode === "atemtimecode") {
    if (!isTallyConnected) {
      timeText = "- - -";
      subtitleText = "Not Connected";
    } else if (!atem?.connected) {
      timeText = "- - -";
      subtitleText = "ATEM Offline";
    } else if (!atemTimecode) {
      timeText = "00:00:00:00";
      subtitleText = "No Timecode";
    } else {
      timeText = atemTimecode;
      subtitleText = "ATEM TIMECODE";
    }
  } else if (mode === "propresenter") {
    if (proPresenter?.connected) {
      // Show timer data if available, otherwise show current slide info
      if (proPresenter.timers && proPresenter.timers.length > 0) {
        const timer = proPresenter.timers.find(t => t.running) || proPresenter.timers[0];
        timeText = timer.value || "00:00:00";
        subtitleText = timer.name || "ProPresenter Timer";
      } else {
        timeText = proPresenter.currentSlide || proPresenter.currentItem || "LIVE";
        subtitleText = proPresenter.presentation
          ? `${proPresenter.slideIndex !== undefined ? proPresenter.slideIndex + 1 : "?"} / ${proPresenter.slideTotal || "?"}`
          : "ProPresenter";
      }
    } else {
      timeText = "- - -";
      subtitleText = proPresenter ? "ProPresenter Offline" : "No Connection";
    }
  } else if (mode === "hyperdeck") {
    const hd = hyperdecks?.[hyperdeckIndex];
    const hdLabel = hd?.name || hd?.host || `HyperDeck ${hyperdeckIndex + 1}`;
    if (hd?.connected) {
      timeText = hd.currentTimecode || "00:00:00:00";
      subtitleText = hd.recording ? "REC" : hd.playing ? "PLAY" : hd.transportState?.toUpperCase() || "STOP";
      subtitleText += ` — ${hdLabel}`;
    } else {
      timeText = "- - -";
      subtitleText = `${hdLabel} Offline`;
    }
  } else if (mode === "countup") {
    const result = formatTimer(timerElapsedMs, showSeconds);
    timeText = result.text; isNegative = result.negative;
    const totalSec = Math.floor(timerElapsedMs / 1000);
    analogHours = Math.floor(totalSec / 3600); analogMinutes = Math.floor((totalSec % 3600) / 60); analogSeconds = totalSec % 60;
  } else if (mode === "countdown") {
    const remainingMs = countdownFrom * 1000 - timerElapsedMs;
    const result = formatTimer(remainingMs, showSeconds);
    timeText = result.text; isNegative = result.negative;
    const absSec = Math.floor(Math.abs(remainingMs) / 1000);
    analogHours = Math.floor(absSec / 3600); analogMinutes = Math.floor((absSec % 3600) / 60); analogSeconds = absSec % 60;
  } else if (mode === "countto" && config.countToTarget) {
    const diffMs = config.countToTarget - now.getTime();
    isNegative = diffMs < 0;
    const absSec = Math.floor(Math.abs(diffMs) / 1000);
    const h = Math.floor(absSec / 3600); const m = Math.floor((absSec % 3600) / 60); const s = absSec % 60;
    if (showSeconds) {
      timeText = h > 0 ? `${String(h)}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    } else {
      timeText = h > 0 ? `${String(h)}:${String(m).padStart(2, "0")}` : `00:${String(m).padStart(2, "0")}`;
    }
    analogHours = h; analogMinutes = m; analogSeconds = s;
  } else {
    const tz = getTimeInZone(now, config.timezone);
    let h = tz.hours; const m = tz.minutes; const s = tz.seconds;
    analogHours = tz.hours; analogMinutes = m; analogSeconds = s;
    ampm = h >= 12 ? "PM" : "AM";
    if (!config.is24h && h > 12) h -= 12;
    if (!config.is24h && h === 0) h = 12;
    timeText = showSeconds
      ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const countdownRemainingMs = countdownFrom * 1000 - timerElapsedMs;
  const isOvertime = mode === "countdown" && countdownRemainingMs < 0;
  const overtimeMs = isOvertime ? Math.abs(countdownRemainingMs) : 0;
  const isOvertimeFlashing = isOvertime && overtimeMs > 30000;
  // Immediately red on overtime; flash after 30s
  const overtimeColor = isOvertime ? "#ef4444" : config.clockColor;

  useEffect(() => {
    if (!allowOverrun && mode === "countdown" && countdownFrom * 1000 - timerElapsedMs <= 0 && !paused) pauseTimer();
  }, [allowOverrun, mode, countdownFrom, timerElapsedMs, paused, pauseTimer]);

  const isTimerMode = mode === "countup" || mode === "countdown";
  const isLiveSource = mode === "propresenter" || mode === "hyperdeck" || mode === "streamtime" || mode === "recordtime" || mode === "lastcue" || mode === "atemrecord" || mode === "atemtimecode";
  const isServiceMode = mode === "service";
  const modeLabels: Record<string, string> = {
    countup: "Count Up", countdown: "Countdown", countto: "Count To",
    propresenter: "ProPresenter", hyperdeck: "HyperDeck",
    service: "Service", streamtime: "Stream Time", recordtime: "Recording",
    lastcue: "Last Cue", atemrecord: "ATEM Rec", atemtimecode: "ATEM TC",
  };
  const modeLabel = modeLabels[mode] || "";

  // Available modes: free tier + TallyConnect tier (when connected)
  const availableModes: { value: ClockMode; label: string; group?: string }[] = [
    { value: "clock", label: "Clock" },
    { value: "countup", label: "Count Up" },
    { value: "countdown", label: "Countdown" },
    { value: "countto", label: "Count To" },
    { value: "service", label: "Service" },
  ];
  if (isTallyConnected) {
    availableModes.push({ value: "propresenter", label: "ProPresenter" });
    availableModes.push({ value: "hyperdeck", label: "HyperDeck" });
    availableModes.push({ value: "streamtime", label: "Stream Time" });
    availableModes.push({ value: "recordtime", label: "Recording" });
    availableModes.push({ value: "lastcue", label: "Last Cue" });
    availableModes.push({ value: "atemrecord", label: "ATEM Rec" });
    availableModes.push({ value: "atemtimecode", label: "ATEM Timecode" });
  }

  return (
    <div
      ref={cellRef}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart?.(); }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(e); }}
      onDrop={(e) => { e.preventDefault(); onDrop?.(e); }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSettings(false); }}
      className={`relative flex flex-col items-center justify-center bg-black border-2 rounded-lg overflow-hidden transition-all duration-200 h-full ${isDragging ? "opacity-30 scale-95 border-white/20" : isDropTarget ? "border-red-500/60 bg-red-500/5" : "border-white/10 opacity-100"} ${isOvertimeFlashing ? "animate-slow-flash" : ""}`}
      style={{ minHeight: 80 }}
    >
      {/* Controls */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 z-30 transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <GripVertical size={16} className="text-white/30 cursor-grab active:cursor-grabbing" />
        <div className="flex items-center gap-2">
          {isTimerMode && (
            <>
              <button onClick={togglePause} className="text-white/30 hover:text-white/70 transition-colors">
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button onClick={() => resetTimer(false)} className="text-white/30 hover:text-white/70 transition-colors">
                <RotateCcw size={14} />
              </button>
            </>
          )}
          <button onClick={() => setShowSettings(p => !p)} className="text-white/30 hover:text-white/70 transition-colors">
            <Settings size={16} />
          </button>
          <button onClick={() => onRemove(config.id)} className="text-white/30 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Clock name */}
      <span className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: `${config.clockColor}88` }}>
        {config.clockName || modeLabel || tzLabel}
      </span>

      {/* Time display */}
      {displayStyle === "analog" && !isLiveSource ? (
        <AnalogClock
          hours={analogHours} minutes={analogMinutes} seconds={analogSeconds}
          color={isOvertime ? overtimeColor : config.clockColor}
          digitalTime={countdownRemainingMs < 0 && mode === "countdown" ? `+${timeText}` : timeText}
          fontFamily={font.css} fontWeight={font.weight} thickness={thickness}
        />
      ) : (
        <>
          <div
            className="tracking-wider whitespace-nowrap"
            style={{
              fontSize: `${fontSize * 0.6}px`,
              fontFamily: font.css, fontWeight: font.weight, lineHeight: 1.1,
              color: isOvertime ? overtimeColor : config.clockColor,
            }}
          >
            {countdownRemainingMs < 0 && mode === "countdown" ? `+${timeText}` : timeText}
          </div>
          {mode === "clock" && !config.is24h && (
            <span className="font-mono text-sm tracking-widest mt-1" style={{ color: `${config.clockColor}80` }}>{ampm}</span>
          )}
        </>
      )}

      {/* Subtitle */}
      <span className="font-mono text-[10px] tracking-wider mt-1 text-white/20">
        {isLiveSource ? subtitleText
          : isServiceMode ? subtitleText
          : mode === "clock" ? tzLabel
          : mode === "countto" ? (config.countToTarget ? "COUNTING TO" : "SET TARGET")
          : (paused ? "PAUSED" : "RUNNING")}
      </span>

      {/* Live source indicator */}
      {isLiveSource && (
        <span className="absolute top-2 left-2 flex items-center gap-1 z-20">
          <span className={`w-1.5 h-1.5 rounded-full ${
            (mode === "propresenter" && proPresenter?.connected) ||
            (mode === "hyperdeck" && hyperdecks?.[hyperdeckIndex]?.connected) ||
            (mode === "streamtime" && streamStartedAt) ||
            (mode === "recordtime" && recordingStartedAt) ||
            (mode === "lastcue" && proPresenter?.connected) ||
            (mode === "atemrecord" && atemRecordingStartedAt) ||
            (mode === "atemtimecode" && atem?.connected && atemTimecode)
              ? "bg-green-500 animate-pulse" : "bg-white/20"
          }`} />
        </span>
      )}

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-20 p-4 overflow-y-auto flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-mono">Settings</p>

            {/* Display style */}
            {!isLiveSource && (
              <div>
                <p className="text-white/30 text-[10px] font-mono mb-1">Display</p>
                <div className="flex gap-1">
                  {(["digital", "analog"] as DisplayStyle[]).map(d => (
                    <button key={d} onClick={() => onUpdate({ ...config, displayStyle: d })}
                      className="px-2 py-0.5 text-[10px] font-mono border transition-colors"
                      style={{ color: displayStyle === d ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: displayStyle === d ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                    >{d === "digital" ? "Digital" : "Analog"}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode */}
            <div>
              <p className="text-white/30 text-[10px] font-mono mb-1">Mode</p>
              <div className="flex flex-wrap gap-1">
                {availableModes.map(m => (
                  <button key={m.value}
                    onClick={() => { onUpdate({ ...config, mode: m.value }); resetTimer(false); }}
                    className="px-2 py-0.5 text-[10px] font-mono border transition-colors"
                    style={{ color: mode === m.value ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: mode === m.value ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                  >{m.label}</button>
                ))}
              </div>
            </div>

            {/* HyperDeck selector */}
            {mode === "hyperdeck" && hyperdecks && hyperdecks.length > 1 && (
              <div>
                <p className="text-white/30 text-[10px] font-mono mb-1">HyperDeck</p>
                <div className="flex flex-wrap gap-1">
                  {hyperdecks.map((hd, i) => (
                    <button key={i} onClick={() => onUpdate({ ...config, hyperdeckIndex: i })}
                      className="px-2 py-0.5 text-[10px] font-mono border transition-colors"
                      style={{ color: hyperdeckIndex === i ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: hyperdeckIndex === i ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                    >{hd.name || hd.host || `HD${i + 1}`}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Service start time */}
            {mode === "service" && (
              <div>
                <p className="text-white/30 text-[10px] font-mono mb-1">Service Start Time</p>
                <div className="flex gap-1">
                  <input type="time" defaultValue={config.serviceStartTime ? new Date(config.serviceStartTime).toTimeString().slice(0, 5) : ""}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [h, m] = e.target.value.split(":").map(Number);
                      const target = new Date(); target.setHours(h, m, 0, 0);
                      if (target.getTime() < Date.now()) target.setDate(target.getDate() + 1);
                      onUpdate({ ...config, serviceStartTime: target.getTime() });
                    }}
                    className="bg-transparent border border-white/20 outline-none text-xs font-mono text-white/70 px-2 py-1 rounded" />
                </div>
              </div>
            )}

            {/* Count To target */}
            {mode === "countto" && (
              <div>
                <p className="text-white/30 text-[10px] font-mono mb-1">Target Time</p>
                <div className="flex gap-1">
                  <input type="time" value={countToInput} onChange={(e) => setCountToInput(e.target.value)}
                    className="bg-transparent border border-white/20 outline-none text-xs font-mono text-white/70 px-2 py-1 rounded" />
                  <button onClick={() => {
                    if (!countToInput) return;
                    const [h, m] = countToInput.split(":").map(Number);
                    const target = new Date(); target.setHours(h, m, 0, 0);
                    if (target.getTime() < Date.now()) target.setDate(target.getDate() + 1);
                    onUpdate({ ...config, countToTarget: target.getTime() });
                  }} className="px-2 py-0.5 text-[10px] font-mono border transition-colors"
                    style={{ color: config.clockColor, borderColor: `${config.clockColor}60` }}
                  >Set</button>
                </div>
              </div>
            )}

            {/* Countdown duration */}
            {mode === "countdown" && (
              <div>
                <p className="text-white/30 text-[10px] font-mono mb-1">Duration</p>
                <div className="flex flex-wrap gap-1">
                  {COUNTDOWN_PRESETS.map(p => (
                    <button key={p.seconds} onClick={() => onUpdate({ ...config, countdownFrom: p.seconds })}
                      className="px-2 py-0.5 text-[10px] font-mono border transition-colors"
                      style={{ color: countdownFrom === p.seconds ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: countdownFrom === p.seconds ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                    >{p.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Overtime */}
            {mode === "countdown" && (
              <div>
                <button onClick={() => onUpdate({ ...config, allowOverrun: !allowOverrun })}
                  className="px-2 py-0.5 text-[10px] font-mono border transition-colors"
                  style={{ color: allowOverrun ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: allowOverrun ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                >{allowOverrun ? "Overrun: ON" : "Overrun: OFF"}</button>
                {allowOverrun && (
                  <div className="mt-1">
                    <p className="text-white/30 text-[10px] font-mono mb-1">Warning Color</p>
                    <div className="flex gap-1">
                      {COLOR_PRESETS.map(c => (
                        <button key={c.value} onClick={() => onUpdate({ ...config, overtimeWarningColor: c.value })}
                          className="w-4 h-4 rounded-full border transition-transform"
                          style={{ backgroundColor: c.value, borderColor: overtimeWarningColor === c.value ? "white" : "transparent", transform: overtimeWarningColor === c.value ? "scale(1.2)" : "scale(1)" }}
                          title={c.label} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Name */}
            <input value={config.clockName} onChange={(e) => onUpdate({ ...config, clockName: e.target.value })}
              placeholder="Clock name..." className="bg-transparent border-b border-white/20 outline-none text-xs font-mono text-white/70 px-1 py-1" />

            {/* Timezone */}
            {mode === "clock" && (
              <div>
                <p className="text-white/30 text-[10px] font-mono mb-1">Timezone</p>
                <div className="flex flex-wrap gap-1">
                  {COMMON_TIMEZONES.map(t => (
                    <button key={t.value} onClick={() => onUpdate({ ...config, timezone: t.value })}
                      className="px-2 py-0.5 text-[10px] font-mono border transition-colors"
                      style={{ color: config.timezone === t.value ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: config.timezone === t.value ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                    >{t.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            <div>
              <p className="text-white/30 text-[10px] font-mono mb-1">Color</p>
              <div className="flex gap-1">
                {COLOR_PRESETS.map(c => (
                  <button key={c.value} onClick={() => onUpdate({ ...config, clockColor: c.value })}
                    className="w-5 h-5 rounded-full border-2 transition-transform"
                    style={{ backgroundColor: c.value, borderColor: config.clockColor === c.value ? "white" : "transparent", transform: config.clockColor === c.value ? "scale(1.2)" : "scale(1)" }} />
                ))}
              </div>
            </div>

            {/* Font */}
            <div>
              <p className="text-white/30 text-[10px] font-mono mb-1">Font</p>
              <div className="flex flex-wrap gap-1">
                {CLOCK_FONTS.map(f => (
                  <button key={f.name} onClick={() => onUpdate({ ...config, fontName: f.name })}
                    className="px-2 py-0.5 text-[10px] border transition-colors"
                    style={{ fontFamily: f.css, color: config.fontName === f.name ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: config.fontName === f.name ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {/* Size scale */}
            <div>
              <p className="text-white/30 text-[10px] font-mono mb-1">Size ({Math.round((config.sizeScale || 1) * 100)}%)</p>
              <input type="range" min={50} max={200} step={5} value={Math.round((config.sizeScale || 1) * 100)}
                onChange={(e) => onUpdate({ ...config, sizeScale: parseInt(e.target.value) / 100 })}
                className="w-full accent-current" style={{ color: config.clockColor }} />
            </div>

            {/* Thickness (analog) */}
            {displayStyle === "analog" && !isLiveSource && (
              <div>
                <p className="text-white/30 text-[10px] font-mono mb-1">Thickness ({thickness})</p>
                <input type="range" min={1} max={5} step={1} value={thickness}
                  onChange={(e) => onUpdate({ ...config, thickness: parseInt(e.target.value) })}
                  className="w-full accent-current" style={{ color: config.clockColor }} />
              </div>
            )}

            {/* 12/24h + Show Seconds */}
            {(mode === "clock" || mode === "countup" || mode === "countdown" || mode === "countto") && (
              <div className="flex flex-wrap gap-1 self-start">
                {mode === "clock" && (
                  <button onClick={() => onUpdate({ ...config, is24h: !config.is24h })}
                    className="px-2 py-1 text-[10px] font-mono border border-white/10 transition-colors"
                    style={{ color: config.clockColor }}
                  >{config.is24h ? "24H → 12H" : "12H → 24H"}</button>
                )}
                <button onClick={() => onUpdate({ ...config, showSeconds: !showSeconds })}
                  className="px-2 py-1 text-[10px] font-mono border transition-colors"
                  style={{ color: showSeconds ? config.clockColor : "rgba(255,255,255,0.3)", borderColor: showSeconds ? `${config.clockColor}60` : "rgba(255,255,255,0.1)" }}
                  title="Toggle seconds display"
                >Show Seconds: {showSeconds ? "ON" : "OFF"}</button>
              </div>
            )}

            <button onClick={() => setShowSettings(false)}
              className="mt-auto px-2 py-1 text-[10px] font-mono text-white/40 border border-white/10 self-center"
            >Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClockCell;
