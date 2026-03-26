import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Changelog — Tally',
  description: 'What\u2019s new in Tally. Release notes, bug fixes, and feature updates for the Tally desktop app and cloud platform.',
  openGraph: {
    title: 'Changelog — Tally',
    description: 'Release notes and updates for Tally Connect.',
    url: 'https://tallyconnect.app/changelog',
  },
};

const RELEASES = [
  {
    version: '1.0.2',
    date: 'March 26, 2026',
    tag: 'Latest',
    changes: [
      { type: 'new', text: 'Light mode toggle for the desktop app' },
      { type: 'new', text: 'Live viewer count widget on portal dashboard (YouTube, Facebook, Vimeo)' },
      { type: 'new', text: 'Clear all alerts button in portal and desktop app' },
      { type: 'new', text: 'Analytics date range: last 7 days + custom range picker' },
      { type: 'new', text: 'YouTube OAuth support for private/unlisted broadcast viewer counts' },
      { type: 'new', text: 'Token expiry alerts for Facebook and Vimeo' },
      { type: 'improved', text: 'Facebook API upgraded to v21.0' },
      { type: 'improved', text: 'Friendly input names in command responses (MP1, Color 1, etc.)' },
      { type: 'improved', text: 'ATEM-first routing for all switching commands when ATEM is connected' },
      { type: 'improved', text: 'Pre-service check no longer flags unconfigured gear as errors' },
      { type: 'improved', text: 'Collapsible sections in desktop app for cleaner default view' },
      { type: 'fixed', text: 'OBS no longer shows as "Disconnected" when not configured' },
      { type: 'fixed', text: 'Portal template rendering bug causing blank pages' },
      { type: 'fixed', text: 'AI chat now correctly routes "preview" commands to ATEM instead of OBS' },
      { type: 'fixed', text: 'Media Player commands (MP1, MP2) no longer prompt for image upload' },
    ],
  },
  {
    version: '1.0.1',
    date: 'March 24, 2026',
    tag: null,
    changes: [
      { type: 'new', text: 'App signed and notarized by Apple \u2014 no more Gatekeeper warnings' },
      { type: 'new', text: 'Audience analytics: YouTube, Facebook, and Vimeo concurrent viewer tracking' },
      { type: 'new', text: 'Offline action queue \u2014 chat messages queued when relay disconnects, auto-sent on reconnect' },
      { type: 'new', text: 'Encoder metrics support for AJA HELO, Epiphan, and RTMP push encoders' },
      { type: 'new', text: 'Multi-campus UX with health indicators and cross-campus summary' },
      { type: 'new', text: 'Analytics CSV export' },
      { type: 'new', text: 'AI Chat Onboarding \u2014 conversational guided setup for new churches' },
      { type: 'improved', text: 'Referral program: fixed code uniqueness, duplicate prevention, referrer name on signup' },
      { type: 'improved', text: 'Session recaps now include platform-specific viewer breakdowns' },
    ],
  },
  {
    version: '1.0.0',
    date: 'February 25, 2026',
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
