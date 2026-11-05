/** Mockup: frosted Glass setup side sheet shared by /clock and /multi-clock. Edits apply live (autosave). */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, GripVertical, Lock, Plus, Save, Trash2, X, Bookmark } from "lucide-react";
import { LABEL_SIZES, resolveLabelSize, resolveScaleLabels, DEFAULT_LABEL_SIZE, DEFAULT_SCALE_LABELS, type LabelSize } from "@/lib/labelSize";
import { TimeOfDayEntry } from "./TimeOfDayEntry";
import { targetToday, timeOfDayOf } from "@/lib/countTo";
import { AdjustSteppers, Field, Section, Segmented, Swatches, TimeEntry, Toggle } from "./GlassControls";

export type SetupConfig = {
  clockName: string; clockColor: string; fontName: string; timezone: string; is24h: boolean;
  mode?: string; countdownFrom?: number; countToTarget?: number; countToTime?: string; countupStart?: number; timeAdjust?: number;
  displayStyle?: "digital" | "analog"; thickness?: number; overtimeWarningColor?: string; allowOverrun?: boolean;
  sizeScale?: number; labelSize?: LabelSize; scaleLabels?: boolean; showSeconds?: boolean; tcHighFrameRate?: boolean;
  // single-clock extras
  showTenths?: boolean; showMiniClock?: boolean; hideLeadingZero?: boolean; autoSize?: boolean; fontSize?: number;
};
export type ModeOption = { value: string; label: string; locked?: boolean; group?: "main" | "tally" | "live" };
export type PreviewClock = { id: string; name: string; color: string; modeLabel: string; text: string };
type Preset = { id: string; name: string; data: unknown; savedAt: number };

export const COLORS = [
  { label: "Tally green", value: "#22c55e" }, { label: "Red", value: "#ef4444" }, { label: "Amber", value: "#f59e0b" }, { label: "Blue", value: "#3b82f6" },
  { label: "Cyan", value: "#06b6d4" }, { label: "White", value: "#ffffff" }, { label: "Magenta", value: "#d946ef" },
];
const FONTS = [
  { value: "dseg7", label: "7-Seg" }, { value: "dseg14", label: "14-Seg" }, { value: "dseg7modern", label: "7-Seg Modern" },
  { value: "digital", label: "Digital" }, { value: "mono", label: "Mono" }, { value: "system", label: "System" },
];
const TZ_MAIN = [{ value: "local", label: "Local" }, { value: "UTC", label: "UTC" }, { value: "America/New_York", label: "Eastern" }, { value: "America/Los_Angeles", label: "Pacific" }];
const TZ_MORE = [
  { value: "America/Chicago", label: "Central" }, { value: "America/Denver", label: "Mountain" }, { value: "Europe/London", label: "London" }, { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" }, { value: "Asia/Tokyo", label: "Tokyo" }, { value: "Australia/Sydney", label: "Sydney" }, { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" }, { value: "Asia/Singapore", label: "Singapore" }, { value: "Asia/Kolkata", label: "Mumbai" },
];

export const SECTION_DEFAULTS = {
  mode: { mode: "clock", clockName: "" },
  time: { timezone: "local", is24h: false, showSeconds: true, countdownFrom: 300, countupStart: 0, timeAdjust: 0, allowOverrun: true, overtimeWarningColor: "#f59e0b" },
  look: { clockColor: "#22c55e", fontName: "dseg7", displayStyle: "digital", labelSize: DEFAULT_LABEL_SIZE, scaleLabels: DEFAULT_SCALE_LABELS, sizeScale: 1, thickness: 2, autoSize: true, fontSize: 200, showTenths: false, hideLeadingZero: false },
  timecode: { tcHighFrameRate: false },
} as const;

type Props = {
  variant: "single" | "multi";
  config: SetupConfig;
  onChange: (patch: Partial<SetupConfig>) => void;
  onClose: () => void;
  modes: ModeOption[];
  isTallySignedIn: boolean;
  savedAt: number;
  getSnapshot: () => unknown;
  applySnapshot: (d: unknown) => void;
  tcSlotRef?: (el: HTMLDivElement | null) => void;
  rundownSlotRef?: (el: HTMLDivElement | null) => void;
  previews?: PreviewClock[]; selectedId?: string; onSelect?: (id: string) => void; onReorder?: (from: number, to: number) => void; onAdd?: () => void; canAdd?: boolean;
  display?: ReactNode;
  initialPresetsOpen?: boolean;
  scrollTo?: string;
};

