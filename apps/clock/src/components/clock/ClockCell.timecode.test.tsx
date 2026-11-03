import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import ClockCell, { type ClockCellConfig } from "./ClockCell";
import { jamStore, type JamRecord } from "@/lib/timecode/jam";
import { tcToCount } from "@/lib/timecode/timecode";

const NOW = new Date("2026-11-03T15:00:00Z").getTime();
const R = { nominal: 24, fps: 24000 / 1001, drop: false };
const base: ClockCellConfig = { id: "t1", clockName: "", clockColor: "#ef4444", fontName: "system", timezone: "local", is24h: true, mode: "timecode" };
const JAM: JamRecord = { v: 1, sourceId: "deity-tc1-ltc", ...R, anchorWallMs: NOW - 5 * 60_000, anchorCount: tcToCount({ h: 1, m: 0, s: 0, f: 0 }, R), jammedAtMs: NOW - 5 * 60_000, frames: 72, spreadMs: 3 };

function Harness({ initial, signedIn }: { initial: ClockCellConfig; signedIn: boolean }) {
  const [cfg, setCfg] = useState(initial);
  return <ClockCell config={cfg} onUpdate={setCfg} onRemove={() => {}} isTallySignedIn={signedIn} />;
}
const openSettings = () => fireEvent.click(document.querySelector("button svg.lucide-settings")!.closest("button")!);
let gum: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear(); jamStore._reloadFromStorage();
  gum = vi.fn(() => Promise.reject(Object.assign(new Error("no"), { name: "NotAllowedError" })));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: gum, enumerateDevices: async () => [], addEventListener() {}, removeEventListener() {} } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("Timecode (Deity TC-1) mode is Tally sign-in only", () => {
  it("is not offered when signed out; a saved Timecode cell never opens the mic or free-runs", () => {
    jamStore.set(JAM);
    render(<Harness initial={base} signedIn={false} />);
    openSettings();
    expect(screen.queryByRole("button", { name: /Timecode \(Deity TC-1\)/ })).toBeNull();
    expect(screen.getByText("Sign in to Tally")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\d\d:\d\d:\d\d:\d\d/);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(gum).not.toHaveBeenCalled();
  });

  it("is offered when signed in and labelled for the TC-1", () => {
    render(<Harness initial={{ ...base, mode: "clock" }} signedIn />);
    openSettings();
    expect(screen.getByRole("button", { name: "Timecode (Deity TC-1)" })).toBeInTheDocument();
    expect(gum).not.toHaveBeenCalled();
  });
});

describe("jam persistence in the cell", () => {
  it("shows a saved jam free-running with no signal and no mic, with 'Jammed Xm ago'", () => {
    jamStore.set(JAM);
    render(<Harness initial={base} signedIn />);
    act(() => { vi.advanceTimersByTime(100); });
    // 5 min wall = 7192.8 frames @ 23.976 (+100 ms) = 7195 frames -> 01:04:59:19
    expect(document.body.textContent).toMatch(/01:04:59:(18|19)/); // frame boundary jitters with fake rAF ticks
    expect(document.body.textContent).toContain("FREE-RUN");
    expect(document.body.textContent).toMatch(/jammed 5m ago/);
    expect(gum).not.toHaveBeenCalled(); // free-run doesn't need the mic
    // ticks forward with the wall clock
    act(() => { vi.advanceTimersByTime(2000); });
    expect(document.body.textContent).toContain("01:05:01:");
  });

  it("Clear removes the jam", () => {
    jamStore.set(JAM);
    render(<Harness initial={base} signedIn />);
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.click(screen.getByTestId("jam-clear"));
    expect(jamStore.get("deity-tc1-ltc")).toBeNull();
    expect(document.body.textContent).toContain("--:--:--:--");
  });

  it("settings show the TC-1 source, supported rates and jam status", () => {
    jamStore.set(JAM);
    render(<Harness initial={base} signedIn />);
    openSettings();
    expect(screen.getByTestId("tc-source-label").textContent).toBe("Deity TC-1 (LTC, line level)");
    expect(screen.getByTestId("jam-status").textContent).toMatch(/Jammed 5m ago · 23\.98 fps · free-running/);
    expect(document.body.textContent).toMatch(/L-OUT/);
    expect(document.body.textContent).toMatch(/23\.98, 24, 25, 29\.97, 29\.97 DF, 30/);
  });
});
