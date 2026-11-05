import { formatTimeOfDay } from "@/lib/countTo";

/** Pick a time of day ("HH:MM", 24h) in the clock's own format: 12-hour with AM/PM, or 24-hour. */
export function TimeOfDayEntry({ value, onChange, label, is24h, testid = "gs-time-countto" }: { value?: string; onChange: (hhmm: string) => void; label: string; is24h: boolean; testid?: string }) {
  const [h, m] = (value ?? "").split(":").map(Number);
  const hasValue = Number.isFinite(h) && Number.isFinite(m);
  const H = hasValue ? h : 12, M = hasValue ? m : 0;
  const pm = H >= 12;
  const emit = (hh: number, mm: number) => onChange(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  const sel = "gs-input gs-time rounded-xl h-12 px-2 text-[22px] font-semibold outline-none text-center";
  return (
    <div className="flex flex-col gap-2" data-testid={testid}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</p>
      <div className="flex items-center gap-2">
        <select aria-label="Hour" data-testid={`${testid}-hour`} className={sel} value={is24h ? H : H % 12 || 12}
          onChange={(e) => { const v = Number(e.target.value); emit(is24h ? v : (v % 12) + (pm ? 12 : 0), M); }}>
          {(is24h ? [...Array(24).keys()] : [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).map((x) => <option key={x} value={x}>{is24h ? String(x).padStart(2, "0") : x}</option>)}
        </select>
        <span className="text-[22px] text-white/60">:</span>
        <select aria-label="Minute" data-testid={`${testid}-minute`} className={sel} value={M} onChange={(e) => emit(H, Number(e.target.value))}>
          {[...Array(60).keys()].map((x) => <option key={x} value={x}>{String(x).padStart(2, "0")}</option>)}
        </select>
        {!is24h && (
          <div className="flex gap-1" role="group" aria-label="AM or PM">
            {(["AM", "PM"] as const).map((ap) => (
              <button key={ap} type="button" data-testid={`${testid}-${ap.toLowerCase()}`} data-on={(ap === "PM") === pm ? "" : undefined}
                onClick={() => emit((H % 12) + (ap === "PM" ? 12 : 0), M)} className="gs-seg-btn rounded-lg px-3 h-12 text-[14px] font-semibold">{ap}</button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[12px] text-white/45" data-testid={`${testid}-summary`}>
        {hasValue ? `Counting to ${formatTimeOfDay(value!, is24h)} today. After that it counts up as overtime.` : "Pick a time of day."}
      </p>
    </div>
  );
}
