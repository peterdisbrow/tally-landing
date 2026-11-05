import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, Monitor, Settings, Maximize, Minimize, Menu, Check, GripHorizontal, Smartphone } from "lucide-react";
import ClockCell, { type ClockCellConfig } from "@/components/clock/ClockCell";
import AuthPanel from "@/components/clock/AuthPanel";
import LoginForm from "@/components/clock/LoginForm";
import { useTallyConnect } from "@/hooks/useTallyConnect";
import RemoteDialog from "@/components/clock/glass/RemoteDialog";
import { useRemoteDisplay } from "@/lib/remote/useRemote";
import type { RemoteCmd } from "@/lib/remote/protocol";
import GlassSetupSheet, { type ModeOption, type PreviewClock, type SetupConfig } from "@/components/clock/glass/GlassSetupSheet";
import { Segmented, Toggle, Field } from "@/components/clock/glass/GlassControls";
import { formatHMS } from "@/lib/timerAdjust";
import { targetToday } from "@/lib/countTo";

const GLASS = () => typeof document !== "undefined" && !!document.documentElement.dataset.look;
const MODE_LABEL: Record<string, string> = { clock: "Clock", countup: "Count Up", countdown: "Countdown", countto: "Count To", rundown: "Rundown Timer", timecode: "Timecode · TC-1", propresenter: "ProPresenter", lastcue: "Last Cue", hyperdeck: "HyperDeck", streamtime: "Stream Time", recordtime: "Recording", atemrecord: "ATEM Rec", atemtimecode: "ATEM Timecode", service: "Service" };
const previewText = (c: ClockCellConfig, now: Date) => {
  const m = c.mode || "clock";
  if (m === "clock") { const t = c.timezone === "local" ? now : new Date(now.toLocaleString("en-US", { timeZone: c.timezone })); let h = t.getHours(); if (!c.is24h) h = h % 12 || 12; return `${String(h).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}${c.showSeconds === false ? "" : ":" + String(t.getSeconds()).padStart(2, "0")}`; }
  if (m === "countdown") return formatHMS((c.countdownFrom ?? 300) + (c.timeAdjust || 0)).replace(/^00:/, "");
  if (m === "countup") return formatHMS((c.countupStart ?? 0) + (c.timeAdjust || 0)).replace(/^00:/, "");
  if (m === "countto") { const t = c.countToTime ? targetToday(c.countToTime, now) : c.countToTarget; if (!t) return "--:--"; const d = (t - now.getTime()) / 1000; return d < 0 ? "+" + formatHMS(-d) : formatHMS(d); }
  if (m === "timecode") return "00:00:00:00";
  return "LIVE";
};

const MULTI_CLOCK_KEY = "broadcast-multi-clocks";
const MULTI_LAYOUT_KEY = "broadcast-multi-layout";
const MULTI_SCALE_KEY = "broadcast-multi-scale";
const FEATURED_HEIGHT_KEY = "broadcast-multi-featured-height";

type LayoutMode = "2x2" | "2x3" | "3x2" | "3x3" | "featured";

const LAYOUTS: { mode: LayoutMode; label: string; max: number; cols: string; rows: string }[] = [
  { mode: "2x2", label: "2×2 Grid", max: 4, cols: "grid-cols-2", rows: "grid-rows-2" },
  { mode: "2x3", label: "2×3 Grid", max: 6, cols: "grid-cols-2", rows: "grid-rows-3" },
  { mode: "3x2", label: "3×2 Grid", max: 6, cols: "grid-cols-3", rows: "grid-rows-2" },
  { mode: "3x3", label: "3×3 Grid", max: 9, cols: "grid-cols-3", rows: "grid-rows-3" },
  { mode: "featured", label: "Featured", max: 5, cols: "grid-cols-2", rows: "grid-rows-2" },
];

