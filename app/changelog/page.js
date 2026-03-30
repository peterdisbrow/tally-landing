import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Changelog \u2014 Tally',
  description: 'What\u2019s new in Tally. Release notes, bug fixes, and feature updates for the Tally desktop app and cloud platform.',
  openGraph: {
    title: 'Changelog \u2014 Tally',
    description: 'Release notes and updates for Tally Connect.',
    url: 'https://tallyconnect.app/changelog',
  },
};

const RELEASES = [
  {
    version: '1.1.37',
    date: 'March 29, 2026',
    tag: 'Latest',
    changes: [
      { type: 'new', text: 'Equipment configuration page in the portal \u2014 forms for ATEM, OBS, mixer, encoder, PTZ, Companion, ProPresenter, vMix, Resolume, HyperDecks, and VideoHubs' },
      { type: 'new', text: 'Ingest stream key display with copy and regenerate on Equipment tab' },
      { type: 'new', text: 'AI memory summary display on the Tally Engineer page' },
      { type: 'new', text: 'Timezone dropdown and church type toggle (recurring/event) on Profile page' },
      { type: 'new', text: 'Recovery-outside-service-hours toggle on Alerts Preferences' },
      { type: 'improved', text: 'Portal sidebar consolidated from 18 to 11 nav items with tabbed sub-navigation' },
      { type: 'improved', text: 'Rooms-first architecture \u2014 campus model replaced with rooms under a single login' },
      { type: 'improved', text: 'Config sync between portal Equipment settings and the desktop app' },
      { type: 'fixed', text: 'Encoder metrics (CPU, congestion, details) now display in portal equipment cards' },
      { type: 'fixed', text: 'vMix and VideoHub card rendering added; HyperDeck naming corrected' },
      { type: 'fixed', text: 'Room ID gap on reconnect eliminated by sending room_id at connect time' },
      { type: 'fixed', text: 'Exponential backoff with jitter added to relay reconnection' },
      { type: 'fixed', text: 'npm audit vulnerabilities resolved across all packages' },
    ],
  },
  {
    version: '1.1.35',
    date: 'March 28, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'Windows exe published to GitHub Releases for auto-update' },
      { type: 'new', text: 'CDN stream verification \u2014 relay confirms YouTube and Facebook are receiving the stream after encoder starts, fires critical alert if not' },
      { type: 'new', text: 'Audio level monitoring broadened to vMix and any encoder, with level tracking' },
      { type: 'new', text: 'Windows installer build via GitHub Actions' },
      { type: 'fixed', text: 'Mark Fixed button now transitions issues to GO state instead of just clearing them' },
      { type: 'fixed', text: 'Allen & Heath SQ mixer connection reset prevented on initial state query' },
      { type: 'fixed', text: 'Smart parser "stop stream" now defaults to encoder when device status is unavailable' },
    ],
  },
  {
    version: '1.1.33',
    date: 'March 28, 2026',
    tag: null,
    changes: [
      { type: 'fixed', text: 'HyperDeck false positives eliminated \u2014 scanner now validates with protocol banner' },
      { type: 'fixed', text: 'ProPresenter scan falls back to /v1/status/slide if /v1/version fails' },
      { type: 'fixed', text: 'Encoder status reads streaming/fps/bitrate from nested status object correctly' },
      { type: 'fixed', text: 'Identity log spam eliminated \u2014 streaming duration stripped before dedup cache check' },
      { type: 'fixed', text: 'Problem Finder false positives fixed for encoder and Companion' },
      { type: 'improved', text: '"Blackmagic" renamed to "Streaming Encoder" in display labels' },
      { type: 'improved', text: 'Import/Export Config buttons removed (config is server-side now)' },
    ],
  },
  {
    version: '1.1.32',
    date: 'March 28, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'RTMP stream analytics \u2014 bitrate, resolution, FPS, and codec parsed and exposed via API' },
      { type: 'new', text: 'Direct HLS serving with short-lived HMAC signed tokens, bypassing Vercel proxy' },
      { type: 'new', text: 'Full ATEM recording controls \u2014 start/stop recording and disk status' },
      { type: 'new', text: 'Device-specific AI rules so Tally Engineer executes commands directly' },
      { type: 'new', text: 'YouTube OAuth "Change Account" button with current account name display' },
      { type: 'fixed', text: 'Node-Media-Server event handlers updated for v4.x API' },
      { type: 'fixed', text: 'Smoother HLS playback with larger segment buffer and atomic file writes' },
      { type: 'fixed', text: 'Grey status dots shown during startup instead of misleading red' },
      { type: 'fixed', text: 'Network scanner finds Companion and ProPresenter on real local IP, not just 127.0.0.1' },
    ],
  },
  {
    version: '1.1.27',
    date: 'March 28, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'Facebook OAuth "Change Page" button and personal account streaming support' },
      { type: 'new', text: 'SSE-based device status stream from relay to desktop app \u2014 faster, more reliable monitoring' },
      { type: 'new', text: 'Collapsible toggles on all status page sections' },
      { type: 'new', text: 'ProPresenter pill added to the status bar' },
      { type: 'fixed', text: 'Ghost Videohub and false-positive scan results eliminated' },
      { type: 'fixed', text: 'YouTube OAuth uses relay-redirect flow instead of localhost loopback' },
      { type: 'fixed', text: 'YouTube/Facebook OAuth client IDs fetched from relay server (not hardcoded)' },
      { type: 'fixed', text: 'Unconfigured device pills hidden from status bar' },
      { type: 'fixed', text: 'STATUS_JSON stdout spam removed \u2014 status delivered via relay SSE' },
      { type: 'fixed', text: 'Infinite WebSocket replacement loop stopped on the relay server' },
    ],
  },
  {
    version: '1.1.21',
    date: 'March 28, 2026',
    tag: null,
    changes: [
      { type: 'fixed', text: 'ProPresenter 21 integration rewritten to match proven Tally Clicker patterns for rock-solid stability' },
      { type: 'fixed', text: 'ProPresenter slide data now updates correctly during polling' },
      { type: 'fixed', text: 'ProPresenter 21.x compatibility \u2014 replaced WebSocket with REST API polling to match the new PP protocol' },
      { type: 'improved', text: 'Tally Engineer AI updated with ProPresenter 21.x version rebranding knowledge' },
    ],
  },
  {
    version: '1.1.10',
    date: 'March 27, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'PTZ camera controls promoted to core \u2014 no longer requires a Plus plan' },
      { type: 'new', text: 'Factory reset option in desktop app settings' },
      { type: 'improved', text: 'Room and campus picker moved to the header bar for quicker switching' },
      { type: 'improved', text: 'Removed NDI and Dante integrations (deprecated upstream)' },
      { type: 'improved', text: 'Quick chat bar replaced by the full Tally Engineer panel' },
      { type: 'fixed', text: 'Apple Silicon click regression \u2014 corrected traffic light positioning and pointer events on arm64 Macs' },
    ],
  },
  {
    version: '1.1.7',
    date: 'March 27, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'Resolume Arena added to Equipment Status in the Church Portal' },
      { type: 'new', text: 'Room selector always visible in the desktop app' },
      { type: 'new', text: 'Diagnostic bundle command for one-click support diagnostics' },
      { type: 'fixed', text: 'Reconnect storm stopped \u2014 relay close handler guarded to prevent stale connections from resetting church state' },
      { type: 'fixed', text: 'Relay latency climb caused by stale pong timeouts in heartbeat loop' },
      { type: 'fixed', text: 'Status reporting race conditions fixed across ProPresenter, vMix, Companion, Mixer, and Encoder' },
      { type: 'fixed', text: 'ProPresenter slide numbers now display correctly (1-based) in AI context and diagnostics' },
      { type: 'fixed', text: 'Six Telegram bot bugs \u2014 status reporting, slide indexing, and last-slide navigation' },
      { type: 'fixed', text: 'Resolume device detection now uses reliable GET-based status checks' },
      { type: 'fixed', text: 'VideoHub false-positive scan results eliminated' },
    ],
  },
  {
    version: '1.1.2',
    date: 'March 27, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'Tally Engineer AI \u2014 diagnostics powered by Sonnet, proactive memory, and incident chain analysis' },
      { type: 'new', text: 'AutoPilot alert triggers and smart automation rule suggestions' },
      { type: 'new', text: 'Companion deep integration \u2014 variables, watch system, device profiles, and setup guide' },
      { type: 'new', text: 'Volunteer Mode (renamed from Lite Mode) with light theme improvements' },
      { type: 'fixed', text: 'CSP inline handler violations resolved across the portal' },
      { type: 'fixed', text: 'Pre-service readiness crash when device data is null' },
      { type: 'fixed', text: 'Accessibility improvements for arm64 \u2014 aria-live and modal fixes' },
      { type: 'fixed', text: 'Memory leak and logic errors in five components' },
    ],
  },
  {
    version: '1.1.0',
    date: 'March 26, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'Launch support workflow in Church Portal \u2014 diagnostics, triage, and ticket management' },
      { type: 'new', text: 'Internationalization (i18n), netmask auto-detect, deep links, and Windows arm64 support' },
      { type: 'new', text: 'What\u2019s New splash screen on first launch after updates' },
      { type: 'new', text: 'Portable config export/import for multi-campus deployments' },
      { type: 'improved', text: 'Billing and lifecycle hardening \u2014 plan gates, Stripe wiring, autopilot and incident flows' },
      { type: 'improved', text: 'Stabilized reseller and event route behavior' },
      { type: 'fixed', text: 'Full codebase security audit fixes' },
      { type: 'fixed', text: 'Removed unsafe-inline CSP \u2014 migrated portal to event delegation' },
    ],
  },
  {
    version: '1.0.1',
    date: 'March 22, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'App signed and notarized by Apple \u2014 no more Gatekeeper warnings' },
      { type: 'new', text: 'Audience analytics: YouTube, Facebook, and Vimeo concurrent viewer tracking' },
      { type: 'new', text: 'Live viewer count widget on portal dashboard' },
      { type: 'new', text: 'YouTube OAuth support for private/unlisted broadcast viewer counts' },
      { type: 'new', text: 'Offline action queue \u2014 chat messages queued when relay disconnects, auto-sent on reconnect' },
      { type: 'new', text: 'Encoder metrics support for AJA HELO, Epiphan, and RTMP push encoders' },
      { type: 'new', text: 'Analytics CSV export and date range picker' },
      { type: 'new', text: 'AI Chat Onboarding \u2014 conversational guided setup for new churches' },
      { type: 'improved', text: 'Facebook API upgraded to v21.0 with token expiry alerts' },
      { type: 'improved', text: 'ATEM-first routing for all switching commands' },
      { type: 'improved', text: 'Collapsible sections in desktop app for cleaner default view' },
      { type: 'fixed', text: 'OBS no longer shows as "Disconnected" when not configured' },
      { type: 'fixed', text: 'AI chat now correctly routes "preview" commands to ATEM instead of OBS' },
    ],
  },
  {
    version: '1.0.0',
    date: 'February 22, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'Initial release of Tally desktop app' },
      { type: 'new', text: 'ATEM switcher monitoring and remote control' },
      { type: 'new', text: 'OBS and vMix integration' },
      { type: 'new', text: 'Stream health monitoring with auto-recovery' },
      { type: 'new', text: 'AI-powered natural language commands' },
      { type: 'new', text: 'Church portal with analytics, sessions, and alerts' },
      { type: 'new', text: 'Telegram and Slack alerting' },
      { type: 'new', text: 'Planning Center sync and write-back' },
      { type: 'new', text: 'Pre-service automated system check' },
      { type: 'new', text: 'Signal failover with auto-switch' },
    ],
  },
];

