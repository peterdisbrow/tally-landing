import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ClockCell, { CELL_BAND, type ClockCellConfig } from "./ClockCell";
import { DIGIT_LINE, LABEL_SIZES } from "@/lib/labelSize";

const NOW = new Date("2026-11-03T15:00:00Z").getTime();
const base: ClockCellConfig = { id: "t1", clockName: "Sermon", clockColor: "#22c55e", fontName: "system", timezone: "local", is24h: false, mode: "countup" };

// jsdom has no layout: report a fixed size for every element and run ResizeObserver callbacks on observe().
let H = 400;
const W = 600;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubGlobal("ResizeObserver", class { cb: () => void; constructor(cb: () => void) { this.cb = cb; } observe() { this.cb(); } disconnect() {} });
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return (this as HTMLElement).dataset.clockPart === "content" ? H : H + 2 * CELL_BAND; } });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return W; } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight; delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth; });

const px = (el: HTMLElement) => parseFloat(el.style.fontSize);
const renderCell = (cfg: Partial<ClockCellConfig>, hint?: string) =>
  render(<ClockCell config={{ ...base, ...cfg }} onUpdate={() => {}} onRemove={() => {}} hint={hint} />);

describe("ClockCell layout: hover controls reserve their own rows", () => {
  it("puts the drag handle / gear / trash / timer controls in the top row, outside the content", async () => {
    const { container } = renderCell({});
    await act(async () => {});
    const part = (n: string) => container.querySelector(`[data-clock-part="${n}"]`) as HTMLElement;
    const controls = part("controls"), content = part("content"), bottom = part("bottom");
    expect(controls && content && bottom).toBeTruthy();
    // order in the column: controls, content, bottom
    expect(controls.nextElementSibling).toBe(content);
    expect(content.nextElementSibling).toBe(bottom);
    expect(controls.style.height).toBe(`${CELL_BAND}px`);
    expect(within(controls).getByRole("button", { name: /(Start|Pause) timer/ })).toBeTruthy();
    expect(controls.querySelector("svg.lucide-settings")).toBeTruthy();
    expect(controls.querySelector("svg.lucide-trash2")).toBeTruthy();
    // the +/- adjust bar sits in the reserved bottom row, not over the digits
    expect(within(bottom).getByTestId("adjust-bar")).toBeTruthy();
    expect(content.querySelector("[data-testid='adjust-bar']")).toBeNull();
    // labels and digits are in the content block, never in a hover row
    for (const id of ["label-name", "label-sub"]) { expect(within(content).getByTestId(id)).toBeTruthy(); expect(controls.querySelector(`[data-testid='${id}']`)).toBeNull(); }
    expect(content.querySelector("[data-clock-part='digits']")).toBeTruthy();
  });

  it("shows the hint in the top row between the handle and the controls", async () => {
    const { container } = renderCell({}, "★ Click to Feature");
    await act(async () => {});
    const controls = container.querySelector("[data-clock-part='controls']") as HTMLElement;
    expect(within(controls).getByTestId("cell-hint").textContent).toBe("★ Click to Feature");
  });

  it("keeps the Timecode input controls in the bottom row", async () => {
    const { container } = render(<ClockCell config={{ ...base, mode: "timecode" }} isTallySignedIn onUpdate={() => {}} onRemove={() => {}} />);
    await act(async () => {});
    const bottom = container.querySelector("[data-clock-part='bottom']") as HTMLElement;
    expect(within(bottom).getByTestId("ltc-overlay")).toBeTruthy();
  });

  it("settings panel starts below the controls row so the title is never covered", async () => {
    const { container } = renderCell({});
    await act(async () => {});
    fireEvent.click(container.querySelector("button svg.lucide-settings")!.closest("button")!);
    const panel = container.querySelector("[data-clock-part='settings']") as HTMLElement;
    expect(parseFloat(panel.style.paddingTop)).toBeGreaterThanOrEqual(CELL_BAND);
  });
});

describe("ClockCell layout: labels and digits always fit the content block", () => {
  for (const size of LABEL_SIZES.map((s) => s.value)) for (const scale of [true, false]) for (const h of [70, 120, 200, 400, 900]) {
    it(`label ${size}${scale ? "+" : "-"} in a ${h}px content block: name + digits + AM/PM + status never exceed it`, async () => {
      H = h;
      const { container } = renderCell({ mode: "clock", labelSize: size, scaleLabels: scale });
      await act(async () => {});
      const get = (id: string) => screen.queryByTestId(id) as HTMLElement | null;
      const digits = container.querySelector("[data-clock-part='digits']") as HTMLElement;
      const line = (el: HTMLElement | null) => (el ? Math.ceil(px(el) * 1.2) + 4 : 0);
      const total = line(get("label-name")) + line(get("label-sub")) + line(get("label-ampm")) + px(digits) * DIGIT_LINE;
      expect(total).toBeLessThanOrEqual(h);
      expect(px(digits)).toBeGreaterThanOrEqual(8);
    });
  }

  it("a very short cell drops the status and AM/PM labels before it squeezes the digits", async () => {
    H = 40;
    renderCell({ mode: "clock" });
    await act(async () => {});
    expect(screen.queryByTestId("label-sub")).toBeNull();
    expect(screen.queryByTestId("label-ampm")).toBeNull();
  });

  it("a roomy cell keeps every label", async () => {
    H = 400;
    renderCell({ mode: "clock" });
    await act(async () => {});
    for (const id of ["label-name", "label-sub", "label-ampm"]) expect(screen.getByTestId(id)).toBeTruthy();
  });
});