const defaultClocks: ClockCellConfig[] = [
  { id: "1", clockName: "New York", clockColor: "#ef4444", fontName: "dseg7", timezone: "America/New_York", is24h: false, showSeconds: true },
  { id: "2", clockName: "London", clockColor: "#22c55e", fontName: "dseg7", timezone: "Europe/London", is24h: true, showSeconds: true },
];

const loadClocks = (): ClockCellConfig[] => {
  try {
    const raw = localStorage.getItem(MULTI_CLOCK_KEY);
    return raw ? JSON.parse(raw) : defaultClocks;
  } catch { return defaultClocks; }
};

const loadLayout = (): LayoutMode => {
  try {
    const raw = localStorage.getItem(MULTI_LAYOUT_KEY) as LayoutMode | null;
    if (raw && LAYOUTS.some(l => l.mode === raw)) return raw;
    return "2x2";
  } catch { return "2x2"; }
};

const loadScale = (): number => {
  try {
    const raw = localStorage.getItem(MULTI_SCALE_KEY);
    const n = raw ? parseInt(raw) : 100;
    if (isNaN(n)) return 1;
    return Math.max(50, Math.min(200, n)) / 100;
  } catch { return 1; }
};

const loadFeaturedHeight = (): number => {
  try {
    const raw = localStorage.getItem(FEATURED_HEIGHT_KEY);
    const n = raw ? parseFloat(raw) : 40;
    if (isNaN(n)) return 40;
    return Math.max(20, Math.min(80, n));
  } catch { return 40; }
};

