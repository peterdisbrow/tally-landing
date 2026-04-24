import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Monitor, Settings, Maximize, Minimize } from "lucide-react";
import ClockCell, { type ClockCellConfig } from "@/components/clock/ClockCell";
import AuthPanel from "@/components/clock/AuthPanel";
import LoginForm from "@/components/clock/LoginForm";
import { useTallyConnect } from "@/hooks/useTallyConnect";

const MULTI_CLOCK_KEY = "broadcast-multi-clocks";
const MULTI_LAYOUT_KEY = "broadcast-multi-layout";
const MULTI_SCALE_KEY = "broadcast-multi-scale";

type LayoutMode = "2x2" | "2x3" | "3x2" | "3x3" | "featured";

const LAYOUTS: { mode: LayoutMode; label: string; max: number; cols: string; rows: string }[] = [
  { mode: "2x2", label: "2×2 Grid", max: 4, cols: "grid-cols-2", rows: "grid-rows-2" },
  { mode: "2x3", label: "2×3 Grid", max: 6, cols: "grid-cols-2", rows: "grid-rows-3" },
  { mode: "3x2", label: "3×2 Grid", max: 6, cols: "grid-cols-3", rows: "grid-rows-2" },
  { mode: "3x3", label: "3×3 Grid", max: 9, cols: "grid-cols-3", rows: "grid-rows-3" },
  { mode: "featured", label: "Featured", max: 5, cols: "grid-cols-2", rows: "grid-rows-2" },
];

const defaultClocks: ClockCellConfig[] = [
  { id: "1", clockName: "New York", clockColor: "#ef4444", fontName: "dseg7", timezone: "America/New_York", is24h: false },
  { id: "2", clockName: "London", clockColor: "#22c55e", fontName: "dseg7", timezone: "Europe/London", is24h: true },
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
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [clocks]);

  useEffect(() => {
    localStorage.setItem(MULTI_LAYOUT_KEY, layout);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem(MULTI_SCALE_KEY, String(Math.round(globalScale * 100)));
  }, [globalScale]);

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

  const tallyProps = {
    isTallyConnected,
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
          <a
            href="/"
            className="text-white/30 hover:text-white/70 transition-colors text-[10px] font-mono uppercase tracking-wider text-center"
          >
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden select-none">
      {/* Toolbar */}
      <div
        className="absolute top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 pointer-events-none"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link to="/clock" className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-2">
            <Monitor size={18} />
            <span className="text-xs font-mono uppercase tracking-widest">Single</span>
          </Link>
          <a href="/" className="text-white/30 hover:text-white/70 transition-colors">
            <ArrowLeft size={20} />
          </a>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <AuthPanel />

          {/* Layout picker */}
          {LAYOUTS.map(l => (
            <button
              key={l.mode}
              onClick={() => setLayout(l.mode)}
              className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors"
              style={{
                color: layout === l.mode ? "#ef4444" : "rgba(255,255,255,0.25)",
                borderColor: layout === l.mode ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
              }}
            >
              {l.label}
            </button>
          ))}

          {/* Add clock */}
          {clocks.length < currentLayout.max && (
            <button
              onClick={handleAdd}
              className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              <Plus size={18} />
              <span className="text-[10px] font-mono uppercase tracking-wider">Add</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="text-white/30 hover:text-white/70 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          {/* Global settings gear */}
          <button
            onClick={() => setShowGlobalSettings(p => !p)}
            className="text-white/30 hover:text-white/70 transition-colors"
            title="Global settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Global settings panel */}
      <AnimatePresence>
        {showGlobalSettings && (
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

      {/* Clock grid — standard layouts */}
      {layout !== "featured" && (
        <div className={`flex-1 grid ${currentLayout.cols} gap-1 p-1 pt-12`}>
          {clocks.slice(0, currentLayout.max).map((clock, index) => (
            <ClockCell
              key={clock.id}
              config={clock}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              globalScale={globalScale}
              isDragging={dragIndex === index}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              {...tallyProps}
            />
          ))}

          {/* Empty slots */}
          {clocks.length < currentLayout.max && Array.from({ length: currentLayout.max - clocks.length }).map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={handleAdd}
              className="border border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/10 hover:text-white/30 hover:border-white/20 transition-colors"
            >
              <Plus size={32} />
            </button>
          ))}
        </div>
      )}

      {/* Featured + Grid layout */}
      {layout === "featured" && (
        <div className="flex-1 flex flex-col gap-1 p-1 pt-12 overflow-hidden">
          {/* Top 1/3 — featured clock (full width) */}
          <div className="h-1/3 relative">
            {clocks.length > 0 ? (
              <div className="relative h-full">
                <ClockCell
                  key={clocks[0].id}
                  config={clocks[0]}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  globalScale={globalScale}
                  isDragging={dragIndex === 0}
                  onDragStart={() => setDragIndex(0)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(0)}
                  {...tallyProps}
                />
                {/* Featured badge */}
                <span
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.3em] pointer-events-none z-10 transition-opacity duration-500"
                  style={{ color: "rgba(255,255,255,0.15)", opacity: hovered ? 1 : 0 }}
                >
                  Featured
                </span>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="w-full h-full border border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/10 hover:text-white/30 hover:border-white/20 transition-colors"
              >
                <Plus size={32} />
              </button>
            )}
          </div>

          {/* Bottom 2/3 — grid of remaining clocks */}
          <div className="flex-1 grid grid-cols-2 gap-1">
            {clocks.slice(1, currentLayout.max).map((clock, i) => {
              const index = i + 1; // actual array index
              return (
                <div
                  key={clock.id}
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    const t = e.target as HTMLElement;
                    if (t.closest("button") || t.closest("input") || t.closest("select")) return;
                    promoteToFeatured(index);
                  }}
                  title="Click to feature"
                >
                  <ClockCell
                    config={clock}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                    globalScale={globalScale}
                    isDragging={dragIndex === index}
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    {...tallyProps}
                  />
                  {/* Subtle hint on hover */}
                  {hovered && (
                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 pointer-events-none z-10 bg-black/60 px-2 py-0.5 rounded"
                    >
                      ★ Click to Feature
                    </span>
                  )}
                </div>
              );
            })}

            {/* Empty slots */}
            {clocks.slice(1).length < currentLayout.max - 1 && Array.from({ length: currentLayout.max - 1 - clocks.slice(1).length }).map((_, i) => (
              <button
                key={`empty-grid-${i}`}
                onClick={handleAdd}
                className="border border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/10 hover:text-white/30 hover:border-white/20 transition-colors"
              >
                <Plus size={32} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disbrow Productions logo */}
      <div
        className="absolute bottom-3 right-4 z-50 flex flex-col items-end transition-opacity duration-500"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <span className="font-display text-[11px] font-bold tracking-[0.25em] text-white/20">
          TALLYCONNECT
        </span>
        <span className="font-display text-[7px] tracking-[0.35em] text-white/15 -mt-0.5">
          MULTI-CLOCK
        </span>
      </div>
    </div>
  );
};

export default MultiClock;
