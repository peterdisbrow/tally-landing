import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, X, Plus, Minus, Type, Globe, Palette, Save, FolderOpen, Trash2, LayoutGrid, Circle } from "lucide-react";
import AnalogClock from "@/components/clock/AnalogClock";
import { supabase } from "@/integrations/supabase/client";

type ClockMode = "clock" | "countup" | "countdown" | "countto";
type DisplayStyle = "digital" | "analog";

type ClockFont = {
  name: string;
  label: string;
  css: string;
  weight: number;
};

type ClockPreset = {
  id: string;
  name: string;
  clockName: string;
  clockColor: string;
  fontName: string;
  timezone: string;
  is24h: boolean;
  mode: ClockMode;
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

const STORAGE_KEY = "broadcast-clock-settings";
const PRESETS_KEY = "broadcast-clock-presets";

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveSettings = (settings: Record<string, any>) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
};

const loadPresets = (): ClockPreset[] => {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const savePresets = (presets: ClockPreset[]) => {
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); } catch {}
};

const getTimeInZone = (date: Date, timezone: string): { hours: number; minutes: number; seconds: number; ms: number } => {
  if (timezone === "local") {
    return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds(), ms: date.getMilliseconds() };
  }
  const str = date.toLocaleString("en-US", { timeZone: timezone, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 } as any);
  const parts = str.split(":");
  return { hours: parseInt(parts[0]) % 24, minutes: parseInt(parts[1]), seconds: parseInt(parts[2]), ms: date.getMilliseconds() };
};

const formatTime = (
  value: number,
  show24h: boolean,
  showSeconds: boolean = true,
  showTenths: boolean = false,
  tenths: number = 0,
  hideLeadingZero: boolean = false,
  showMs: boolean = false
) => {
  const negative = value < 0;
  const abs = Math.abs(value);

  let totalSec: number;
  let ms = 0;
  if (showMs) {
    totalSec = Math.floor(abs / 1000);
    ms = Math.floor((abs % 1000) / 10);
  } else {
    totalSec = abs;
  }

  let h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (!show24h && h > 12) h -= 12;
  if (!show24h && h === 0) h = 12;

  const hStr = hideLeadingZero ? String(h) : String(h).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  const sStr = String(s).padStart(2, "0");

  let result: string;
  if (showMs && h === 0) {
    result = showSeconds ? `${mStr}:${sStr}` : `${mStr}`;
  } else {
    result = showSeconds ? `${hStr}:${mStr}:${sStr}` : `${hStr}:${mStr}`;
  }
  if (showMs && showSeconds) result += `.${String(ms).padStart(2, "0")}`;
  else if (showTenths && showSeconds) result += `.${tenths}`;
  return { text: result, negative };
};

const AUTO_HIDE_DELAY = 3000;

