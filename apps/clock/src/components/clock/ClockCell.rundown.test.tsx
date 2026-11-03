import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import ClockCell, { type ClockCellConfig } from "./ClockCell";
import { resetRundownConnections, setRundownSocketFactory } from "@/lib/rundownTimer";
import { FakeSocket } from "@/test/fakeSocket";

const TOKEN = "b".repeat(32) + "fedcba9876543210fedcba9876543210";
const LINK = `https://api.tallyconnect.app/rundown/timer/${TOKEN}`;
const NOW = new Date("2026-11-03T15:00:00Z").getTime();

const base: ClockCellConfig = { id: "r1", clockName: "", clockColor: "#22c55e", fontName: "system", timezone: "local", is24h: false, mode: "rundown" };
const snap = (extra: Record<string, unknown> = {}) => ({
  type: "timer_state", is_live: true, plan_title: "Between Sundays", cue_title: "Session 3", remaining_seconds: 300,
  elapsed_seconds: 100, overtime_seconds: 0, is_overtime: false, is_warning: false, service_elapsed: 5400, service_remaining: 3600,
  server_timestamp: Date.now(), ...extra,
});

function Harness({ initial, signedIn }: { initial: ClockCellConfig; signedIn: boolean }) {
  const [cfg, setCfg] = useState(initial);
  return <ClockCell config={cfg} onUpdate={setCfg} onRemove={() => {}} isTallySignedIn={signedIn} />;
}
const openSettings = () => fireEvent.click(document.querySelector("button svg.lucide-settings")!.closest("button")!);
const readout = () => screen.getByTestId("rundown-readout");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  FakeSocket.reset();
  resetRundownConnections();
  setRundownSocketFactory((url) => new FakeSocket(url) as unknown as WebSocket);
  vi.stubGlobal("WebSocket", FakeSocket);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});
afterEach(() => {
  cleanup();
  resetRundownConnections();
  setRundownSocketFactory(null);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Rundown timer mode is Tally sign-in only", () => {
  it("is not offered when signed out and a saved Rundown cell never connects", () => {
    render(<Harness initial={{ ...base, rundownToken: TOKEN }} signedIn={false} />);
    openSettings();
    expect(screen.queryByRole("button", { name: "Rundown Timer" })).toBeNull();
    expect(screen.getByRole("button", { name: "Count Up" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to Tally")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(FakeSocket.instances).toHaveLength(0);
  });

  it("is offered when signed in", () => {
    render(<Harness initial={{ ...base, mode: "clock" }} signedIn />);
    openSettings();
    expect(screen.getByRole("button", { name: "Rundown Timer" })).toBeInTheDocument();
    expect(FakeSocket.instances).toHaveLength(0);
  });
});

describe("Rundown timer cell", () => {
  it("connects when a link is pasted and shows the current cue countdown, red on overtime", () => {
    render(<Harness initial={{ ...base, mode: "clock", clockColor: "#22c55e" }} signedIn />);
    openSettings();
    fireEvent.click(screen.getByRole("button", { name: "Rundown Timer" }));
    expect(screen.getByText("Paste Rundown link")).toBeInTheDocument();
    const input = screen.getByTestId("rundown-link-input");
    fireEvent.paste(input, { clipboardData: { getData: () => LINK } });
    expect(FakeSocket.instances).toHaveLength(1);
    expect(FakeSocket.last.url).toBe(`wss://api.tallyconnect.app/rundown-timer?token=${TOKEN}`);
    // The token is never printed in the panel.
    expect(document.body.textContent).not.toContain(TOKEN);
    act(() => { FakeSocket.last.serverOpen(); FakeSocket.last.serverSend(snap()); });
    expect(screen.getByTestId("rundown-link-status").textContent).toContain("Connected");
    expect(readout().textContent).toBe("05:00");
    expect(readout().style.color).toBe("rgb(34, 197, 94)");
    act(() => { vi.advanceTimersByTime(3000); });
    expect(readout().textContent).toBe("04:57");

    act(() => { FakeSocket.last.serverSend(snap({ is_overtime: true, remaining_seconds: 0, overtime_seconds: 12, server_timestamp: Date.now() })); });
    expect(readout().textContent).toBe("+00:12");
    expect(readout().style.color).toBe("rgb(239, 68, 68)");
    act(() => { vi.advanceTimersByTime(2000); });
    expect(readout().textContent).toBe("+00:14");
  });

  it("switches between cue countdown, show remaining and show elapsed", () => {
    render(<Harness initial={{ ...base, rundownToken: TOKEN }} signedIn />);
    act(() => { FakeSocket.last.serverOpen(); FakeSocket.last.serverSend(snap()); });
    expect(readout().textContent).toBe("05:00");
    openSettings();
    fireEvent.click(screen.getByRole("button", { name: "Show remaining" }));
    expect(readout().textContent).toBe("1:00:00");
    fireEvent.click(screen.getByRole("button", { name: "Show elapsed" }));
    expect(readout().textContent).toBe("1:30:00");
    act(() => { vi.advanceTimersByTime(1000); });
    expect(readout().textContent).toBe("1:30:01");
    fireEvent.click(screen.getByRole("button", { name: "Cue countdown" }));
    expect(readout().textContent).toBe("04:59");
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it("uses the clock's own Tally time sync for the offset", async () => {
    // The synced clock is 5s ahead of this machine's clock.
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
      if (String(url).endsWith("/api/time")) return new Response(JSON.stringify({ serverTime: Date.now() + 5000 }), { status: 200 });
      throw new Error("no");
    });
    render(<Harness initial={{ ...base, rundownToken: TOKEN }} signedIn />);
    await act(async () => { await vi.advanceTimersByTimeAsync(400); });
    act(() => { FakeSocket.last.serverOpen(); FakeSocket.last.serverSend(snap({ server_timestamp: Date.now() })); });
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    // Stamped on this machine's clock, read on the synced clock: 5s apart, so 300s shows ~4:54.
    expect(readout().textContent).toBe("04:54");
  });

  it("recovers after a dropped connection", () => {
    render(<Harness initial={{ ...base, rundownToken: TOKEN }} signedIn />);
    act(() => { FakeSocket.last.serverOpen(); FakeSocket.last.serverSend(snap()); });
    act(() => { FakeSocket.last.serverClose(1006); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(FakeSocket.instances).toHaveLength(2);
    act(() => { FakeSocket.last.serverOpen(); FakeSocket.last.serverSend(snap({ remaining_seconds: 200, server_timestamp: Date.now() })); });
    expect(readout().textContent).toBe("03:20");
  });

  it("explains an invalid link and rejects text that is not a Rundown link", () => {
    render(<Harness initial={{ ...base, rundownToken: TOKEN }} signedIn />);
    act(() => { FakeSocket.last.serverClose(1008, "invalid share token"); });
    expect(screen.getByText("Link not valid or expired")).toBeInTheDocument();
    openSettings();
    fireEvent.change(screen.getByTestId("rundown-link-input"), { target: { value: "https://example.com/nope" } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    expect(screen.getByRole("alert").textContent).toContain("not a Rundown");
  });

  it("closes the socket when the cell is removed from Rundown mode", () => {
    render(<Harness initial={{ ...base, rundownToken: TOKEN }} signedIn />);
    openSettings();
    fireEvent.click(screen.getByRole("button", { name: "Count Up" }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(FakeSocket.instances[0].readyState).toBe(3);
  });
});
