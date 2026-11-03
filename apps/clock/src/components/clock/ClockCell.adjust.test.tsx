import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import ClockCell, { type ClockCellConfig } from "./ClockCell";

const NOW = new Date("2026-11-03T15:00:00Z").getTime();
const base: ClockCellConfig = { id: "t1", clockName: "", clockColor: "#22c55e", fontName: "system", timezone: "local", is24h: true };

let latest: ClockCellConfig;
function Harness({ initial }: { initial: ClockCellConfig }) {
  const [cfg, setCfg] = useState(initial);
  latest = cfg;
  return <ClockCell config={cfg} onUpdate={setCfg} onRemove={() => {}} />;
}
// Display seconds (the 33ms tick can land just under a whole second), signed: "+" prefix = overtime.
const secs = () => {
  const t = text();
  const m = /^(\+)?(?:(\d+):)?(\d+):(\d+)(?:\.\d+)?$/.exec(t)!;
  const v = Number(m[2] || 0) * 3600 + Number(m[3]) * 60 + Number(m[4]);
  return m[1] ? -v : v;
};
const expectSecs = (expected: number) => expect(Math.abs(secs() - expected)).toBeLessThanOrEqual(1);
const text = () => (document.querySelector("[style*='font-size']") as HTMLElement).textContent!;
const openSettings = () => fireEvent.click(document.querySelector("button svg.lucide-settings")!.closest("button")!);
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const type = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } });
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(100); });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("Count Up starting value", () => {
  it("starts at 00:00.00 by default", async () => {
    render(<Harness initial={{ ...base, mode: "countup" }} />);
    await settle();
    expectSecs(0);
  });

  it("counts up from a typed start (30:00) and keeps it across a reload", async () => {
    render(<Harness initial={{ ...base, mode: "countup" }} />);
    openSettings();
    type("countup-start-input", "30:00");
    click("Set");
    expect(latest.countupStart).toBe(1800);
    await settle();
    expectSecs(1800);
    expect(screen.getByTestId("countup-start-status").textContent).toContain("Starts at 00:30:00");

    // running time is added on top of the start
    fireEvent.click(screen.getByLabelText("Start timer"));
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expectSecs(1805);

    // persisted config (what MultiClock saves to localStorage) restores the same start
    cleanup();
    render(<Harness initial={JSON.parse(JSON.stringify(latest))} />);
    await settle();
    expectSecs(1800);
  });

  it("accepts hh:mm:ss and bare seconds, and rejects junk", async () => {
    render(<Harness initial={{ ...base, mode: "countup" }} />);
    openSettings();
    type("countup-start-input", "01:12:30"); click("Set");
    expect(latest.countupStart).toBe(4350);
    type("countup-start-input", "90"); click("Set");
    expect(latest.countupStart).toBe(90);
    type("countup-start-input", "nope"); click("Set");
    expect(latest.countupStart).toBe(90);
    expect(screen.getByRole("alert").textContent).toContain("Type a start");
  });

  it("Reset returns to the start value; Clear removes it", async () => {
    render(<Harness initial={{ ...base, mode: "countup", countupStart: 600 }} />);
    fireEvent.click(screen.getByLabelText("Start timer"));
    await act(async () => { await vi.advanceTimersByTimeAsync(7000); });
    expectSecs(607);
    fireEvent.click(screen.getByLabelText("Reset timer"));
    await settle();
    expectSecs(600);
    openSettings();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(latest.countupStart).toBeUndefined();
  });
});

describe("Add / subtract time", () => {
  it("quick buttons adjust a running count up live and persist in the config", async () => {
    render(<Harness initial={{ ...base, mode: "countup" }} />);
    fireEvent.click(screen.getByLabelText("Start timer"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    click("Add 1m");
    await settle();
    expect(latest.timeAdjust).toBe(60);
    expectSecs(62);
    click("Add 10s"); click("Add 5m");
    expect(latest.timeAdjust).toBe(370);
    click("Subtract 5m");
    expect(latest.timeAdjust).toBe(70);
    // still running: keeps counting from the adjusted value
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expectSecs(75);
  });

  it("subtracting from a count up never goes below 00:00", async () => {
    render(<Harness initial={{ ...base, mode: "countup", countupStart: 20 }} />);
    click("Subtract 5m");
    await settle();
    expectSecs(0);
    expect(latest.timeAdjust).toBe(-20);
    click("Add 10s");
    await settle();
    expectSecs(10);
  });

  it("countdown: add time gives more remaining, subtract less, and it can go into overtime", async () => {
    render(<Harness initial={{ ...base, mode: "countdown", countdownFrom: 300 }} />);
    fireEvent.click(screen.getByLabelText("Start timer"));
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expectSecs(290);
    click("Add 1m");
    await settle();
    expectSecs(350);
    click("Subtract 5m");
    click("Subtract 5m");
    await settle();
    // 300 + 60 - 600 = -240s total, 10.1s elapsed -> 4:10 over
    expectSecs(-250);
    expect((document.querySelector("[style*='font-size']") as HTMLElement).style.color).toBe("rgb(239, 68, 68)");
  });

  it("picking a countdown preset clears a previous adjustment", () => {
    render(<Harness initial={{ ...base, mode: "countdown", countdownFrom: 300, timeAdjust: 120 }} />);
    openSettings();
    fireEvent.click(screen.getByRole("button", { name: "10m" }));
    expect(latest.countdownFrom).toBe(600);
    expect(latest.timeAdjust).toBeUndefined();
  });

  it("count to: moves the target", async () => {
    const target = NOW + 600_000;
    render(<Harness initial={{ ...base, mode: "countto", countToTarget: target }} />);
    await settle();
    expectSecs(600);
    click("Add 5m");
    await settle();
    expectSecs(900);
    click("Subtract 10s");
    expect(latest.timeAdjust).toBe(290);
  });

  it("typed amount adds or subtracts and validates", async () => {
    render(<Harness initial={{ ...base, mode: "countdown", countdownFrom: 600 }} />);
    openSettings();
    type("adjust-input", "1m30s");
    click("Add typed amount");
    expect(latest.timeAdjust).toBe(90);
    type("adjust-input", "2:00");
    click("Subtract typed amount");
    expect(latest.timeAdjust).toBe(-30);
    type("adjust-input", "garbage");
    click("Add typed amount");
    expect(latest.timeAdjust).toBe(-30);
    expect(screen.getByRole("alert").textContent).toContain("Type an amount");
    fireEvent.click(screen.getByRole("button", { name: "Clear adjustment" }));
    expect(latest.timeAdjust).toBeUndefined();
  });

  it("Reset timer also clears the adjustment", async () => {
    render(<Harness initial={{ ...base, mode: "countdown", countdownFrom: 300, timeAdjust: 90 }} />);
    fireEvent.click(screen.getByLabelText("Reset timer"));
    expect(latest.timeAdjust).toBeUndefined();
    await settle();
    expectSecs(300);
  });

  it("no adjust controls on plain clock, or on count to with no target", () => {
    render(<Harness initial={{ ...base, mode: "clock" }} />);
    expect(screen.queryByTestId("adjust-bar")).toBeNull();
    cleanup();
    render(<Harness initial={{ ...base, mode: "countto" }} />);
    expect(screen.queryByTestId("adjust-bar")).toBeNull();
  });
});