const MultiClock = () => {
  const {
    isAuthenticated,
    isConnected: isTallyConnected,
    status,
    streamStartedAt,
    recordingStartedAt,
    atemRecordingStartedAt,
    lastCueAt,
    atemTimecode,
  } = useTallyConnect();
  const [clocks, setClocks] = useState<ClockCellConfig[]>(() => loadClocks());
  const [layout, setLayout] = useState<LayoutMode>(() => loadLayout());
  const [globalScale, setGlobalScale] = useState<number>(() => loadScale());
  const [featuredHeight, setFeaturedHeight] = useState<number>(() => loadFeaturedHeight());
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const glass = GLASS();
  const initialSetup = new URLSearchParams(location.search);
  const [sheetOpen, setSheetOpen] = useState(glass && initialSetup.has("setup"));
  const [sheetSel, setSheetSel] = useState<string | undefined>(initialSetup.get("sel") || undefined);
  const [savedAt, setSavedAt] = useState(Date.now());
  const [slotTc, setSlotTc] = useState<HTMLDivElement | null>(null);
  const [slotRundown, setSlotRundown] = useState<HTMLDivElement | null>(null);
  const [previewNow, setPreviewNow] = useState(new Date());
  useEffect(() => { if (!sheetOpen) return; const id = setInterval(() => setPreviewNow(new Date()), 1000); return () => clearInterval(id); }, [sheetOpen]);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featuredContainerRef = useRef<HTMLDivElement>(null);

  const currentLayout = LAYOUTS.find(l => l.mode === layout) || LAYOUTS[0];

  useEffect(() => {
    document.title = "TallyConnect Multi-Clock";
    return () => { document.title = "TallyConnect Production Clock"; };
  }, []);

  useEffect(() => {
    const show = () => {
      setHovered(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setHovered(false), 2500);
    };
    show();
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    window.addEventListener("keydown", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
      window.removeEventListener("keydown", show);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(MULTI_CLOCK_KEY, JSON.stringify(clocks));
    setSavedAt(Date.now());
  }, [clocks]);

  useEffect(() => {
    localStorage.setItem(MULTI_LAYOUT_KEY, layout);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem(MULTI_SCALE_KEY, String(Math.round(globalScale * 100)));
  }, [globalScale]);

  useEffect(() => {
    localStorage.setItem(FEATURED_HEIGHT_KEY, String(featuredHeight));
  }, [featuredHeight]);

  const handleFeaturedDividerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const container = featuredContainerRef.current;
    if (!container) return;
    const update = (clientY: number) => {
      const rect = container.getBoundingClientRect();
      if (rect.height <= 0) return;
      const pct = ((clientY - rect.top) / rect.height) * 100;
      setFeaturedHeight(Math.max(20, Math.min(80, pct)));
    };
    const onMouseMove = (ev: MouseEvent) => update(ev.clientY);
    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length > 0) {
        ev.preventDefault();
        update(ev.touches[0].clientY);
      }
    };
    const cleanup = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", cleanup);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", cleanup);
      window.removeEventListener("touchcancel", cleanup);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", cleanup);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", cleanup);
    window.addEventListener("touchcancel", cleanup);
  }, []);

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    sync();
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleUpdate = useCallback((updated: ClockCellConfig) => {
    setClocks(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setClocks(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    if (clocks.length >= currentLayout.max) return;
    const newClock: ClockCellConfig = {
      id: Date.now().toString(),
      clockName: "",
      clockColor: ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b"][clocks.length % 4],
      fontName: "dseg7",
      timezone: "local",
      is24h: false,
      showSeconds: true,
    };
    setClocks(prev => [...prev, newClock]);
  }, [clocks.length, currentLayout.max]);

  const handleDrop = useCallback((dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    setClocks(prev => {
      const updated = [...prev];
      const [dragged] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, dragged);
      return updated;
    });
    setDragIndex(null);
  }, [dragIndex]);

  const promoteToFeatured = useCallback((index: number) => {
    if (index <= 0) return;
    setClocks(prev => {
      const updated = [...prev];
      const [featured] = updated.splice(index, 1);
      updated.unshift(featured);
      return updated;
    });
  }, []);

  // Phone remote: each clock is addressable by id; the cells report what they show into a ref.
  const [showRemote, setShowRemote] = useState(() => new URLSearchParams(location.search).has("remote"));
  const [remoteCmds, setRemoteCmds] = useState<Record<string, { n: number; cmd: RemoteCmd }>>({});
  const remoteShown = useRef<Record<string, { text: string; paused: boolean }>>({});
  const reportRemote = useCallback((id: string, st: { text: string; paused: boolean }) => { remoteShown.current[id] = st; }, []);
  const clocksRef = useRef(clocks); clocksRef.current = clocks;
  const maxRef = useRef(currentLayout.max); maxRef.current = currentLayout.max;
  const remote = useRemoteDisplay("multi", () => ({ variant: "multi", clocks: clocksRef.current.slice(0, maxRef.current).map((c) => {
    const m = c.mode || "clock"; const sh = remoteShown.current[c.id];
    return { id: c.id, name: c.clockName || MODE_LABEL[m] || "Clock", mode: m, color: c.clockColor, text: sh?.text ?? "", paused: sh?.paused ?? true, canTime: ["clock", "countup", "countdown", "countto"].includes(m) };
  }) }), (cmd, clockId) => {
    const target = clocksRef.current.find((c) => c.id === clockId) || clocksRef.current[0];
    if (target) setRemoteCmds((prev) => ({ ...prev, [target.id]: { n: (prev[target.id]?.n ?? 0) + 1, cmd } }));
  });

  const tallyProps = {
    isTallyConnected,
    isTallySignedIn: isAuthenticated,
    proPresenter: status.proPresenter,
    hyperdecks: status.hyperdecks,
    atem: status.atem,
    streamStartedAt,
    recordingStartedAt,
    atemRecordingStartedAt,
    lastCueAt,
    atemTimecode,
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-white/80 text-lg font-mono uppercase tracking-widest">
              TallyConnect Multi-Clock
            </h1>
            <p className="text-white/40 text-xs font-mono mt-2">
              Sign in to access the multi-clock view
            </p>
          </div>
          <LoginForm title="Sign In" />
          <Link
            to="/clock"
            className="text-white/30 hover:text-white/70 transition-colors text-[10px] font-mono uppercase tracking-wider text-center"
          >
            ← Back to clock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden select-none">
      {/* Toolbar */}
      <div
        className="absolute top-0 left-0 right-0 z-[60] flex items-center justify-between gap-2 px-3 md:px-4 py-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 pointer-events-none"
        style={{ opacity: hovered || sheetOpen ? 1 : 0, right: glass && sheetOpen ? 460 : undefined }}
      >
        <div className="flex items-center gap-4 pointer-events-auto shrink-0">
          <Link to="/clock" data-glass-btn="" className="flex items-center gap-2 !py-2 !px-3 2xl:!px-4" aria-label="Single clock" title="Single clock">
            <Monitor size={15} />
            <span className="hidden 2xl:inline">Single clock</span>
          </Link>
          {/* Disbrow Productions logo: lives in the toolbar so it can never sit on top of a cell */}
          <div className="hidden 2xl:flex flex-col items-start gap-1">
            <span className="font-display text-[11px] font-bold tracking-[0.25em] text-white/20">TALLYCONNECT</span>
            <span className="font-display text-[7px] tracking-[0.35em] text-white/15">MULTI-CLOCK</span>
          </div>
        </div>

        {/* On phones the labels collapse to icons and the row may wrap, so every button stays on screen. */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-end gap-2 md:gap-3 min-w-0 pointer-events-auto">
          <AuthPanel />

          {/* Layout picker — desktop: Glass segmented pills */}
          <div className="hidden md:flex items-center gap-1" data-glass-toolbar="" aria-label="Layout">
            {LAYOUTS.map(l => (
              <button key={l.mode} onClick={() => setLayout(l.mode)} data-glass-pill="" data-on={layout === l.mode ? "" : undefined}
                aria-pressed={layout === l.mode} data-testid={`layout-${l.mode}`}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Layout picker — mobile: burger menu */}
          <div className="md:hidden relative">
            <button
              onClick={() => setShowLayoutMenu(p => !p)}
              className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
              title="Layout"
              aria-label="Select layout"
              aria-expanded={showLayoutMenu}
            >
              <Menu size={20} />
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#4ade80" }}>
                {currentLayout.label}
              </span>
            </button>

            {showLayoutMenu && (
              <>
                {/* Click-outside backdrop */}
                <div
                  className="fixed inset-0 z-[65]"
                  onClick={() => setShowLayoutMenu(false)}
                />
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 z-[70] bg-black/95 border border-white/10 rounded min-w-[160px] flex flex-col py-1 shadow-lg">
                  {LAYOUTS.map(l => {
                    const active = layout === l.mode;
                    return (
                      <button
                        key={l.mode}
                        onClick={() => { setLayout(l.mode); setShowLayoutMenu(false); }}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider hover:bg-white/5 transition-colors text-left"
                        style={{ color: active ? "#4ade80" : "rgba(255,255,255,0.6)" }}
                      >
                        <span>{l.label}</span>
                        {active && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Add clock */}
          {clocks.length < currentLayout.max && (
            <button
              onClick={handleAdd} data-glass-btn="" className="flex items-center gap-1.5 !py-2 !px-3 2xl:!px-4" aria-label="Add clock" title="Add clock"
            >
              <Plus size={15} />
              <span className="hidden 2xl:inline">Add clock</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen} data-glass-icon="" aria-label="Full screen"
            title={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button onClick={() => setShowRemote(true)} data-glass-icon="" data-active={remote.pairing && remote.peers.remotes > 0 ? "" : undefined}
            title="Control from phone" aria-label="Control from phone" data-testid="open-remote"><Smartphone size={18} /></button>

          {/* Global settings gear */}
          <button
            onClick={() => (glass ? setSheetOpen(p => !p) : setShowGlobalSettings(p => !p))}
            data-glass-icon="" data-active={sheetOpen ? "" : undefined} data-testid="open-glass-setup"
            title="Clock setup" aria-label="Clock setup"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {glass && sheetOpen && (() => {
        const sel = clocks.find((c) => c.id === sheetSel) || clocks[0];
        if (!sel) return null;
        const modes: ModeOption[] = [
          { value: "clock", label: "Clock" }, { value: "countup", label: "Count Up" }, { value: "countdown", label: "Countdown" }, { value: "countto", label: "Count To" },
          { value: "rundown", label: "Rundown", group: "tally", locked: !isAuthenticated }, { value: "timecode", label: "Timecode", group: "tally", locked: !isAuthenticated },
          ...(isTallyConnected ? [
            ...(status.proPresenter?.connected ? [{ value: "propresenter", label: "ProPresenter", group: "live" as const }, { value: "lastcue", label: "Last Cue", group: "live" as const }] : []),
            ...(status.hyperdecks?.some((d) => d.connected) ? [{ value: "hyperdeck", label: "HyperDeck", group: "live" as const }] : []),
            { value: "streamtime", label: "Stream Time", group: "live" as const }, { value: "recordtime", label: "Recording", group: "live" as const },
            ...(status.atem?.connected ? [{ value: "atemrecord", label: "ATEM Rec", group: "live" as const }, { value: "atemtimecode", label: "ATEM TC", group: "live" as const }] : []),
          ] : []),
        ];
        const previews: PreviewClock[] = clocks.slice(0, currentLayout.max).map((c) => ({ id: c.id, name: c.clockName || MODE_LABEL[c.mode || "clock"], color: c.clockColor, modeLabel: MODE_LABEL[c.mode || "clock"] + (c.mode === "clock" || !c.mode ? ` · ${c.timezone === "local" ? "Local" : c.timezone.split("/").pop()?.replace("_", " ")}` : ""), text: previewText(c, previewNow) }));
        return <GlassSetupSheet variant="multi" config={sel as SetupConfig} onChange={(patch) => handleUpdate({ ...sel, ...(patch as Partial<ClockCellConfig>) })}
          onClose={() => setSheetOpen(false)} modes={modes} isTallySignedIn={isAuthenticated} savedAt={savedAt}
          getSnapshot={() => ({ layout, clocks, globalScale })} applySnapshot={(d) => { const x = d as { layout: LayoutMode; clocks: ClockCellConfig[]; globalScale: number }; setLayout(x.layout); setClocks(x.clocks); setGlobalScale(x.globalScale ?? 1); }}
          tcSlotRef={setSlotTc} rundownSlotRef={setSlotRundown}
          previews={previews} selectedId={sel.id} onSelect={setSheetSel}
          onReorder={(from, to) => setClocks((prev) => { const u = [...prev]; const [m] = u.splice(from, 1); u.splice(to, 0, m); return u; })}
          onAdd={handleAdd} canAdd={clocks.length < currentLayout.max}
          initialPresetsOpen={initialSetup.has("presets")} scrollTo={initialSetup.get("section") || undefined}
          display={<>
            <Field label="Layout"><Segmented value={layout} options={LAYOUTS.map((l) => ({ value: l.mode, label: l.label.replace(" Grid", "") }))} onChange={(v) => setLayout(v as LayoutMode)} testid="gs-layout" /></Field>
            <Field label={`All clocks size · ${Math.round(globalScale * 100)}%`} aside={<button onClick={() => setGlobalScale(1)} className="text-[11px] text-white/40 hover:text-white/80">Reset</button>}>
              <input type="range" min={50} max={200} step={5} value={Math.round(globalScale * 100)} onChange={(e) => setGlobalScale(parseInt(e.target.value) / 100)} className="gs-range w-full" />
            </Field>
            <Toggle label="Full screen" checked={isFullscreen} onChange={toggleFullscreen} />
          </>} />;
      })()}

      {showRemote && <RemoteDialog variant="multi" remote={remote} onClose={() => setShowRemote(false)} />}

      {/* Global settings panel */}
      <AnimatePresence>
        {!glass && showGlobalSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-12 right-4 z-[70] bg-black/95 border border-white/10 p-4 w-64 flex flex-col gap-3 rounded"
          >
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-mono">Global Settings</p>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Clock Size</p>
                <p className="text-white/70 text-[10px] font-mono">{Math.round(globalScale * 100)}%</p>
              </div>
              <input
                type="range"
                min={50}
                max={200}
                step={5}
                value={Math.round(globalScale * 100)}
                onChange={(e) => setGlobalScale(parseInt(e.target.value) / 100)}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30 mt-0.5">
                <span>50%</span>
                <button
                  onClick={() => setGlobalScale(1)}
                  className="text-white/30 hover:text-white/70 transition-colors uppercase tracking-wider"
                >
                  Reset
                </button>
                <span>200%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One stable keyed parent: presentation changes never remount timers.
          Keep overflow clocks mounted when a smaller layout hides them. */}
      <div ref={featuredContainerRef} className={`flex-1 min-h-0 grid ${currentLayout.cols} ${layout === "featured" ? "" : currentLayout.rows} gap-1 p-1 pt-[60px] overflow-hidden`}
        style={{ paddingRight: glass && sheetOpen ? 460 : undefined, gridTemplateRows: layout === "featured" ? `${featuredHeight}% 32px repeat(2, minmax(0, 1fr))` : undefined }}>
        {clocks.map((clock, index) => (
          <div key={clock.id} data-clock-id={clock.id}
            className="relative min-h-0 min-w-0"
            style={{ display: index >= currentLayout.max ? "none" : undefined,
              gridColumn: layout === "featured" && index === 0 ? "1 / -1" : undefined,
              gridRow: layout === "featured" ? (index === 0 ? 1 : Math.floor((index - 1) / 2) + 3) : undefined }}
            title={layout === "featured" && index > 0 ? "Click to feature" : undefined}
            onClick={(e) => {
              if (layout !== "featured" || index === 0) return;
              if ((e.target as HTMLElement).closest("button, input, select, a")) return;
              promoteToFeatured(index);
            }}>
            <ClockCell config={clock} onUpdate={handleUpdate} onRemove={handleRemove}
              globalScale={globalScale} isDragging={dragIndex === index}
              hint={layout === "featured" && hovered ? (index === 0 ? "Featured" : "★ Click to Feature") : undefined}
              onDragStart={() => setDragIndex(index)} onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(index)} {...tallyProps}
              remoteCommand={remoteCmds[clock.id]} onRemoteState={reportRemote}
              onOpenSettings={glass ? () => { setSheetSel(clock.id); setSheetOpen(true); } : undefined}
              glassSlots={glass && sheetOpen && (clocks.find((c) => c.id === sheetSel) || clocks[0])?.id === clock.id ? { tc: slotTc, rundown: slotRundown } : undefined} />
          </div>
        ))}
        {layout === "featured" && <div key="divider" onMouseDown={handleFeaturedDividerDown} onTouchStart={handleFeaturedDividerDown}
          role="separator" aria-orientation="horizontal" aria-label="Resize featured clock" title="Drag to resize"
          style={{ gridColumn: "1 / -1", gridRow: 2 }}
          className="cursor-ns-resize flex items-center justify-center touch-none select-none">
          <GripHorizontal size={16} className="text-white/40" />
        </div>}
        {Array.from({ length: Math.max(0, currentLayout.max - clocks.length) }).map((_, i) => {
          const index = clocks.length + i;
          return <button key={`empty-${i}`} onClick={handleAdd}
            style={{ gridColumn: layout === "featured" && index === 0 ? "1 / -1" : undefined,
              gridRow: layout === "featured" ? (index === 0 ? 1 : Math.floor((index - 1) / 2) + 3) : undefined }}
            className="border border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/10 hover:text-white/30 hover:border-white/20 transition-colors">
            <Plus size={32} />
          </button>;
        })}
      </div>
    </div>
  );
};

export default MultiClock;