const PRESET_KEY = (v: string) => `clock-glass-presets-${v}`;
const MIGRATED_KEY = "clock-glass-presets-migrated-v1";
/** One-time import of the old /clock presets (localStorage `broadcast-clock-presets`) into the single-clock list. */
export function migrateLegacyPresets(): void {
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return;
    const legacy = JSON.parse(localStorage.getItem("broadcast-clock-presets") || "[]") as { id?: string; name?: string; clockName?: string; clockColor?: string; fontName?: string; timezone?: string; is24h?: boolean; mode?: string }[];
    const cur = JSON.parse(localStorage.getItem(PRESET_KEY("single")) || "[]") as Preset[];
    const have = new Set(cur.map((x) => x.id));
    const add: Preset[] = (Array.isArray(legacy) ? legacy : []).filter((l) => l && typeof l === "object").map((l, i) => ({
      id: `legacy-${l.id ?? i}`, name: String(l.name || l.clockName || `Preset ${i + 1}`), savedAt: Number(l.id) || Date.now(),
      data: { clockName: l.clockName, clockColor: l.clockColor, fontName: l.fontName, timezone: l.timezone, is24h: l.is24h, mode: l.mode },
    })).filter((x) => !have.has(x.id));
    if (add.length) localStorage.setItem(PRESET_KEY("single"), JSON.stringify([...cur, ...add]));
    localStorage.setItem(MIGRATED_KEY, "1");
  } catch { /* corrupt legacy data: leave it alone */ }
}
const loadPresets = (v: string): Preset[] => { if (v === "single") migrateLegacyPresets(); try { return JSON.parse(localStorage.getItem(PRESET_KEY(v)) || "[]"); } catch { return []; } };

