import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("@/lib/timeSync", () => ({ syncServerTime: vi.fn(async () => ({ offsetMs: 0, label: "t", source: "tally" })) }));
import { quantise, useSharedNow, getNow } from "./sharedNow";
import { useTimer } from "@/hooks/useTimer";
beforeEach(() => { vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "setTimeout", "clearTimeout", "Date", "requestAnimationFrame", "cancelAnimationFrame", "performance"] }); vi.setSystemTime(1_000_000_050); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("quantises to a 100 ms step", () => { expect(quantise(1234567)).toBe(1234500); });
it("every tile reads the same now and flips seconds on the same frame", () => {
  const a = renderHook(useSharedNow), b = renderHook(useSharedNow), c = renderHook(useSharedNow);
  for (let i = 0; i < 40; i++) {
    act(() => vi.advanceTimersByTime(37));
    const s = [a, b, c].map((h) => h.result.current.getTime());
    expect(new Set(s).size).toBe(1);
    expect(s[0]).toBe(getNow().getTime());
    expect(s[0] % 100).toBe(0);
  }
});
it("count up / countdown are NOT aligned to the shared tick: exact elapsed across start, pause, resume and ±time", () => {
  renderHook(useSharedNow);
  const { result } = renderHook(useTimer);
  act(() => vi.advanceTimersByTime(53)); // start off a shared-tick boundary
  act(() => result.current.startTimer());
  act(() => vi.advanceTimersByTime(1234));
  act(() => result.current.pauseTimer());
  expect(result.current.elapsedMs).toBe(1234); // no snap to a second / tick boundary
  act(() => vi.advanceTimersByTime(5000));
  expect(result.current.elapsedMs).toBe(1234); // pause freezes
  act(() => result.current.startTimer());
  act(() => vi.advanceTimersByTime(766));
  act(() => result.current.pauseTimer());
  expect(result.current.elapsedMs).toBe(2000); // resume continues with no jump
  act(() => result.current.adjustTimer(60_000));
  expect(result.current.elapsedMs).toBe(62_000);
  act(() => result.current.adjustTimer(-10_000));
  expect(result.current.elapsedMs).toBe(52_000);
  act(() => result.current.startTimer());
  act(() => vi.advanceTimersByTime(333));
  act(() => result.current.pauseTimer());
  expect(result.current.elapsedMs).toBe(52_333);
});
