import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useTimer } from "./useTimer";
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(10000); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
it("repeated start/pause is idempotent and resume retains elapsed time", () => {
  const { result } = renderHook(useTimer);
  act(() => result.current.startTimer());
  act(() => vi.advanceTimersByTime(1000));
  act(() => result.current.startTimer());
  act(() => vi.advanceTimersByTime(1000));
  act(() => { result.current.pauseTimer(); result.current.pauseTimer(); });
  expect(result.current.elapsedMs).toBe(2000);
  act(() => vi.advanceTimersByTime(3000));
  expect(result.current.elapsedMs).toBe(2000);
  act(() => result.current.startTimer());
  act(() => vi.advanceTimersByTime(1000));
  act(() => result.current.pauseTimer());
  expect(result.current.elapsedMs).toBe(3000);
});
it("reset and interrupted views do not leave ticks behind", () => {
  const view = renderHook(useTimer);
  act(() => view.result.current.resetTimer(true));
  act(() => vi.advanceTimersByTime(1000));
  act(() => view.result.current.resetTimer(false));
  expect(view.result.current.elapsedMs).toBe(0);
  expect(view.result.current.paused).toBe(true);
  act(() => view.result.current.startTimer());
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  const reopened = renderHook(useTimer);
  expect(reopened.result.current.paused).toBe(true);
  expect(reopened.result.current.elapsedMs).toBe(0);
});
it("ignores forward/backward wall corrections while monotonic elapsed advances", () => {
  let monotonic = 0;
  const { result } = renderHook(() => useTimer(() => monotonic));
  act(() => result.current.startTimer());
  for (const wall of [86400000, -86400000, 10000]) {
    act(() => { vi.setSystemTime(wall); monotonic += 1000; vi.advanceTimersByTime(33); });
  }
  expect(result.current.elapsedMs).toBe(3000);
  act(() => result.current.pauseTimer());
  act(() => { monotonic += 5000; vi.setSystemTime(999999999); });
  expect(result.current.elapsedMs).toBe(3000);
  act(() => result.current.startTimer());
  act(() => { monotonic += 2000; result.current.pauseTimer(); });
  expect(result.current.elapsedMs).toBe(5000);
});
it("catches up after throttling on visibility/pageshow without counting callbacks", () => {
  let monotonic = 0;
  const { result } = renderHook(() => useTimer(() => monotonic));
  act(() => result.current.startTimer());
  // No interval callbacks during this simulated background gap.
  act(() => { monotonic = 600000; document.dispatchEvent(new Event("visibilitychange")); });
  expect(result.current.elapsedMs).toBe(600000);
  act(() => { monotonic = 610000; window.dispatchEvent(new Event("pageshow")); });
  expect(result.current.elapsedMs).toBe(610000);
  act(() => result.current.pauseTimer());
  act(() => { monotonic += 100000; window.dispatchEvent(new Event("pageshow")); });
  expect(result.current.elapsedMs).toBe(610000);
});
it("does not invent elapsed time when a sleeping browser freezes its monotonic clock", () => {
  let monotonic = 0;
  const { result } = renderHook(() => useTimer(() => monotonic));
  act(() => result.current.startTimer());
  act(() => { monotonic = 1000; vi.advanceTimersByTime(33); });
  act(() => { vi.setSystemTime(Date.now() + 3600000); window.dispatchEvent(new Event("pageshow")); });
  expect(result.current.elapsedMs).toBe(1000);
  act(() => { monotonic += 500; result.current.pauseTimer(); });
  expect(result.current.elapsedMs).toBe(1500);
});
it("serializes rapid toggle/reset controls without losing or duplicating elapsed time", () => {
  let monotonic = 0;
  const { result, unmount } = renderHook(() => useTimer(() => monotonic));
  act(() => { result.current.togglePause(); monotonic = 500; result.current.togglePause(); result.current.togglePause(); });
  act(() => { monotonic = 1000; result.current.pauseTimer(); });
  expect(result.current.elapsedMs).toBe(1000);
  act(() => { result.current.resetTimer(true); monotonic = 1250; result.current.resetTimer(true); monotonic = 1500; result.current.pauseTimer(); });
  expect(result.current.elapsedMs).toBe(250);
  act(() => result.current.startTimer());
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  act(() => { document.dispatchEvent(new Event("visibilitychange")); window.dispatchEvent(new Event("pageshow")); });
});