export default function GlassSetupSheet(p: Props) {
  const { config: c, onChange } = p;
  const mode = c.mode || "clock";
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets(p.variant));
  const [presetsOpen, setPresetsOpen] = useState(!!p.initialPresetsOpen);
  const [presetName, setPresetName] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [showAllTz, setShowAllTz] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { localStorage.setItem(PRESET_KEY(p.variant), JSON.stringify(presets)); }, [presets, p.variant]);
  useEffect(() => { if (p.scrollTo) document.getElementById(`gs-${p.scrollTo}`)?.scrollIntoView({ block: "start" }); }, [p.scrollTo, p.selectedId]);
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 5000); return () => clearInterval(id); }, []);
  const savedAgo = Math.max(0, Math.round((Date.now() - p.savedAt) / 1000));

  const savePreset = () => {
    const name = presetName.trim() || `Setup ${presets.length + 1}`;
    const np = { id: String(Date.now()), name, data: p.getSnapshot(), savedAt: Date.now() };
    setPresets((l) => [...l, np]); setPresetName(""); setActivePreset(np.id);
  };
  const reset = (k: keyof typeof SECTION_DEFAULTS) => onChange({ ...(SECTION_DEFAULTS[k] as Partial<SetupConfig>) });

  const mainModes = p.modes.filter((m) => (m.group || "main") === "main");
  const otherModes = p.modes.filter((m) => m.group && m.group !== "main");
  const isTimer = mode === "countdown" || mode === "countup" || mode === "countto";
  const lockedTc = !p.isTallySignedIn;

  return (
    <aside data-glass-sheet="" data-testid="glass-setup-sheet" onClick={(e) => e.stopPropagation()}
      className="gs-sheet fixed top-3 right-3 bottom-3 z-[80] w-[440px] flex flex-col rounded-[22px] overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3 flex items-center justify-between gap-3 border-b border-white/[0.06]">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-white">{p.variant === "multi" ? "Multi-clock setup" : "Clock setup"}</h2>
          <p className="text-[11px] text-white/45 flex items-center gap-1" data-testid="gs-autosave"><Check size={11} className="text-green-400" />Saved automatically · {savedAgo < 5 ? "just now" : `${savedAgo}s ago`}</p>
        </div>
        <button onClick={p.onClose} aria-label="Close setup" className="gs-step w-9 h-9 rounded-full flex items-center justify-center shrink-0"><X size={16} /></button>
      </div>

      {/* Presets bar */}
      <div className="shrink-0 px-5 py-3 border-b border-white/[0.06] relative" data-testid="gs-presets">
        <div className="flex items-center gap-2">
          <button onClick={() => setPresetsOpen((o) => !o)} aria-expanded={presetsOpen} data-testid="gs-presets-toggle"
            className="gs-chip rounded-full pl-3 pr-2 py-1.5 text-[12px] font-semibold flex items-center gap-1.5 shrink-0"><Bookmark size={13} />Presets<ChevronDown size={13} /></button>
          <div className="flex gap-1.5 min-w-0 overflow-hidden">
            {presets.slice(-3).map((pr) => (
              <button key={pr.id} onClick={() => { p.applySnapshot(pr.data); setActivePreset(pr.id); }} data-on={activePreset === pr.id ? "" : undefined}
                className="gs-chip rounded-full px-3 py-1.5 text-[12px] font-semibold max-w-[120px] truncate shrink-0">{pr.name}</button>
            ))}
          </div>
        </div>
        {presetsOpen && (
          <div className="gs-menu mt-3 rounded-2xl p-2" data-testid="gs-presets-menu">
            <p className="px-2 pt-1 pb-2 text-[11px] text-white/45">Saves the whole {p.variant === "multi" ? "wall: layout and every clock" : "clock: mode, time, look and display"}.</p>
            <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5">
              {presets.length === 0 && <p className="px-2 py-2 text-[12px] text-white/40">No presets yet</p>}
              {presets.map((pr) => (
                <div key={pr.id} className="flex items-center gap-1 rounded-xl hover:bg-white/[0.05]">
                  <button onClick={() => { p.applySnapshot(pr.data); setActivePreset(pr.id); setPresetsOpen(false); }} className="flex-1 min-w-0 text-left px-2 py-2 flex items-center gap-2">
                    <span className="w-4 shrink-0">{activePreset === pr.id && <Check size={14} className="text-green-400" />}</span>
                    <span className="truncate text-[13px] text-white/85">{pr.name}</span>
                  </button>
                  <button onClick={() => setPresets((l) => l.filter((x) => x.id !== pr.id))} aria-label={`Delete ${pr.name}`} className="p-2 text-white/30 hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 mt-1 border-t border-white/[0.06]">
              <input value={presetName} onChange={(e) => setPresetName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && savePreset()} placeholder="Name this setup…"
                className="gs-input flex-1 min-w-0 rounded-full px-3 py-1.5 text-[13px] outline-none" data-testid="gs-preset-name" />
              <button onClick={savePreset} className="gs-primary rounded-full px-3 py-1.5 text-[12px] font-semibold flex items-center gap-1 shrink-0"><Save size={13} />Save current</button>
            </div>
          </div>
        )}
      </div>

      <div ref={bodyRef} data-gs-scroll="" className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {/* Multi-clock preview cards */}
        {p.previews && (
          <section className="flex flex-col gap-2" data-testid="gs-previews">
            <div className="flex items-center justify-between px-1"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Clocks · drag to reorder</p></div>
            <div className="grid grid-cols-2 gap-2">
              {p.previews.map((pc, i) => (
                <button key={pc.id} draggable data-testid={`gs-preview-${pc.id}`} data-on={p.selectedId === pc.id ? "" : undefined}
                  onClick={() => p.onSelect?.(pc.id)}
                  onDragStart={() => setDragFrom(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragFrom !== null && dragFrom !== i) p.onReorder?.(dragFrom, i); setDragFrom(null); }}
                  className="gs-preview relative text-left rounded-xl px-3 py-2 flex flex-col gap-0.5 min-w-0" style={{ ["--c" as string]: pc.color }}>
                  <span className="flex items-center gap-1.5 min-w-0">
                    <GripVertical size={12} className="text-white/30 shrink-0" />
                    <span className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">{pc.name}</span>
                  </span>
                  <span className="text-[22px] leading-tight font-semibold tabular-nums truncate" style={{ color: pc.color, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{pc.text}</span>
                  <span className="text-[10px] text-white/40 truncate">{pc.modeLabel}</span>
                </button>
              ))}
              {p.canAdd && <button onClick={p.onAdd} className="gs-add rounded-xl flex items-center justify-center gap-1 text-[12px] font-semibold text-white/50 min-h-[74px]"><Plus size={14} />Add clock</button>}
            </div>
          </section>
        )}

        <Section id="mode" title={p.previews ? `Mode · ${c.clockName || "Clock"}` : "Mode"} onReset={() => reset("mode")}
          more={otherModes.length ? (
            <Field label="Sources">
              <Segmented wrap value={mode} options={otherModes} onChange={(m) => onChange({ mode: m })} testid="gs-mode-sources" />
              {lockedTc && <p className="text-[11px] text-white/40 flex items-center gap-1"><Lock size={11} />Rundown and Timecode need a Tally sign-in.</p>}
            </Field>
          ) : undefined}>
          <Segmented value={mainModes.some((m) => m.value === mode) ? mode : ("" as string)} options={mainModes} onChange={(m) => onChange({ mode: m })} testid="gs-mode" />
          {!mainModes.some((m) => m.value === mode) && <p className="mt-2 text-[12px] text-white/60">Source: <span className="text-green-400 font-semibold">{p.modes.find((m) => m.value === mode)?.label}</span></p>}
          <Field label="Name">
            <input value={c.clockName} onChange={(e) => onChange({ clockName: e.target.value })} placeholder="Clock name…" className="gs-input rounded-xl px-3 py-2 text-[14px] outline-none" data-testid="gs-name" />
          </Field>
          {mode === "rundown" && <div ref={p.rundownSlotRef} className="gs-slot" data-testid="gs-rundown-slot" />}
        </Section>

        <Section id="time" title="Time" onReset={() => reset("time")}
          more={mode === "clock" ? (
            <Field label="All time zones"><Segmented wrap value={c.timezone} options={TZ_MORE} onChange={(v) => onChange({ timezone: v })} /></Field>
          ) : mode === "countdown" ? (
            <Field label="Overtime warning color"><Swatches value={c.overtimeWarningColor || "#f59e0b"} options={COLORS} onChange={(v) => onChange({ overtimeWarningColor: v })} /></Field>
          ) : undefined}>
          {mode === "clock" && (<>
            <Field label="Time zone"><Segmented value={TZ_MAIN.some((t) => t.value === c.timezone) ? c.timezone : ""} options={TZ_MAIN} onChange={(v) => onChange({ timezone: v })} testid="gs-tz" /></Field>
            <Field label="Format"><Segmented value={c.is24h ? "24" : "12"} options={[{ value: "12", label: "12-hour" }, { value: "24", label: "24-hour" }]} onChange={(v) => onChange({ is24h: v === "24" })} /></Field>
          </>)}
          {mode === "countdown" && <TimeEntry label="Count down from" testid="gs-time-countdown" seconds={c.countdownFrom ?? 300} onChange={(s) => onChange({ countdownFrom: s })} />}
          {mode === "countup" && <TimeEntry label="Count up starts at" testid="gs-time-countup" seconds={c.countupStart ?? 0} quick={[0, 300, 900, 1800, 3600]} onChange={(s) => onChange({ countupStart: s })} />}
          {mode === "countto" && <TimeOfDayEntry label="Count to time of day" is24h={!!c.is24h}
            value={c.countToTime ?? (c.countToTarget ? timeOfDayOf(c.countToTarget) : undefined)}
            onChange={(t) => onChange({ countToTime: t, countToTarget: targetToday(t) })} />}
          {isTimer && <div className="mt-3"><AdjustSteppers value={c.timeAdjust || 0} onAdjust={(d) => onChange({ timeAdjust: (c.timeAdjust || 0) + d })} onClear={() => onChange({ timeAdjust: 0 })} /></div>}
          {mode === "countdown" && <Toggle label="Keep counting past zero" hint="Shows overtime in red instead of stopping at 0:00" checked={c.allowOverrun ?? true} onChange={(v) => onChange({ allowOverrun: v })} />}
          {(mode === "clock" || isTimer) && p.variant === "multi" && <Toggle label="Show seconds" checked={c.showSeconds ?? true} onChange={(v) => onChange({ showSeconds: v })} />}
          {!(mode === "clock" || isTimer) && <p className="text-[12px] text-white/45">This source sets its own time.</p>}
        </Section>

        <Section id="look" title="Look" onReset={() => reset("look")}
          more={<>
            {p.variant === "multi"
              ? <Field label={`Clock size · ${Math.round((c.sizeScale || 1) * 100)}%`}><input type="range" min={50} max={200} step={5} value={Math.round((c.sizeScale || 1) * 100)} onChange={(e) => onChange({ sizeScale: +e.target.value / 100 })} className="gs-range w-full" /></Field>
              : <>
                <Toggle label="Auto-fit numbers" hint="Fills the screen width" checked={c.autoSize ?? true} onChange={(v) => onChange({ autoSize: v })} />
                {!c.autoSize && <Field label={`Number size · ${c.fontSize}px`}><input type="range" min={30} max={800} step={10} value={c.fontSize || 200} onChange={(e) => onChange({ fontSize: +e.target.value })} className="gs-range w-full" /></Field>}
                <Toggle label="Tenths of a second" checked={!!c.showTenths} onChange={(v) => onChange({ showTenths: v })} />
                <Toggle label="Hide leading zero" checked={!!c.hideLeadingZero} onChange={(v) => onChange({ hideLeadingZero: v })} />
              </>}
            {c.displayStyle === "analog" && <Field label={`Hand thickness · ${c.thickness ?? 2}`}><input type="range" min={1} max={5} value={c.thickness ?? 2} onChange={(e) => onChange({ thickness: +e.target.value })} className="gs-range w-full" /></Field>}
          </>}>
          <Field label="Color"><Swatches value={c.clockColor} options={COLORS} onChange={(v) => onChange({ clockColor: v })} testid="gs-color" /></Field>
          <Field label="Style"><Segmented value={c.displayStyle || "digital"} options={[{ value: "digital", label: "Digital" }, { value: "analog", label: "Analog" }]} onChange={(v) => onChange({ displayStyle: v as "digital" | "analog" })} /></Field>
          <Field label="Number font"><Segmented wrap value={c.fontName} options={FONTS} onChange={(v) => onChange({ fontName: v })} testid="gs-font" /></Field>
          <Field label="Label size"><Segmented value={resolveLabelSize(c.labelSize)} options={LABEL_SIZES.map((o) => ({ value: o.value, label: o.label }))} onChange={(v) => onChange({ labelSize: v as LabelSize })} testid="gs-label-size" /></Field>
          <Toggle label="Scale labels with numbers" checked={resolveScaleLabels(c.scaleLabels)} onChange={(v) => onChange({ scaleLabels: v })} testid="gs-scale-labels" />
        </Section>

        <Section id="timecode" title="Timecode" onReset={mode === "timecode" ? () => reset("timecode") : undefined}>
          {lockedTc ? (
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06] flex gap-3 items-start" data-testid="gs-tc-locked">
              <Lock size={16} className="text-white/50 mt-0.5 shrink-0" />
              <div><p className="text-[13px] text-white/80">{p.variant === "single" ? "Timecode is on Multi-Clock for signed-in Tally users" : "Sign in to Tally to use Timecode"}</p><p className="text-[11px] text-white/45 leading-snug">LTC from a Deity TC-1, with jam-sync so you can unplug it after.</p></div>
            </div>
          ) : mode !== "timecode" ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] text-white/50 leading-snug">Show LTC timecode from a Deity TC-1 on this clock.</p>
              <button onClick={() => onChange({ mode: "timecode" })} className="gs-chip rounded-full px-3 py-1.5 text-[12px] font-semibold shrink-0">Use Timecode</button>
            </div>
          ) : (<>
            <Field label="Frame rate shown"><Segmented value={c.tcHighFrameRate ? "x2" : "as"} options={[{ value: "as", label: "As received" }, { value: "x2", label: "×2 · 59.94 / 60" }]} onChange={(v) => onChange({ tcHighFrameRate: v === "x2" })} testid="gs-tc-rate" /></Field>
            <div ref={p.tcSlotRef} className="gs-slot gs-tc-slot" data-testid="gs-tc-slot" />
          </>)}
        </Section>

        {p.display && <Section id="display" title="Display">{p.display}</Section>}
        <div className="h-2 shrink-0" />
      </div>
    </aside>
  );
}
