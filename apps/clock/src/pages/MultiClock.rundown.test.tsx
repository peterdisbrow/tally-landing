import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MultiClock from "./MultiClock";
import { resetRundownConnections, setRundownSocketFactory } from "@/lib/rundownTimer";
import { FakeSocket } from "@/test/fakeSocket";

const auth = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock("@/hooks/useTallyConnect", () => ({
  useTallyConnect: () => ({ isAuthenticated: auth.isAuthenticated, isConnected: false, status: {} }),
}));
vi.mock("@/components/clock/AuthPanel", () => ({ default: () => null }));
vi.mock("@/components/clock/LoginForm", () => ({ default: () => <div>login form</div> }));

const TOKEN = "c".repeat(32) + "0011223344556677889900112233aabb";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-03T15:00:00Z"));
  FakeSocket.reset();
  resetRundownConnections();
  setRundownSocketFactory((url) => new FakeSocket(url) as unknown as WebSocket);
  vi.stubGlobal("WebSocket", FakeSocket);
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  localStorage.setItem("broadcast-multi-layout", "2x2");
  localStorage.setItem("broadcast-multi-clocks", JSON.stringify([
    { id: "a", mode: "clock", clockName: "Local", clockColor: "#ef4444", fontName: "system", timezone: "local", is24h: true },
    { id: "b", mode: "rundown", rundownSub: "cue", rundownToken: TOKEN, clockName: "", clockColor: "#22c55e", fontName: "system", timezone: "local", is24h: true },
    { id: "c", mode: "rundown", rundownSub: "remaining", rundownToken: TOKEN, clockName: "", clockColor: "#3b82f6", fontName: "system", timezone: "local", is24h: true },
  ]));
});
afterEach(() => { cleanup(); resetRundownConnections(); setRundownSocketFactory(null); vi.unstubAllGlobals(); vi.useRealTimers(); });

it("signed in: Rundown cells sit in the grid next to a time-of-day clock and share one socket", async () => {
  auth.isAuthenticated = true;
  render(<MemoryRouter><MultiClock /></MemoryRouter>);
  await act(async () => {});
  expect(FakeSocket.instances).toHaveLength(1);
  act(() => {
    FakeSocket.last.serverOpen();
    FakeSocket.last.serverSend({ type: "timer_state", is_live: true, plan_title: "Between Sundays", cue_title: "Session 3", remaining_seconds: 300, service_remaining: 3600, server_timestamp: Date.now() });
  });
  const readouts = screen.getAllByTestId("rundown-readout").map((e) => e.textContent);
  expect(readouts).toEqual(["05:00", "1:00:00"]);
});

it("signed out: the sign-in gate shows, no Rundown socket opens", async () => {
  auth.isAuthenticated = false;
  render(<MemoryRouter><MultiClock /></MemoryRouter>);
  await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
  expect(screen.getByText("login form")).toBeInTheDocument();
  expect(screen.queryAllByTestId("rundown-readout")).toHaveLength(0);
  expect(FakeSocket.instances).toHaveLength(0);
});
