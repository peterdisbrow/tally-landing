import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import ClockCell, { type ClockCellConfig } from "./ClockCell";

const base: ClockCellConfig = { id: "t1", clockName: "BETWEEN SUNDAYS", clockColor: "#22c55e", fontName: "system", timezone: "local", is24h: false, mode: "countup" };

let latest: ClockCellConfig;
function Harness({ initial }: { initial: ClockCellConfig }) {
  const [cfg, setCfg] = useState(initial);
  latest = cfg;
  return <ClockCell config={cfg} onUpdate={setCfg} onRemove={() => {}} />;
}
const px = (id: string) => parseFloat((screen.getByTestId(id) as HTMLElement).style.fontSize);
const openSettings = () => fireEvent.click(document.querySelector("button svg.lucide-settings")!.closest("button")!);

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Label size", () => {
  it("a saved config without the new fields still renders (default M, scaling on)", () => {
    render(<Harness initial={base} />);
    expect(screen.getByTestId("label-name").textContent).toBe("BETWEEN SUNDAYS");
    expect(px("label-name")).toBeGreaterThan(12); // bigger than the old fixed 12px
    expect(px("label-sub")).toBeGreaterThan(10);
  });

  it("S without scaling is the original size", () => {
    render(<Harness initial={{ ...base, labelSize: "s", scaleLabels: false }} />);
    expect(px("label-name")).toBe(12);
    expect(px("label-sub")).toBe(10);
  });

  it("junk values in a saved config fall back to the default instead of breaking", () => {
    render(<Harness initial={{ ...base, labelSize: "gigantic" as never, scaleLabels: "x" as never }} />);
    expect(px("label-name")).toBeGreaterThan(12);
  });

  it("settings: pick a size and toggle scaling, both land in the config", () => {
    render(<Harness initial={{ ...base, scaleLabels: false }} />);
    openSettings();
    const controls = screen.getByTestId("label-size-controls");
    const sizes = ["S", "M", "L", "XL"].map((l) => [...controls.querySelectorAll("button")].find((b) => b.textContent === l)!);
    fireEvent.click(sizes[3]);
    expect(latest.labelSize).toBe("xl");
    expect(sizes[3].getAttribute("aria-pressed")).toBe("true");
    expect(px("label-name")).toBe(36);
    fireEvent.click(sizes[0]);
    expect(px("label-name")).toBe(12);
    fireEvent.click(screen.getByRole("switch", { name: "Scale labels with numbers" }));
    expect(latest.scaleLabels).toBe(true);
    expect(JSON.parse(JSON.stringify(latest))).toMatchObject({ labelSize: "s", scaleLabels: true });
  });

  it("does not touch the digits", () => {
    render(<Harness initial={{ ...base, labelSize: "xl" }} />);
    const a = document.querySelector("[style*='font-family']:not([data-testid^='label'])") as HTMLElement;
    cleanup();
    render(<Harness initial={{ ...base, labelSize: "s" }} />);
    const b = document.querySelector("[style*='font-family']:not([data-testid^='label'])") as HTMLElement;
    expect(a.style.fontSize).toBe(b.style.fontSize);
  });
});
