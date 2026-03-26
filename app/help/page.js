'use client';

import { useState, useMemo, useCallback } from 'react';
import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const q = search.toLowerCase().trim();

  const match = useCallback(
    (title) => !q || title.toLowerCase().includes(q),
    [q]
  );

  /* Check if any item in a category matches */
  const catMatch = useCallback(
    (titles) => !q || titles.some((t) => t.toLowerCase().includes(q)),
    [q]
  );

  const gettingStartedTitles = [
    'Your first 15 minutes with Tally',
    'Connecting your equipment',
    'Setting up your service schedule',
    'System requirements',
  ];
  const featuresTitles = [
    'Understanding alerts',
    'Signal failover explained',
    'Auto-recovery explained',
    'On-call TD rotation',
    'AI Autopilot rules',
    'Pre-service checks',
    'Session recaps',
    'Remote control',
    'Live video preview',
    'Setting up Bitfocus Companion with Tally',
    'Companion: recommended buttons for church production',
    'Reading device status through Companion variables',
  ];
  const troubleshootingTitles = [
    'Stream went down',
    'ATEM disconnected',
    'OBS not responding',
    'Audio issues detected',
    'Equipment offline between services',
    'Tally app not connecting to relay',
  ];
  const billingTitles = [
    'Managing your subscription',
    'Trial information',
    'Refund policy',
    'Does Tally work without an ATEM?',
    'Can I use Tally for a one-time event?',
    'What happens if my internet goes down?',
    'Is my video stream data stored?',
    'Can multiple TDs use Tally?',
    'What operating systems are supported?',
  ];

  const totalMatches = q
    ? [...gettingStartedTitles, ...featuresTitles, ...troubleshootingTitles, ...billingTitles].filter(
        (t) => t.toLowerCase().includes(q)
      ).length
    : 0;

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
          <div
          style={{
            marginTop: 14,
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: '40px 36px',
          }}
        >
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Help &amp; Support</h1>
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>
            Everything you need to get the most out of Tally.
          </p>

          {/* ── Search bar ── */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                background: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                color: WHITE,
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = GREEN; }}
              onBlur={(e) => { e.target.style.borderColor = BORDER; }}
            />
            {q && (
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: MUTED }}>
                {totalMatches} result{totalMatches !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* ── Category 1: Getting Started ── */}
          {catMatch(gettingStartedTitles) && <CategoryHeading>Getting Started</CategoryHeading>}

          <AccordionItem title="Your first 15 minutes with Tally" hidden={!match('Your first 15 minutes with Tally')}>
            <ol style={olStyle}>
              <li>Create your account at <a href="https://tallyconnect.app/signup" style={linkStyle}>tallyconnect.app/signup</a></li>
              <li>Choose your plan (30-day free trial included)</li>
              <li>Download the Tally desktop app from the portal</li>
              <li>Enter your registration code in the app</li>
              <li>The app auto-discovers your ATEM switcher, OBS, and other equipment</li>
              <li>Your church appears live on the dashboard within minutes</li>
            </ol>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              <a href="/tools/healthcheck/" style={linkStyle}>Run a free Production Health Check</a>
            </p>
          </AccordionItem>

          <AccordionItem title="Connecting your equipment" hidden={!match('Connecting your equipment')}>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: WHITE }}>ATEM Switcher</strong> — Tally auto-discovers ATEM on your network. Ensure the booth computer and ATEM are on the same subnet.
              </li>
              <li>
                <strong style={{ color: WHITE }}>OBS Studio</strong> — Enable the OBS WebSocket server (Tools &rarr; WebSocket Server Settings). Tally connects automatically on port 4455.
              </li>
              <li>
                <strong style={{ color: WHITE }}>vMix</strong> — Enable vMix Web Controller in Settings &rarr; Web Controller. Tally connects via the API port.
              </li>
              <li>
                <strong style={{ color: WHITE }}>ProPresenter</strong> <span style={badgeStyle}>Plus+</span> — Enable Network API in ProPresenter preferences. Tally connects on port 1025.
              </li>
              <li>
                <strong style={{ color: WHITE }}>Companion</strong> <span style={badgeStyle}>Plus+</span> — Companion web UI runs on port 8000 by default. Tally connects via the Companion HTTP API.
              </li>
              <li>
                <strong style={{ color: WHITE }}>Audio Consoles</strong> <span style={badgeStyle}>Plus+</span> — X32/M32 via network OSC. Allen &amp; Heath/Yamaha via MIDI or network.
              </li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Setting up your service schedule" hidden={!match('Setting up your service schedule')}>
            <p style={paraStyle}>
              Service windows tell Tally when your services happen. This affects:
            </p>
            <ul style={ulStyle}>
              <li>When alerts are sent (non-emergency alerts only fire during services)</li>
              <li>When pre-service checks run (25-35 min before)</li>
              <li>When session recaps are generated</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Set your schedule in the Church Portal under the <strong style={{ color: WHITE }}>Schedule</strong> tab.
            </p>
          </AccordionItem>

          <AccordionItem title="System requirements" hidden={!match('System requirements')}>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: WHITE }}>Operating system</strong> — Windows 10/11 or macOS 12+ (Monterey or later)
              </li>
              <li>
                <strong style={{ color: WHITE }}>Network</strong> — The booth computer and all monitored devices must be on the same local network (same subnet recommended)
              </li>
              <li>
                <strong style={{ color: WHITE }}>Internet</strong> — Stable broadband connection required for remote monitoring, alerts, and relay communication
              </li>
              <li>
                <strong style={{ color: WHITE }}>Ports</strong> — Outbound HTTPS (443) and WSS (443) must not be blocked by firewall
              </li>
              <li>
                <strong style={{ color: WHITE }}>CPU / RAM</strong> — Minimal footprint. Tally runs alongside OBS, vMix, or ProPresenter without noticeable impact
              </li>
            </ul>
          </AccordionItem>

          {/* ── Category 2: Features ── */}
          {catMatch(featuresTitles) && <CategoryHeading>Features</CategoryHeading>}

          <AccordionItem title="Understanding alerts" hidden={!match('Understanding alerts')}>
            <p style={paraStyle}>Tally classifies alerts by severity:</p>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: GREEN }}>INFO</strong> <span style={{ color: DIM }}>(green)</span> — Stream started, recording confirmed. Logged only, no notification.
              </li>
              <li>
                <strong style={{ color: '#eab308' }}>WARNING</strong> <span style={{ color: DIM }}>(yellow)</span> — Low FPS, low bitrate, single device disconnect. Sent to on-call TD.
              </li>
              <li>
                <strong style={{ color: '#ef4444' }}>CRITICAL</strong> <span style={{ color: DIM }}>(red)</span> — Stream stopped, ATEM disconnected, recording failed. Sent to on-call TD, escalates after 5 minutes if unacknowledged.
              </li>
              <li>
                <strong style={{ color: '#ef4444' }}>EMERGENCY</strong> <span style={{ color: DIM }}>(red flash)</span> — Multiple systems down, no TD response. Immediately escalated.
              </li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Acknowledge alerts via Telegram with <code style={codeStyle}>/ack_[code]</code> or from the portal alerts tab.
            </p>
          </AccordionItem>

          <AccordionItem title="Signal failover explained" hidden={!match('Signal failover explained')}>
            <p style={paraStyle}>
              Signal failover detects when a video source dies and automatically switches to a safe backup source — like a trained AV engineer sitting at the booth.
            </p>
            <p style={{ ...paraStyle, marginTop: 12 }}><strong style={{ color: WHITE }}>How it works:</strong></p>
            <ol style={olStyle}>
              <li>Tally correlates multiple signals (encoder bitrate, ATEM connection, audio levels) to diagnose the problem</li>
              <li>If video loss is confirmed, your TD gets a Telegram alert with a diagnosis and an ack window</li>
              <li>If no one acknowledges in time, Tally switches to your configured safe source (e.g., a wide shot or holding slide)</li>
              <li>When the original source recovers, Tally watches it for 10 seconds to verify stability before switching back</li>
            </ol>
            <p style={{ ...paraStyle, marginTop: 12 }}><strong style={{ color: WHITE }}>Diagnosis types:</strong></p>
            <ul style={ulStyle}>
              <li><strong style={{ color: WHITE }}>Source dead</strong> — Camera or feed failed, ATEM still connected. Auto-switch to safe source.</li>
              <li><strong style={{ color: WHITE }}>Network outage</strong> — Both ATEM and encoder down. Switching won{"'"}t help — alerts TD instead.</li>
              <li><strong style={{ color: WHITE }}>Cascading failure</strong> — Video and audio both dead. Skips the wait timer and escalates immediately.</li>
              <li><strong style={{ color: WHITE }}>Audio only</strong> — Sustained silence detected. Alerts TD without auto-switching (could be a quiet moment).</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Configure failover in the Equipment tab of the desktop app. Available on Plus, Pro, and Enterprise plans.
            </p>
          </AccordionItem>

          <AccordionItem title="Auto-recovery explained" hidden={!match('Auto-recovery explained')}>
            <p style={paraStyle}>
              Auto-recovery handles software and stream failures — things that can be fixed by restarting or adjusting settings. This is different from <strong style={{ color: WHITE }}>Signal Failover</strong>, which handles hardware/source failures by switching to a safe input.
            </p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              When Tally detects certain failures, it attempts to fix them automatically before alerting you:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: WHITE }}>Stream stopped</strong> — Waits 10 seconds, then commands OBS to restart the stream (up to 2 attempts).
              </li>
              <li>
                <strong style={{ color: WHITE }}>Low FPS</strong> — Reduces OBS bitrate by 20% to stabilize.
              </li>
              <li>
                <strong style={{ color: WHITE }}>Recording not started</strong> — Commands ATEM to start recording.
              </li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              If auto-recovery succeeds, you will see a green note in your session recap. If it fails, Tally sends an alert with diagnosis steps.
            </p>
            <p style={{ ...paraStyle, marginTop: 12, fontSize: 13, color: '#9ca3af' }}>
              <strong style={{ color: WHITE }}>Auto-recovery vs Signal Failover:</strong> Auto-recovery restarts streams, adjusts bitrate, and starts recordings — fixing software-level issues. Signal Failover detects when a video source itself has died (black screen, camera offline) and switches your ATEM, VideoHub, or OBS to a safe backup input. Both can work together.
            </p>
          </AccordionItem>

          <AccordionItem title="On-call TD rotation" hidden={!match('On-call TD rotation')}>
            <p style={paraStyle}>On-call routing ensures alerts reach the right person:</p>
            <ol style={olStyle}>
              <li>Add your tech directors in the Portal (Tech Directors tab) with their Telegram accounts</li>
              <li>Set a primary TD — they are the default contact</li>
              <li>Assign weekly on-call via Telegram or the portal</li>
              <li>During services, alerts route to whoever is on-call that week</li>
              <li>If no response in 5 minutes, Tally escalates to the primary TD</li>
              <li>TDs can swap duty via Telegram: send <code style={codeStyle}>/swap [name]</code>, the other TD confirms with <code style={codeStyle}>/confirmswap</code></li>
            </ol>
          </AccordionItem>

          <AccordionItem title="AI Autopilot rules" hidden={!match('AI Autopilot rules')}>
            <p style={paraStyle}>
              <span style={badgeStyleAlt}>Pro</span> <span style={badgeStyleAlt}>Enterprise</span> — Create automation rules that run during services. Three trigger types:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: WHITE }}>Slide change</strong> — Fires when a ProPresenter slide matches a pattern. Example: &ldquo;When presentation name contains &lsquo;Worship&rsquo;, switch to camera 1.&rdquo;
              </li>
              <li>
                <strong style={{ color: WHITE }}>Schedule timer</strong> — Fires X minutes into the service window. Example: &ldquo;10 minutes in, start recording.&rdquo;
              </li>
              <li>
                <strong style={{ color: WHITE }}>Equipment state</strong> — Fires when equipment matches a condition. Example: &ldquo;When OBS starts streaming, unmute audio master.&rdquo;
              </li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Limits: Pro tier can have up to 10 rules, Enterprise up to 25. Each rule fires at most once per service session.
            </p>
          </AccordionItem>

          <AccordionItem title="Pre-service checks" hidden={!match('Pre-service checks')}>
            <p style={paraStyle}>
              25-35 minutes before each scheduled service, Tally automatically checks:
            </p>
            <ul style={ulStyle}>
              <li>ATEM connection</li>
              <li>Camera inputs</li>
              <li>OBS connection + stream state</li>
              <li>Companion status</li>
              <li>ProPresenter status</li>
              <li>vMix status</li>
              <li>Audio console status</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Results are sent to the on-call TD with a green-light or issues list.
            </p>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              <a href="/tools/checklist/" style={linkStyle}>Try our free Pre-Service Checklist tool</a>
            </p>
          </AccordionItem>

          <AccordionItem title="Session recaps" hidden={!match('Session recaps')}>
            <p style={paraStyle}>After each service, Tally generates a recap including:</p>
            <ul style={ulStyle}>
              <li><strong style={{ color: WHITE }}>Grade</strong> — Clean (no issues), Minor (auto-resolved), or Intervention needed (required manual action)</li>
              <li>Alert count</li>
              <li>Auto-recovery count</li>
              <li>Stream runtime</li>
              <li>Peak concurrent viewers</li>
              <li>Recording status</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Recaps are sent via Telegram and stored in the portal.
            </p>
          </AccordionItem>

          <AccordionItem title="Remote control" hidden={!match('Remote control')}>
            <p style={paraStyle}>
              Send commands to your equipment from anywhere:
            </p>
            <ul style={ulStyle}>
              <li>Cut/transition cameras</li>
              <li>Start/stop streams</li>
              <li>Change OBS scenes</li>
              <li>Advance ProPresenter slides</li>
              <li>Trigger looks &amp; timers</li>
              <li>Control audio faders</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Available via the Tally admin dashboard and Telegram bot.
            </p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              <strong style={{ color: WHITE }}>Connect tier:</strong> ATEM, OBS, vMix commands only.{' '}
              <strong style={{ color: WHITE }}>Plus+:</strong> All devices including ProPresenter, Companion, Resolume, audio.
            </p>
          </AccordionItem>

          <AccordionItem title="Live video preview" hidden={!match('Live video preview')}>
            <p style={paraStyle}>
              <span style={{ ...badgeStyleAlt, background: 'rgba(234,179,8,0.12)', borderColor: 'rgba(234,179,8,0.3)', color: '#eab308' }}>COMING SOON</span> — Live video preview requires a Tally Box hardware encoder connected to your ATEM aux output. The Tally Box hardware is currently in development.
            </p>
            <ul style={ulStyle}>
              <li>Will stream approximately 3 Mbps H.264 over a secure relay connection</li>
              <li>Accessible from any browser — no special software needed on the viewing end</li>
              <li>Preview frames will be transient and never stored on our servers</li>
              <li>Sign up to be notified when Tally Box hardware is available</li>
            </ul>
          </AccordionItem>

          {/* ── Category 3: Troubleshooting ── */}
          {catMatch(troubleshootingTitles) && <CategoryHeading>Troubleshooting</CategoryHeading>}

          <AccordionItem title="Stream went down" hidden={!match('Stream went down')}>
            <ol style={olStyle}>
              <li>Tally auto-recovery will attempt to restart the stream (waits 10s, then sends restart command)</li>
              <li>
                If auto-recovery fails, check:
                <ul style={{ ...ulStyle, marginTop: 6 }}>
                  <li>Is OBS still running?</li>
                  <li>Is your internet connection stable?</li>
                  <li>Is your stream key still valid?</li>
                </ul>
              </li>
              <li>Try restarting the stream from Tally&rsquo;s remote control (click Start Streaming)</li>
              <li>If the issue persists, restart OBS and try again</li>
              <li>Check your streaming platform (YouTube/Facebook) for any service issues</li>
            </ol>
          </AccordionItem>

          <AccordionItem title="ATEM disconnected" hidden={!match('ATEM disconnected')}>
            <p style={paraStyle}>Common causes:</p>
            <ul style={ulStyle}>
              <li>ATEM IP address changed (check ATEM Setup utility)</li>
              <li>Network cable unplugged</li>
              <li>ATEM powered off or rebooting</li>
              <li>Booth computer lost network</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              <strong style={{ color: WHITE }}>Fix:</strong> Verify the ATEM is powered on and reachable, check network cables, confirm the IP address in Tally settings matches ATEM.
            </p>
          </AccordionItem>

          <AccordionItem title="OBS not responding" hidden={!match('OBS not responding')}>
            <p style={paraStyle}>Causes: OBS crashed, WebSocket server disabled, port conflict.</p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              <strong style={{ color: WHITE }}>Fix:</strong> Check if OBS is running on the booth computer, verify WebSocket server is enabled (Tools &rarr; WebSocket Server Settings), restart OBS if needed, check that port 4455 is not blocked.
            </p>
          </AccordionItem>

          <AccordionItem title="Audio issues detected" hidden={!match('Audio issues detected')}>
            <p style={paraStyle}>
              Tally can detect audio silence during streams. Causes: mixer master muted, audio routing misconfigured, cable disconnected.
            </p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              <strong style={{ color: WHITE }}>Fix:</strong> Check mixer master fader and mute status, verify audio routing from mixer to OBS/stream encoder, check physical cable connections.
            </p>
          </AccordionItem>

          <AccordionItem title="Equipment offline between services" hidden={!match('Equipment offline between services')}>
            <p style={paraStyle}>
              If Tally reports equipment offline outside service hours, common causes:
            </p>
            <ul style={ulStyle}>
              <li>Booth computer went to sleep (disable sleep in power settings)</li>
              <li>Computer was shut down</li>
              <li>Network connectivity issue</li>
              <li>Power outage</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Tally will automatically reconnect when the equipment comes back online.
            </p>
          </AccordionItem>

          <AccordionItem title="Tally app not connecting to relay" hidden={!match('Tally app not connecting to relay')}>
            <p style={paraStyle}>If the Tally desktop app shows &ldquo;Disconnected&rdquo; or &ldquo;Relay unreachable&rdquo;:</p>
            <ol style={olStyle}>
              <li>Check your internet connection — the app needs outbound HTTPS/WSS on port 443</li>
              <li>Verify your registration code is correct in the app settings</li>
              <li>Check if your firewall or corporate network blocks WebSocket connections</li>
              <li>Try restarting the Tally app</li>
              <li>If the issue persists, check our status page for any service disruptions</li>
            </ol>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              <strong style={{ color: WHITE }}>Note:</strong> Local monitoring and auto-recovery continue to work even while the relay is unreachable. Only remote access and alert delivery are affected.
            </p>
          </AccordionItem>

          {/* ── Category 4: Billing & Account ── */}
          {catMatch(billingTitles) && <CategoryHeading>Billing &amp; Account</CategoryHeading>}

          <AccordionItem title="Managing your subscription" hidden={!match('Managing your subscription')}>
            <p style={paraStyle}>
              Manage your subscription from the Church Portal Billing tab. You can:
            </p>
            <ul style={ulStyle}>
              <li>View your current plan and billing status</li>
              <li>Upgrade or downgrade your plan</li>
              <li>Update your payment method</li>
              <li>View invoice history</li>
              <li>Cancel your subscription</li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              All billing is handled through Stripe&rsquo;s secure customer portal.
            </p>
          </AccordionItem>

          <AccordionItem title="Trial information" hidden={!match('Trial information')}>
            <p style={paraStyle}>
              Every new account starts with a 30-day free trial of your selected plan.
            </p>
            <ul style={ulStyle}>
              <li>Full access to all features in your tier during the trial</li>
              <li>No credit card required to start (but needed before trial ends)</li>
              <li>When your trial ends, subscribe to continue or your service will be paused</li>
              <li>Data is retained for 30 days after trial expiration</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Refund policy" hidden={!match('Refund policy')}>
            <p style={paraStyle}>
              Cancel anytime — your service continues through the end of the current billing period. We do not offer refunds for partial months. If you are unhappy with Tally, cancel before your next billing date.
            </p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              Contact <a href="mailto:support@tallyconnect.app" style={linkStyle}>support@tallyconnect.app</a> with any billing questions.
            </p>
          </AccordionItem>

          <AccordionItem title="Does Tally work without an ATEM?" hidden={!match('Does Tally work without an ATEM?')}>
            <p style={paraStyle}>
              Yes. Tally supports OBS-only and vMix-only setups. The ATEM integration provides the richest feature set (camera switching, recording control, HyperDeck), but OBS and vMix monitoring, auto-recovery, and remote control all work independently.
            </p>
          </AccordionItem>

          <AccordionItem title="Can I use Tally for a one-time event?" hidden={!match('Can I use Tally for a one-time event?')}>
            <p style={paraStyle}>
              Yes — the Event tier ($99 one-time) provides 72-hour monitoring for conferences, Easter services, weddings, or any special event. No subscription required.
            </p>
          </AccordionItem>

          <AccordionItem title="What happens if my internet goes down?" hidden={!match('What happens if my internet goes down?')}>
            <p style={paraStyle}>
              The Tally desktop client stores status locally and reconnects automatically when internet is restored. Any queued commands from remote control will replay. Local monitoring and auto-recovery continue working even without internet.
            </p>
          </AccordionItem>

          <AccordionItem title="Is my video stream data stored?" hidden={!match('Is my video stream data stored?')}>
            <p style={paraStyle}>
              No. Tally monitors stream health metrics (bitrate, FPS, connection status) but does not record or store your video content. Preview frames are transient and not persisted.
            </p>
          </AccordionItem>

          <AccordionItem title="Can multiple TDs use Tally?" hidden={!match('Can multiple TDs use Tally?')}>
            <p style={paraStyle}>
              Yes. Add multiple tech directors in the portal. Use guest tokens to give other TDs app access. On-call rotation ensures the right person gets alerts. The Telegram bot supports multiple users.
            </p>
          </AccordionItem>

          <AccordionItem title="What operating systems are supported?" hidden={!match('What operating systems are supported?')}>
            <p style={paraStyle}>
              The Tally desktop app runs on Windows 10/11 and macOS 12+ (Monterey and later). The web dashboard and church portal work in any modern browser (Chrome, Firefox, Safari, Edge). The Telegram bot works on any platform that supports Telegram.
            </p>
          </AccordionItem>

          {/* ── No results ── */}
          {q && totalMatches === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: MUTED, fontSize: 15, marginBottom: 12 }}>
                No results for &ldquo;{search}&rdquo;
              </p>
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  color: GREEN,
                  padding: '8px 16px',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Clear search
              </button>
            </div>
          )}

          {/* ── Still need help? ── */}
          <div
            style={{
              marginTop: 40,
              padding: '28px 24px',
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Still need help?</h2>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              Reach us at{' '}
              <a href="mailto:support@tallyconnect.app" style={linkStyle}>
                support@tallyconnect.app
              </a>
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <ResponseBadge tier="Connect" time="48 hr" />
              <ResponseBadge tier="Plus+" time="24 hr" />
              <ResponseBadge tier="Pro" time="12 hr" />
              <ResponseBadge tier="Enterprise" time="15 min" note="Mon-Fri 9-5 ET + service windows" />
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}

/* ── Subcomponents ── */

function CategoryHeading({ children }) {
  return (
    <h2
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: GREEN,
        marginTop: 36,
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {children}
    </h2>
  );
}

function AccordionItem({ title, children, hidden }) {
  const [open, setOpen] = useState(false);
  if (hidden) return null;
  return (
    <div
      style={{
        borderBottom: `1px solid ${BORDER}`,
        marginBottom: 0,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          padding: '14px 0',
          cursor: 'pointer',
          color: WHITE,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <span>{title}</span>
        <span
          style={{
            fontSize: 18,
            color: DIM,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 16,
            color: MUTED,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function ResponseBadge({ tier, time, note }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 12, color: DIM, marginBottom: 2 }}>{tier}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>{time}</div>
      {note && <div style={{ fontSize: 10, color: DIM, marginTop: 2 }}>{note}</div>}
    </div>
  );
}

/* ── Shared inline style objects ── */

const linkStyle = { color: GREEN, textDecoration: 'none' };

const ulStyle = {
  margin: '8px 0 0',
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const olStyle = {
  margin: '8px 0 0',
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const paraStyle = {
  margin: 0,
};

const codeStyle = {
  background: '#1a2e1f',
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: 13,
  fontFamily: 'monospace',
  color: GREEN,
};

const badgeStyle = {
  display: 'inline-block',
  fontSize: 10,
  fontWeight: 700,
  color: GREEN,
  background: '#0d2818',
  border: `1px solid ${BORDER}`,
  borderRadius: 4,
  padding: '1px 6px',
  marginLeft: 4,
  verticalAlign: 'middle',
};

const badgeStyleAlt = {
  display: 'inline-block',
  fontSize: 10,
  fontWeight: 700,
  color: GREEN,
  background: '#0d2818',
  border: `1px solid ${BORDER}`,
  borderRadius: 4,
  padding: '1px 6px',
  marginRight: 4,
  verticalAlign: 'middle',
};
