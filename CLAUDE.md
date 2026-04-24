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