const Clock = () => {
  const saved = useMemo(() => loadSettings(), []);

  const [mode, setMode] = useState<ClockMode>(saved?.mode || "clock");
  const [is24h, setIs24h] = useState(saved?.is24h ?? false);
  const [showTenths, setShowTenths] = useState(saved?.showTenths ?? false);
  const [showMiniClock, setShowMiniClock] = useState(saved?.showMiniClock ?? false);
  const [showHelp, setShowHelp] = useState(false);
  const [paused, setPaused] = useState(false);
  const [countdownFrom, setCountdownFrom] = useState(300);
  const [countToTarget, setCountToTarget] = useState<number | null>(null);
  const [tenths, setTenths] = useState(0);

  // Ms-precision timer tracking
  const timerStartRef = useRef<number | null>(null);
  const timerAccRef = useRef(0);
  const [timerElapsedMs, setTimerElapsedMs] = useState(0);
  const [now, setNow] = useState(new Date());
  const [sign, setSign] = useState<"+" | "-">("+");
  const [hideLeadingZero, setHideLeadingZero] = useState(saved?.hideLeadingZero ?? false);
  const [fontSize, setFontSize] = useState(saved?.fontSize ?? 200);
  const [autoSize, setAutoSize] = useState(saved?.autoSize ?? true);
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>(saved?.displayStyle || "digital");
  const clockRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFont, setSelectedFont] = useState<ClockFont>(
    CLOCK_FONTS.find(f => f.name === saved?.fontName) || CLOCK_FONTS[0]
  );
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [ntpOffset, setNtpOffset] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "local">("syncing");
  
  const [enteringTime, setEnteringTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [enterMode, setEnterMode] = useState<"countdown" | "countto">("countdown");
  const [timezone, setTimezone] = useState(saved?.timezone || "local");
  const [showTzPicker, setShowTzPicker] = useState(false);

  // Naming and color
  const [clockName, setClockName] = useState(saved?.clockName || "");
  const [clockColor, setClockColor] = useState(saved?.clockColor || "#ef4444");
  const [overtimeWarningColor, setOvertimeWarningColor] = useState(saved?.overtimeWarningColor || "#f59e0b");
  const [allowOverrun, setAllowOverrun] = useState(saved?.allowOverrun ?? true);
  const [editingName, setEditingName] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Presets
  const [presetList, setPresetList] = useState<ClockPreset[]>(() => loadPresets());
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const presetNameRef = useRef<HTMLInputElement>(null);

  // Auto-hide UI (except logo)
  const [uiVisible, setUiVisible] = useState(true);
  const [logoVisible, setLogoVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = useCallback(() => {
    setUiVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setUiVisible(false), AUTO_HIDE_DELAY);
  }, []);

  useEffect(() => {
    const handleActivity = () => resetHideTimer();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    resetHideTimer();
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetHideTimer]);

  // Persist settings on change
  useEffect(() => {
    saveSettings({
      clockName, clockColor, fontName: selectedFont.name, timezone,
      is24h, mode, showTenths, showMiniClock, hideLeadingZero, fontSize, autoSize, displayStyle,
      overtimeWarningColor, allowOverrun,
    });
  }, [clockName, clockColor, selectedFont, timezone, is24h, mode, showTenths, showMiniClock, hideLeadingZero, fontSize, autoSize, displayStyle, overtimeWarningColor, allowOverrun]);

  // Time sync — edge function first, then external APIs as fallback
  const syncTime = useCallback(async () => {
    // Primary: our own edge function (consistent across all clients)
    try {
      const before = Date.now();
      const { data, error } = await supabase.functions.invoke("time-sync");
      const after = Date.now();
      if (!error && data?.timestamp) {
        const roundTrip = (after - before) / 2;
        setNtpOffset(data.timestamp - (before + roundTrip));
        setSyncStatus("synced");
        return;
      }
    } catch { /* fall through to external APIs */ }

    // Fallback: external time APIs
    const apis = [
      { url: "https://timeapi.io/api/time/current/zone?timeZone=UTC", parse: (d: any) => new Date(d.dateTime + "Z").getTime() },
      { url: "https://worldtimeapi.org/api/timezone/UTC", parse: (d: any) => new Date(d.utc_datetime).getTime() },
    ];
    for (const api of apis) {
      try {
        const before = Date.now();
        const res = await fetch(api.url);
        if (!res.ok) continue;
        const after = Date.now();
        const data = await res.json();
        const serverTime = api.parse(data);
        if (isNaN(serverTime)) continue;
        const roundTrip = (after - before) / 2;
        setNtpOffset(serverTime - (before + roundTrip));
        setSyncStatus("synced");
        return;
      } catch { continue; }
    }
    setNtpOffset(0);
    setSyncStatus("local");
    console.warn("Time sync failed, using local clock");
  }, []);

  useEffect(() => { syncTime(); const id = setInterval(syncTime, 60000); return () => clearInterval(id); }, [syncTime]);
  useEffect(() => { const id = setInterval(() => setNow(new Date(Date.now() + ntpOffset)), 100); return () => clearInterval(id); }, [ntpOffset]);
  useEffect(() => { if (showTenths) setTenths(Math.floor(now.getMilliseconds() / 100)); }, [now, showTenths]);

  // Timer helpers
  const startTimer = useCallback(() => {
    timerStartRef.current = Date.now();
    setPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    if (timerStartRef.current !== null) {
      timerAccRef.current += Date.now() - timerStartRef.current;
      timerStartRef.current = null;
    }
    setPaused(true);
  }, []);

  const togglePause = useCallback(() => {
    if (paused) startTimer();
    else pauseTimer();
  }, [paused, startTimer, pauseTimer]);

  const resetTimer = useCallback((andStart = true) => {
    timerAccRef.current = 0;
    timerStartRef.current = andStart ? Date.now() : null;
    setTimerElapsedMs(0);
    setPaused(!andStart);
  }, []);

  // Fast tick for ms-precision timer display
  useEffect(() => {
    if (mode === "clock") return;
    const id = setInterval(() => {
      const elapsed = timerAccRef.current + (timerStartRef.current !== null ? Date.now() - timerStartRef.current : 0);
      setTimerElapsedMs(elapsed);
    }, 33);
    return () => clearInterval(id);
  }, [mode, paused]);

  useEffect(() => { if (editingName && nameInputRef.current) { nameInputRef.current.focus(); nameInputRef.current.select(); } }, [editingName]);
  useEffect(() => { if (savingPreset && presetNameRef.current) { presetNameRef.current.focus(); } }, [savingPreset]);

  // Auto-size
  useEffect(() => {
    if (!autoSize || !clockRef.current || !containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (!clockRef.current || !containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth * 0.95;
      const textWidth = clockRef.current.scrollWidth;
      if (textWidth > 0) {
        const scale = containerWidth / textWidth;
        const newSize = Math.floor(fontSize * scale);
        const clamped = Math.max(30, Math.min(newSize, 800));
        if (Math.abs(clamped - fontSize) > 2) setFontSize(clamped);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [autoSize, fontSize]);

  // Save preset
  const handleSavePreset = useCallback((name: string) => {
    const preset: ClockPreset = {
      id: Date.now().toString(),
      name,
      clockName, clockColor, fontName: selectedFont.name, timezone, is24h, mode,
    };
    const updated = [...presetList, preset];
    setPresetList(updated);
    savePresets(updated);
    setSavingPreset(false);
    setPresetNameInput("");
  }, [clockName, clockColor, selectedFont, timezone, is24h, mode, presetList]);

  // Load preset
  const handleLoadPreset = useCallback((preset: ClockPreset) => {
    setClockName(preset.clockName);
    setClockColor(preset.clockColor);
    setSelectedFont(CLOCK_FONTS.find(f => f.name === preset.fontName) || CLOCK_FONTS[0]);
    setTimezone(preset.timezone);
    setIs24h(preset.is24h);
    setMode(preset.mode);
    setShowPresetPicker(false);
  }, []);

  // Delete preset
  const handleDeletePreset = useCallback((id: string) => {
    const updated = presetList.filter(p => p.id !== id);
    setPresetList(updated);
    savePresets(updated);
  }, [presetList]);

  // Keyboard shortcuts
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (editingName) {
        if (e.key === "Enter" || e.key === "Escape") setEditingName(false);
        return;
      }
      if (savingPreset) {
        if (e.key === "Escape") { setSavingPreset(false); setPresetNameInput(""); }
        return;
      }
      if (enteringTime) {
        if (e.key === "Enter") {
          const parts = timeInput.split(":").map(Number);
          let totalSec = 0;
          if (enterMode === "countdown") {
            if (parts.length === 3) totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
            else if (parts.length === 2) totalSec = parts[0] * 60 + parts[1];
            else totalSec = parts[0] * 60;
            setCountdownFrom(totalSec);
            setMode("countdown");
            resetTimer(true);
          } else {
            if (parts.length >= 2) {
              const target = new Date();
              target.setHours(parts[0], parts[1], parts[2] || 0, 0);
              if (target.getTime() < Date.now()) target.setDate(target.getDate() + 1);
              setCountToTarget(target.getTime());
              setMode("countto");
              setPaused(false);
            }
          }
          setEnteringTime(false);
          setTimeInput("");
          return;
        }
        if (e.key === "Escape") { setEnteringTime(false); setTimeInput(""); return; }
        if (e.key === "Backspace") { setTimeInput((p) => p.slice(0, -1)); return; }
        if (/[\d:]/.test(e.key)) { setTimeInput((p) => p + e.key); }
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "c") { setMode("clock"); setPaused(false); }
      else if (key === "s") { setMode("countup"); resetTimer(true); }
      else if (key === "d") { setEnteringTime(true); setEnterMode("countdown"); setTimeInput(""); }
      else if (key === "m") { setEnteringTime(true); setEnterMode("countto"); setTimeInput(""); }
      else if (key === "r") {
        if (mode === "countdown" || mode === "countup") resetTimer(true);
      }
      else if (key === "p" || key === " ") { e.preventDefault(); togglePause(); }
      else if (key === "t") { setShowTenths((p) => !p); }
      else if (key === "h") { setIs24h((p) => !p); }
      else if (key === "q") { setShowMiniClock((p) => !p); }
      else if (key === "z") { setHideLeadingZero((p) => !p); }
      else if (key === "i") { setSign((p) => (p === "+" ? "-" : "+")); }
      else if (key === "f") { setShowFontPicker((p) => !p); }
      else if (key === "n") { setEditingName(true); }
      else if (key === "k") {
        const currentIndex = COLOR_PRESETS.findIndex((c) => c.value === clockColor);
        setClockColor(COLOR_PRESETS[(currentIndex + 1) % COLOR_PRESETS.length].value);
      }
      else if (key === "a") { setAutoSize((p) => !p); }
      else if (key === "l") { setLogoVisible((p) => !p); }
      
      else if (key === "arrowup") { setAutoSize(false); setFontSize((p) => Math.min(p + 10, 800)); }
      else if (key === "arrowdown") { setAutoSize(false); setFontSize((p) => Math.max(p - 10, 30)); }
      else if (key === "-") {
        const adj = e.ctrlKey ? 60 : e.shiftKey ? 30 : 5;
        timerAccRef.current += adj * 1000;
      } else if (key === "=") {
        const adj = e.ctrlKey ? 60 : e.shiftKey ? 30 : 5;
        timerAccRef.current = Math.max(0, timerAccRef.current - adj * 1000);
      } else if (/\d/.test(key)) {
        const d = key === "0" ? 10 : parseInt(key);
        let minutes = d;
        if (e.shiftKey && e.ctrlKey) { setCountdownFrom(d * 3600); }
        else if (e.ctrlKey) { minutes = d * 30; setCountdownFrom(minutes * 60); }
        else if (e.shiftKey) { minutes = d * 5; setCountdownFrom(minutes * 60); }
        else { setCountdownFrom(minutes * 60); }
        setMode("countdown");
        resetTimer(true);
      }
    },
    [editingName, savingPreset, enteringTime, timeInput, mode, countdownFrom, enterMode, clockColor, togglePause, resetTimer]
  );

  useEffect(() => { window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [handleKey]);

  // Compute display time
  let displayTime = { text: "00:00:00", negative: false };
  const tz = getTimeInZone(now, timezone);
  const currentSeconds = tz.hours * 3600 + tz.minutes * 60 + tz.seconds;

  if (mode === "clock") {
    displayTime = formatTime(currentSeconds, is24h, true, showTenths, tenths);
  } else if (mode === "countup") {
    displayTime = formatTime(timerElapsedMs, true, true, false, 0, hideLeadingZero, true);
  } else if (mode === "countdown") {
    const remainingMs = countdownFrom * 1000 - timerElapsedMs;
    displayTime = formatTime(remainingMs, true, true, false, 0, hideLeadingZero, true);
  } else if (mode === "countto" && countToTarget !== null) {
    const diffSec = Math.round((countToTarget - Date.now()) / 1000);
    displayTime = formatTime(diffSec, true, true, false, 0, hideLeadingZero);
  }

  const countdownRemainingMs = countdownFrom * 1000 - timerElapsedMs;
  const isOvertime = mode === "countdown" && countdownRemainingMs < 0;
  const overtimeMs = isOvertime ? Math.abs(countdownRemainingMs) : 0;
  const isOvertimeFlashing = isOvertime && overtimeMs > 30000;
  // Pre-expiry warning (last 30s before 0), immediately red on overtime
  const isWarning = mode === "countdown" && countdownRemainingMs <= 30000 && countdownRemainingMs > 0;
  const activeColor = isOvertime ? "#ef4444" : isWarning ? "#eab308" : clockColor;

  // Stop at zero if overrun not allowed
  useEffect(() => {
    if (!allowOverrun && mode === "countdown" && countdownFrom * 1000 - timerElapsedMs <= 0 && !paused) {
      pauseTimer();
    }
  }, [allowOverrun, mode, countdownFrom, timerElapsedMs, paused, pauseTimer]);

  const countdownPresets = [
    { label: "1m", seconds: 60 },
    { label: "2m", seconds: 120 },
    { label: "5m", seconds: 300 },
    { label: "10m", seconds: 600 },
    { label: "15m", seconds: 900 },
    { label: "30m", seconds: 1800 },
    { label: "1h", seconds: 3600 },
  ];

  const defaultName = mode === "countup" ? "Count Up" : mode === "countdown" ? "Countdown" : mode === "countto" ? "Count To" : "Clock";
  const displayName = clockName || defaultName;

  const uiOpacity = uiVisible ? 1 : 0;
  const uiTransition = "opacity 0.5s ease";

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-screen bg-black flex flex-col items-center justify-center relative select-none overflow-hidden cursor-default"
      onClick={() => {
        if (showHelp) setShowHelp(false);
        if (showColorPicker) setShowColorPicker(false);
        if (showPresetPicker) setShowPresetPicker(false);
      }}
    >
      {/* Back to site + Multi-clock */}
      <div
        className="absolute top-4 left-4 z-50 flex items-center gap-3"
        style={{ opacity: uiOpacity, transition: uiTransition }}
      >
        <a href="/" className="text-white/30 hover:text-white/70 transition-colors">
          <ArrowLeft size={24} />
        </a>
        <Link to="/multi-clock" className="text-white/30 hover:text-white/70 transition-colors" title="Multi-clock view">
          <LayoutGrid size={22} />
        </Link>
      </div>

      {/* NTP sync indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 font-mono text-[10px] text-white/20"
        style={{ opacity: uiOpacity, transition: uiTransition }}
      >
        {syncStatus === "synced" ? (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 inline-block" />
            NTP synced ({ntpOffset > 0 ? "+" : ""}{ntpOffset}ms)
          </span>
        ) : syncStatus === "local" ? (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />
            Local clock
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/60 inline-block animate-pulse" />
            Syncing...
          </span>
        )}
      </div>

      {/* Size controls */}
      <div
        className="absolute bottom-4 left-4 z-50 flex flex-col gap-2 items-center"
        style={{ opacity: uiOpacity, transition: uiTransition }}
      >
        <button onClick={() => { setAutoSize(false); setFontSize((p) => Math.min(p + 10, 800)); }} className="text-white/30 hover:text-white/70 transition-colors p-1" title="Increase size">
          <Plus size={20} />
        </button>
        <span className="text-white/20 text-[10px] font-mono text-center">{Math.round(fontSize * 0.6)}px</span>
        <button onClick={() => { setAutoSize(false); setFontSize((p) => Math.max(p - 10, 30)); }} className="text-white/30 hover:text-white/70 transition-colors p-1" title="Decrease size">
          <Minus size={20} />
        </button>
        <button
          onClick={() => setAutoSize((p) => !p)}
          className={`text-[10px] font-mono px-1.5 py-0.5 border transition-colors ${autoSize ? 'border-white/30 text-white/50' : 'border-white/10 text-white/20'}`}
          title="Toggle auto-fit (A)"
        >
          {autoSize ? "AUTO" : "FIXED"}
        </button>
      </div>

      {/* Top toolbar icons */}
      <div
        className="absolute top-4 right-4 z-50 flex items-center gap-3"
        style={{ opacity: uiOpacity, transition: uiTransition }}
      >
        {/* Save preset */}
        <button
          onClick={(e) => { e.stopPropagation(); setSavingPreset(true); setPresetNameInput(displayName); }}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Save preset"
        >
          <Save size={22} />
        </button>
        {/* Load preset */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowPresetPicker((p) => !p); }}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Load preset"
        >
          <FolderOpen size={22} />
        </button>
        {/* Color picker */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowColorPicker((p) => !p); }}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Change color (K)"
        >
          <Palette size={22} />
        </button>
        {/* Timezone */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowTzPicker((p) => !p); }}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Change timezone"
        >
          <Globe size={22} />
        </button>
        {/* Font */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowFontPicker((p) => !p); }}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Change font (F)"
        >
          <Type size={22} />
        </button>
        {/* Display style toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setDisplayStyle(p => p === "digital" ? "analog" : "digital"); }}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Toggle analog/digital display"
        >
          <Circle size={22} />
        </button>
        {/* Help */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowHelp((p) => !p); }}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          {showHelp ? <X size={22} /> : <Info size={22} />}
        </button>
      </div>

      {/* Save preset dialog */}
      <AnimatePresence>
        {savingPreset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center"
            onClick={() => { setSavingPreset(false); setPresetNameInput(""); }}
          >
            <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-4">
              <p className="text-white/50 text-sm uppercase tracking-widest font-mono">Save Preset</p>
              <input
                ref={presetNameRef}
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && presetNameInput.trim()) handleSavePreset(presetNameInput.trim());
                  if (e.key === "Escape") { setSavingPreset(false); setPresetNameInput(""); }
                }}
                placeholder="Preset name..."
                className="bg-transparent border-b-2 outline-none text-center font-mono text-2xl uppercase tracking-widest px-4 py-2 w-80"
                style={{ color: clockColor, borderColor: `${clockColor}80` }}
              />
              <p className="text-white/30 text-xs font-mono">Press Enter to save · Escape to cancel</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset picker panel */}
      <AnimatePresence>
        {showPresetPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-4 z-50 bg-black/95 border border-white/10 p-3 flex flex-col gap-1 min-w-[200px] max-h-80 overflow-y-auto"
          >
            {presetList.length === 0 ? (
              <p className="text-white/30 text-xs font-mono px-3 py-2">No presets saved yet</p>
            ) : (
              presetList.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1">
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    className="flex-1 px-3 py-2 text-left text-xs font-mono text-white/40 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-white/20 shrink-0"
                      style={{ backgroundColor: preset.clockColor }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="text-white/20 hover:text-red-400 transition-colors p-1 shrink-0"
                    title="Delete preset"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color picker panel */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-4 z-50 bg-black/95 border border-white/10 p-3 flex flex-col gap-1"
          >
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                onClick={() => { setClockColor(color.value); setShowColorPicker(false); }}
                className={`px-3 py-2 text-left text-xs font-mono transition-colors flex items-center gap-2 ${clockColor === color.value ? "bg-white/5" : "hover:bg-white/5"}`}
              >
                <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: color.value }} />
                <span style={{ color: clockColor === color.value ? color.value : "rgba(255,255,255,0.4)" }}>{color.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timezone picker panel */}
      <AnimatePresence>
        {showTzPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-4 z-50 bg-black/95 border border-white/10 p-3 flex flex-col gap-1 max-h-80 overflow-y-auto"
          >
            {COMMON_TIMEZONES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTimezone(t.value); setShowTzPicker(false); }}
                className="px-3 py-2 text-left text-xs font-mono transition-colors whitespace-nowrap"
                style={{
                  color: timezone === t.value ? clockColor : "rgba(255,255,255,0.4)",
                  backgroundColor: timezone === t.value ? "rgba(255,255,255,0.05)" : undefined,
                }}
              >
                {t.label}
                <span className="ml-2 opacity-40">{t.value === "local" ? "" : t.value}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font picker panel */}
      <AnimatePresence>
        {showFontPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-4 z-50 bg-black/95 border border-white/10 p-3 flex flex-col gap-1"
          >
            {CLOCK_FONTS.map((font) => (
              <button
                key={font.name}
                onClick={() => { setSelectedFont(font); setShowFontPicker(false); }}
                className="px-3 py-2 text-left text-sm transition-colors"
                style={{
                  fontFamily: font.css, fontWeight: font.weight,
                  color: selectedFont.name === font.name ? clockColor : "rgba(255,255,255,0.4)",
                  backgroundColor: selectedFont.name === font.name ? "rgba(255,255,255,0.05)" : undefined,
                }}
              >
                {font.label}
                <span className="ml-3 opacity-60">12:34</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode indicator */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50"
        style={{ opacity: uiOpacity, transition: uiTransition }}
      >
        {(["clock", "countup", "countdown"] as ClockMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              if (m === "countup" || m === "countdown") { resetTimer(true); }
            }}
            className="px-3 py-1 text-xs uppercase tracking-widest font-mono transition-colors border"
            style={{
              color: mode === m ? activeColor : "rgba(255,255,255,0.2)",
              borderColor: mode === m ? `${activeColor}80` : "rgba(255,255,255,0.1)",
            }}
          >
            {m === "countup" ? "Count Up" : m === "countdown" ? "Countdown" : "Clock"}
          </button>
        ))}
      </div>

      {/* Mini clock */}
      {showMiniClock && mode !== "clock" && (
        <div
          className="absolute top-14 left-1/2 -translate-x-1/2 font-mono text-lg tracking-wider"
          style={{ color: `${clockColor}66`, opacity: uiOpacity, transition: uiTransition }}
        >
          {formatTime(currentSeconds, is24h, true).text}
        </div>
      )}

      {/* Time entry overlay */}
      <AnimatePresence>
        {enteringTime && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 z-40 flex flex-col items-center justify-center">
            <p className="text-white/50 text-sm uppercase tracking-widest mb-4 font-mono">
              {enterMode === "countdown" ? "Enter countdown (hh:mm:ss)" : "Enter target time (hh:mm:ss)"}
            </p>
            <div className="font-mono text-6xl md:text-8xl tracking-wider" style={{ color: clockColor }}>
              {timeInput || "—:——:——"}
            </div>
            <p className="text-white/30 text-xs mt-4 font-mono">Press Enter to confirm · Escape to cancel</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clock name display */}
      <div
        className="absolute"
        style={{ top: "calc(50% - " + (fontSize * 0.6 * 0.55 + 30) + "px)", opacity: uiOpacity, transition: uiTransition }}
      >
        {editingName ? (
          <input
            ref={nameInputRef}
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
            placeholder={defaultName}
            className="bg-transparent border-b border-white/20 outline-none text-center font-mono text-sm uppercase tracking-widest px-2 py-1"
            style={{ color: `${clockColor}99` }}
          />
        ) : (
          <span
            onClick={() => setEditingName(true)}
            className="cursor-pointer font-mono text-sm uppercase tracking-widest hover:opacity-80 transition-opacity"
            style={{ color: `${clockColor}66` }}
            title="Click to rename (N)"
          >
            {displayName}
          </span>
        )}
      </div>

      {/* Main clock display */}
      <motion.div key={`${mode}-${displayStyle}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex items-center justify-center w-full px-4">
        {displayStyle === "analog" ? (
          <AnalogClock
            hours={tz.hours}
            minutes={tz.minutes}
            seconds={tz.seconds}
            color={activeColor}
            digitalTime={displayTime.text}
            ampm={mode === "clock" && !is24h ? (tz.hours >= 12 ? "PM" : "AM") : undefined}
            size={Math.min(fontSize * 2, 600)}
            fontFamily={selectedFont.css}
            fontWeight={selectedFont.weight}
          />
        ) : (
          <div
            ref={clockRef}
            className={`tracking-wider transition-colors duration-300 whitespace-nowrap ${isOvertimeFlashing ? "animate-slow-flash" : ""}`}
            style={{ fontSize: `${fontSize * 0.6}px`, fontFamily: selectedFont.css, fontWeight: selectedFont.weight, lineHeight: 1.1, color: activeColor }}
          >
            {mode !== "clock" && displayTime.negative && <span style={{ color: "#dc2626" }}>{isOvertime ? "+" : (sign === "+" ? "−" : "+")}</span>}
            {mode !== "clock" && !displayTime.negative && <span className="opacity-30">{sign === "+" ? "+" : "−"}</span>}
            {displayTime.text}
          </div>
        )}
      </motion.div>

      {/* AM/PM indicator for 12h mode */}
      {displayStyle === "digital" && mode === "clock" && !is24h && (
        <div
          className="font-mono text-lg tracking-widest mt-2"
          style={{ color: `${clockColor}80` }}
        >
          {tz.hours >= 12 ? "PM" : "AM"}
        </div>
      )}

      {/* Countdown presets */}
      {mode === "countdown" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 flex flex-col items-center gap-2"
          style={{ opacity: uiOpacity, transition: uiTransition }}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {countdownPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => { setCountdownFrom(p.seconds); resetTimer(true); }}
                className="px-3 py-1.5 text-xs font-mono text-white/30 border border-white/10 transition-colors uppercase"
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = clockColor; (e.target as HTMLElement).style.borderColor = `${clockColor}80`; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAllowOverrun(p => !p)}
              className="px-3 py-1 text-[10px] font-mono border transition-colors uppercase"
              style={{
                color: allowOverrun ? clockColor : "rgba(255,255,255,0.3)",
                borderColor: allowOverrun ? `${clockColor}60` : "rgba(255,255,255,0.1)",
              }}
            >
              {allowOverrun ? "Overrun: ON" : "Overrun: OFF"}
            </button>
            {allowOverrun && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-white/30">Warning:</span>
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setOvertimeWarningColor(c.value)}
                    className="w-3.5 h-3.5 rounded-full border transition-transform"
                    style={{
                      backgroundColor: c.value,
                      borderColor: overtimeWarningColor === c.value ? "white" : "transparent",
                      transform: overtimeWarningColor === c.value ? "scale(1.3)" : "scale(1)",
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Pause/Play for timers */}
      {(mode === "countup" || mode === "countdown" || mode === "countto") && (
        <div
          className="absolute bottom-8 flex gap-4"
          style={{ opacity: uiOpacity, transition: uiTransition }}
        >
          <button
            onClick={togglePause}
            className="px-4 py-1.5 text-xs font-mono text-white/30 border border-white/10 transition-colors uppercase"
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = clockColor; (e.target as HTMLElement).style.borderColor = `${clockColor}80`; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={() => resetTimer(true)}
            className="px-4 py-1.5 text-xs font-mono text-white/30 border border-white/10 transition-colors uppercase"
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = clockColor; (e.target as HTMLElement).style.borderColor = `${clockColor}80`; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Help panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-80 bg-black/95 border-l border-white/10 p-6 overflow-y-auto z-50"
          >
            <h3 className="font-mono text-sm uppercase tracking-widest mb-6" style={{ color: clockColor }}>Keyboard Shortcuts</h3>
            <div className="space-y-3 text-xs font-mono text-white/50">
              {[
                ["C", "Show real-time clock"],
                ["S", "Start count-up timer"],
                ["D", "Enter countdown time (hh:mm:ss)"],
                ["M", "Enter target time of day"],
                ["R", "Restart timer"],
                ["P / Space", "Pause / Resume"],
                ["T", "Toggle tenths"],
                ["H", "Toggle 12/24 hour"],
                ["Q", "Toggle mini-clock"],
                ["Z", "Toggle leading zeroes"],
                ["I", "Change +/- sign"],
                ["N", "Edit clock name"],
                ["K", "Cycle display color"],
                ["0-9", "Quick countdown (minutes)"],
                ["⇧ 0-9", "Quick countdown (×5 min)"],
                ["⌃ 0-9", "Quick countdown (×30 min)"],
                ["⇧⌃ 0-9", "Quick countdown (hours)"],
                ["-/=", "Adjust ±5 seconds"],
                ["⇧ -/=", "Adjust ±30 seconds"],
                ["⌃ -/=", "Adjust ±60 seconds"],
                ["F", "Toggle font picker"],
                ["A", "Toggle auto-fit size"],
                ["L", "Toggle logo"],
                ["↑/↓", "Adjust font size (manual)"],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="shrink-0" style={{ color: `${clockColor}B3` }}>{key}</span>
                  <span className="text-right">{desc}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-white/30">
              <p>⇧ = Shift · ⌃ = Ctrl</p>
              <p className="mt-2">Digit 0 is treated as 10</p>
              <p className="mt-2">UI auto-hides after 3s of inactivity</p>
              <p className="mt-2">Settings are saved automatically</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disbrow Productions logo */}
      {logoVisible && <div className="absolute bottom-3 right-4 z-50 flex flex-col items-end">
        <span className="font-display text-[11px] font-bold tracking-[0.25em] text-white/20">
          DISBROW
        </span>
        <span className="font-display text-[7px] tracking-[0.35em] text-white/15 -mt-0.5">
          PRODUCTIONS
        </span>
      </div>}
    </div>
  );
};

export default Clock;
