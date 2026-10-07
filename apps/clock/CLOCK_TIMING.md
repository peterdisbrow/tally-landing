# Clock timer fixes — local candidate, 2026-10-07

Count-up and countdown durations use `performance.now()` through `src/hooks/useTimer.ts`. Device time corrections never change these durations. Pauses accumulate elapsed time exactly once; repeated starts are idempotent, reset and rapid toggle controls use synchronous refs. Visibility/pageshow refresh the display without restarting it. Delayed callbacks use elapsed differences rather than counting ticks.

Wall-clock displays, Count To, service schedules and Tally device timestamps retain their existing wall-clock/time-sync behavior. No external time service was added or removed.

Browser sleep is a limitation: browsers do not uniformly advance `performance.now()` while the OS sleeps. The timer counts only the monotonic time the browser reports; it never uses Date.now to guess a missing sleep interval. Keep the device awake during a show. Actual OS sleep was not exercised; injected-clock tests cover both advancing and frozen monotonic clocks. See [MDN performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#ticking_during_sleep).

Featured, thumbnail and grid positions now share one keyed parent. Selection/reordering and layout changes keep the same ClockCell mounted, preserving running/paused state, elapsed durations and targets. Clocks beyond a smaller layout's capacity stay mounted but hidden and continue running. Removing a clock or leaving/reloading the view ends that local timer; reopening starts paused at zero. Existing storage keys, saved clock order/configuration, navigation and authentication remain intact.

The same timer hook and regression tests are copied into three independent repositories because they have no existing shared package/release pipeline. Keep the hook/test copies aligned until a separately reviewed shared package is introduced. This patch does not introduce a runtime cross-repository dependency or a redirect.

Verification uses injected clocks and local Chrome production builds. Network/relay boundaries are mocked, with no real device connections, accounts, OS clock changes or production writes. Nothing in this candidate has been pushed or deployed.

## Repository verification

Typecheck, 17 tests and Clock production build passed. Full app lint has 19 pre-existing errors, reproduced on pristine b016e7b; no new errors. The parent Next marketing app was not changed or rebuilt.

Chrome production-build checks passed for feature swaps/layout hiding, simultaneous up/down/target clocks, paused-state retention, forward/backward clock jumps, single-clock pause/resume and reload. Screenshots inspected. The reusable browser spec lives in `disbrow-productions-clock/e2e/timer-state.spec.ts`; run it from that repo against any already-started local candidate with:

```sh
CLOCK_TEST_BASE_URL=http://127.0.0.1:4174/tools/clock/ npx playwright test --config playwright.timer.config.ts
```

Tally's production asset and route base is `/tools/clock/`. Website routes remain `/clock` and `/multi-clock`, with its existing `/tools/clock/` asset base; local verification used a static SPA server mapping those existing paths. No route, asset-base or production hosting configuration was changed.