const typeBadge = (type) => {
  const colors = {
    new: { bg: '#16532e', text: '#4ade80', label: 'New' },
    improved: { bg: '#1e3a5f', text: '#60a5fa', label: 'Improved' },
    fixed: { bg: '#5c2d0e', text: '#fb923c', label: 'Fixed' },
  };
  const c = colors[type] || colors.new;
  return { background: c.bg, color: c.text, label: c.label };
};

export default function ChangelogPage() {
  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: '100vh',
          background: BG,
          color: WHITE,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          paddingTop: 80,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, marginTop: 20 }}>Changelog</h1>
          <p style={{ color: MUTED, fontSize: 14, marginBottom: 40 }}>
            What&apos;s new in Tally. All releases, features, and fixes.
          </p>

          {RELEASES.map((release, i) => (
            <div
              key={release.version}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '28px 32px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 22, fontWeight: 700 }}>v{release.version}</span>
                {release.tag && (
                  <span
                    style={{
                      background: GREEN,
                      color: '#000',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                    }}
                  >
                    {release.tag}
                  </span>
                )}
                <span style={{ color: MUTED, fontSize: 13, marginLeft: 'auto' }}>{release.date}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {release.changes.map((change, j) => {
                  const badge = typeBadge(change.type);
                  return (
                    <li
                      key={j}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '6px 0',
                        borderTop: j > 0 ? `1px solid ${BORDER}` : 'none',
                      }}
                    >
                      <span
                        style={{
                          background: badge.background,
                          color: badge.color,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          marginTop: 2,
                        }}
                      >
                        {badge.label}
                      </span>
                      <span style={{ fontSize: 14, color: '#cbd5e1' }}>{change.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
