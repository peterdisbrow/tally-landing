/** Mockup: Glass setup primitives (segmented pills, toggle switch, section, big time entry). */
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Minus, Plus, RotateCcw } from "lucide-react";
import { formatHMS, parseDuration } from "@/lib/timerAdjust";

export const ACCENT = "#22c55e";

export function Segmented<T extends string>({ value, options, onChange, testid, wrap }: { value: T; options: { value: T; label: string; locked?: boolean }[]; onChange: (v: T) => void; testid?: string; wrap?: boolean }) {
  return (
    <div data-testid={testid} role="radiogroup" className={`gs-seg ${wrap ? "flex-wrap" : ""} flex gap-1 p-1 rounded-full`}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} disabled={o.locked}
          onClick={() => onChange(o.value)} data-on={value === o.value ? "" : undefined}
          className="gs-seg-btn flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-35">
          {o.label}{o.locked ? " 🔒" : ""}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint, testid }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; testid?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className="text-[13px] text-white/80">{label}</p>
        {hint && <p className="text-[11px] text-white/40 leading-snug">{hint}</p>}
      </div>
      <button role="switch" aria-checked={checked} aria-label={label} data-testid={testid} onClick={() => onChange(!checked)}
        className="gs-switch relative shrink-0 w-10 h-6 rounded-full transition-colors" data-on={checked ? "" : undefined}>
        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: checked ? "translateX(16px)" : "none" }} />
      </button>
    </div>
  );
}

export function Field({ label, children, aside }: { label: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 py-1.5">
      <div className="flex items-center justify-between gap-2"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</p>{aside}</div>
      {children}
    </div>
  );
}

export function Section({ id, title, onReset, more, children, open: openInit = true }: { id: string; title: string; onReset?: () => void; more?: ReactNode; children: ReactNode; open?: boolean }) {
  const [showMore, setShowMore] = useState(false);
  return (
    <section data-testid={`gs-section-${id}`} id={`gs-${id}`} className="gs-card rounded-2xl px-4 py-3">
      <header className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-[13px] font-semibold tracking-wide text-white/90">{title}</h3>
        {onReset && <button onClick={onReset} className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/80" data-testid={`gs-reset-${id}`}><RotateCcw size={11} />Reset to default</button>}
      </header>
      {openInit && children}
      {more && (
        <>
          <button onClick={() => setShowMore((p) => !p)} className="mt-1 flex items-center gap-1 text-[12px] text-white/50 hover:text-white/80" aria-expanded={showMore} data-testid={`gs-more-${id}`}>
            <ChevronDown size={14} style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform .2s" }} />{showMore ? "Less" : "More"}
          </button>
          {showMore && <div className="mt-1 pt-2 border-t border-white/[0.06]">{more}</div>}
        </>
      )}
    </section>
  );
}

const STEPS = [-300, -60, -10, 10, 60, 300];
const fmtStep = (s: number) => `${s < 0 ? "−" : "+"}${Math.abs(s) >= 60 ? `${Math.abs(s) / 60}m` : `${Math.abs(s)}s`}`;

/** Big time entry (hh:mm:ss or mm:ss) with −/+ steppers and quick chips. */
export function TimeEntry({ seconds, onChange, label, testid, quick = [300, 600, 900, 1800, 3600] }: { seconds: number; onChange: (s: number) => void; label: string; testid?: string; quick?: number[] }) {
  const show = (s: number) => (s >= 3600 ? formatHMS(s) : formatHMS(s).replace(/^00:/, ""));
  const [text, setText] = useState(show(seconds));
  useEffect(() => setText(show(seconds)), [seconds]);
  const commit = () => { const v = parseDuration(text); if (v !== null) onChange(v); else setText(show(seconds)); };
  return (
    <div className="flex flex-col gap-2" data-testid={testid}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</p>
      <div className="flex items-center gap-2">
        <button aria-label="Subtract one minute" onClick={() => onChange(Math.max(0, seconds - 60))} className="gs-step w-11 h-11 rounded-full flex items-center justify-center"><Minus size={18} /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()}
          aria-label={label} inputMode="numeric" data-testid={testid ? `${testid}-input` : undefined}
          className="gs-time flex-1 min-w-0 text-center rounded-2xl py-2 text-[44px] leading-none font-semibold outline-none" />
        <button aria-label="Add one minute" onClick={() => onChange(seconds + 60)} className="gs-step w-11 h-11 rounded-full flex items-center justify-center"><Plus size={18} /></button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {quick.map((q) => (
          <button key={q} onClick={() => onChange(q)} data-on={seconds === q ? "" : undefined} className="gs-chip rounded-full px-3 py-1 text-[12px] font-semibold">{q >= 3600 ? `${q / 3600}h` : `${q / 60}m`}</button>
        ))}
      </div>
    </div>
  );
}

/** Live add / subtract bar (keeps the existing timeAdjust behaviour). */
export function AdjustSteppers({ value, onAdjust, onClear }: { value: number; onAdjust: (d: number) => void; onClear: () => void }) {
  return (
    <div className="flex flex-col gap-1.5" data-testid="gs-adjust">
      <div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Add / subtract live</p>
        <span className="text-[12px] tabular-nums text-white/60" data-testid="gs-adjust-value">{value === 0 ? "No change" : `${value > 0 ? "+" : "−"}${formatHMS(Math.abs(value)).replace(/^00:/, "")}`}</span></div>
      <div className="grid grid-cols-6 gap-1.5">
        {STEPS.map((s) => <button key={s} onClick={() => onAdjust(s)} className="gs-chip rounded-full py-1.5 text-[12px] font-semibold tabular-nums">{fmtStep(s)}</button>)}
      </div>
      {value !== 0 && <button onClick={onClear} className="self-start text-[11px] text-white/45 hover:text-white/80">Clear adjustment</button>}
    </div>
  );
}

export function Swatches({ value, options, onChange, testid }: { value: string; options: { label: string; value: string }[]; onChange: (v: string) => void; testid?: string }) {
  return (
    <div className="flex flex-wrap gap-2" data-testid={testid}>
      {options.map((c) => (
        <button key={c.value} title={c.label} aria-label={c.label} aria-pressed={value === c.value} onClick={() => onChange(c.value)}
          className="w-7 h-7 rounded-full transition-transform" style={{ background: c.value, boxShadow: value === c.value ? `0 0 0 2px #0b0d0c, 0 0 0 4px ${c.value}` : "inset 0 0 0 1px rgba(255,255,255,.15)" }} />
      ))}
    </div>
  );
}
