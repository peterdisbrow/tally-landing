# tally-landing — Orientation

Marketing site (Next.js 15) plus bundled free-tools (Vite SPAs) deployed together on Vercel at `tallyconnect.app`.

## Layout

```
tally-landing/
├── app/                       Next.js App Router (landing site + API routes)
├── apps/clock/                Vite SPA: production clock + multi-clock
│   ├── src/pages/Clock.tsx         /clock
│   ├── src/pages/MultiClock.tsx    /multi-clock (auth-gated)
│   └── src/hooks/useTallyConnect.tsx   relay auth + WS (shared context)
├── public/tools/              Other free tools (healthcheck, checklist, streaming-config)
├── public/tools/clock/        Build output — gitignored; regenerated on deploy
├── lib/                       Next.js server-side libs (relay proxy, rate-limit)
└── scripts/sync-tools.sh      Copies streaming-config from church-av repo (clock no longer synced)
```

## Build pipeline

`npm run build` chains:
1. `build:clock` → `npm --prefix apps/clock ci --include=dev && vite build`
   - Writes to `../../public/tools/clock/` (whole dir is gitignored)
   - `--include=dev` is required — Vercel sets NODE_ENV=production which otherwise skips devDependencies like `@vitejs/plugin-react-swc`
2. `next build` — picks up the fresh clock bundle as static assets

Rewrites in `next.config.js`: `/clock` and `/multi-clock` → `/tools/clock/index.html` (same SPA, React Router handles the split).

## Clock app — non-obvious bits

- **Auth is context-based.** `TallyConnectProvider` wraps `<App />` in `apps/clock/src/App.tsx`. Calling `useTallyConnect()` from multiple components without that provider was the original bug — each call got its own state and logins never propagated.
- **Rules-of-hooks on the auth gate.** `MultiClock.tsx` renders a `<LoginForm />` when `!isAuthenticated`. The early `return` MUST sit below every `useState` / `useEffect` / `useCallback` call, or React throws minified error #300 on the authenticated render.
- **Relay endpoints** (hard-coded in `useTallyConnect.tsx`):
  - `POST https://api.tallyconnect.app/api/church/app/login` → `{ token, church }`
  - `GET  https://api.tallyconnect.app/api/church/app/rooms`
  - `WSS  wss://api.tallyconnect.app/portal?token=<jwt>`
- **Supabase anon config** lives in `apps/clock/.env.production` and is committed on purpose (it's a public anon key, embedded in the client bundle).
- **Toolbar visibility.** Window-level `mousemove` / `touchstart` / `keydown` shows the bar + arms a 2.5s auto-hide timer. Do not revert to root-div `onMouseEnter` — it doesn't fire when the cursor is already inside the page on mount.
- **ClockCell tally modes are prop-gated.** The tally-tier modes (ProPresenter, HyperDeck, Stream/Record time, Last Cue, ATEM Rec/Timecode) only appear in the per-cell mode picker when `isTallyConnected` is truthy — and the live values come from sibling props (`proPresenter`, `hyperdecks`, `atem`, `streamStartedAt`, etc.). Any page that renders `ClockCell` must destructure the full status bundle from `useTallyConnect()` and spread it into every cell. `MultiClock.tsx` builds a `tallyProps` object once and spreads it on all three `<ClockCell>` invocations (grid, featured top, featured bottom).
- **Rundown timer mode is sign-in gated, not device gated.** `ClockCell` shows the "Rundown Timer" mode only when `isTallySignedIn` is true (`MultiClock` passes `isAuthenticated` from `useTallyConnect()`; the portal WebSocket state is deliberately not used so a portal blip never blanks a timer). The cell takes a pasted Rundown display/share link (`lib/rundownTimer.ts` `parseRundownLink`), stores only the share token, and connects through the Tally proxy `wss://api.tallyconnect.app/rundown-timer?token=…` (one shared reconnecting socket per token, interpolated against `syncServerTime`). A saved Rundown cell while signed out shows "Sign in to Tally" and opens no socket. Never render the full token (use `maskRundownToken`).
- **Timer cells: start value and add/subtract.** Count Up has `countupStart` (seconds it counts up from; typed as `30:00`, `00:12:30`, `90`). Count Up, Countdown and Count To (with a target) share `timeAdjust` (seconds, +/-): quick +/-10s, 1m, 5m buttons on hover plus a typed amount in settings. Both live in `ClockCellConfig`, so they persist with the rest of the cell. Reset clears `timeAdjust` and returns Count Up to `countupStart`; picking a Countdown preset clears `timeAdjust`. Parsing/formatting lives in `lib/timerAdjust.ts`.

- **Timecode mode (`timecode`), Deity TC-1 first.** `ClockCell` has a **Tally sign-in only** (`isTallySignedIn`, same gate as `rundown`) "Timecode (Deity TC-1)" mode; a saved cell shows "Sign in to Tally" and never opens the mic or free-runs when signed out. Source-agnostic parts live in `src/lib/timecode/` (`timecode.ts` frame math incl. 29.97 DF, `jam.ts` jam collector + localStorage persistence, `sources.ts` source registry — add a new source (other LTC box, 50/60 fps, MTC, network) by adding an entry + an adapter branch in `src/hooks/useTimecodeCell.ts`). The only source today is the TC-1 over LTC audio: `getUserMedia` (echo cancellation / noise suppression / AGC off) → AudioWorklet decoder in `apps/clock/public/ltc-worklet.js` (plain JS on purpose: same-origin so CSP `script-src 'self'` allows it) → `src/lib/ltc/useLtcInput.ts`. The decoded word is +1 frame (a word is complete only when the next frame starts; proven in `ltcLatency.test.ts`). **Jam:** Jam button validates 48+ consecutive frames over ≥3 s, stores the wall-clock anchor + fps in localStorage (`tally-clock-tc-jam-v1`), then free-runs on `Date.now()` after the signal is gone; reload keeps it. `next.config.js` allows `microphone=(self)` ONLY on the clock routes. User setup: `apps/clock/LTC_HOOKUP.md`. E2E with a fake mic: `apps/clock/e2e/ltc.e2e.mjs` (run with `npx vite-node`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next landing site only, port 3000 |
| `npm run dev:clock` | Vite dev server for the clock SPA |
| `npm run dev:all` | Both, via concurrently |
| `npm run build` | Full production build (clock + next) |
| `npm run typecheck:clock` | `tsc --noEmit` against `apps/clock` |
| `npm test` | Vitest suite (top-level) |

## History

The clock used to live in `church-av/relay-server/public/tools/clock/` as a pre-built bundle. It was consolidated into this repo's `apps/clock/` in April 2026 so edits no longer require a two-repo deploy chain. If git history or old Slack messages reference `church-av/relay-server`, the source of truth is now here.
