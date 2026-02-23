'use client';

import { useState } from 'react';

const BG = '#09090B';
const CARD = '#0F1613';
const BORDER = '#1a2e1f';
const GREEN = '#22c55e';
const WHITE = '#F8FAFC';
const MUTED = '#94A3B8';
const DIM = '#475569';

export default function HelpPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: BG,
        color: WHITE,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        padding: '48px 20px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <a href="/" style={{ color: MUTED, textDecoration: 'none', fontSize: 13 }}>
          &larr; Back to Home
        </a>

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
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 32 }}>
            Everything you need to get the most out of Tally.
          </p>

          {/* ── Category 1: Getting Started ── */}
          <CategoryHeading>Getting Started</CategoryHeading>

          <AccordionItem title="Your first 15 minutes with Tally">
            <ol style={olStyle}>
              <li>Create your account at <a href="https://tally.atemschool.com/signup" style={linkStyle}>tally.atemschool.com/signup</a></li>
              <li>Choose your plan (30-day free trial included)</li>
              <li>Download the Tally desktop app from the portal</li>
              <li>Enter your registration code in the app</li>
              <li>The app auto-discovers your ATEM switcher, OBS, and other equipment</li>
              <li>Your church appears live on the dashboard within minutes</li>
            </ol>
          </AccordionItem>

          <AccordionItem title="Connecting your equipment">
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
                <strong style={{ color: WHITE }}>Companion</strong> <span style={badgeStyle}>Plus+</span> — Tally uses the Companion HTTP API on port 8000.
              </li>
              <li>
                <strong style={{ color: WHITE }}>Audio Consoles</strong> <span style={badgeStyle}>Plus+</span> — X32/M32 via network OSC. Allen &amp; Heath/Yamaha via MIDI or network.
              </li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Setting up your service schedule">
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

          {/* ── Category 2: Features ── */}
          <CategoryHeading>Features</CategoryHeading>

          <AccordionItem title="Understanding alerts">
            <p style={paraStyle}>Tally classifies alerts by severity:</p>
            <ul style={ulStyle}>
              <li>
                <strong style={{ color: GREEN }}>INFO</strong> <span style={{ color: DIM }}>(green)</span> — Stream started, recording confirmed. Logged only, no notification.
              </li>
              <li>
                <strong style={{ color: '#eab308' }}>WARNING</strong> <span style={{ color: DIM }}>(yellow)</span> — Low FPS, low bitrate, single device disconnect. Sent to on-call TD.
              </li>
              <li>
                <strong style={{ color: '#ef4444' }}>CRITICAL</strong> <span style={{ color: DIM }}>(red)</span> — Stream stopped, ATEM disconnected, recording failed. Sent to on-call TD, escalates after 90 seconds if unacknowledged.
              </li>
              <li>
                <strong style={{ color: '#ef4444' }}>EMERGENCY</strong> <span style={{ color: DIM }}>(red flash)</span> — Multiple systems down, no TD response. Immediately escalated.
              </li>
            </ul>
            <p style={{ ...paraStyle, marginTop: 12 }}>
              Acknowledge alerts via Telegram with <code style={codeStyle}>/ack_[code]</code> or from the portal alerts tab.
            </p>
          </AccordionItem>

          <AccordionItem title="Auto-recovery explained">
            <p style={paraStyle}>
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
          </AccordionItem>

          <AccordionItem title="On-call TD rotation">
            <p style={paraStyle}>On-call routing ensures alerts reach the right person:</p>
            <ol style={olStyle}>
              <li>Add your tech directors in the Portal (Tech Directors tab) with their Telegram accounts</li>
              <li>Set a primary TD — they are the default contact</li>
              <li>Assign weekly on-call via Telegram or the portal</li>
              <li>During services, alerts route to whoever is on-call that week</li>
              <li>If no response in 90 seconds, Tally escalates to the primary TD</li>
              <li>TDs can swap duty via Telegram: send <code style={codeStyle}>/swap [name]</code>, the other TD confirms with <code style={codeStyle}>/confirmswap</code></li>
            </ol>
          </AccordionItem>

          <AccordionItem title="AI Autopilot rules">
            <p style={paraStyle}>
              <span style={badgeStyleAlt}>Pro</span> <span style={badgeStyleAlt}>Managed</span> — Create automation rules that run during services. Three trigger types:
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
              Limits: Pro tier can have up to 10 rules, Managed up to 25. Each rule fires at most once per service session.
            </p>
          </AccordionItem>

          <AccordionItem title="Pre-service checks">
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
          </AccordionItem>

          <AccordionItem title="Session recaps">
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

          <AccordionItem title="Remote control">
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

          {/* ── Category 3: Troubleshooting ── */}
          <CategoryHeading>Troubleshooting</CategoryHeading>

          <AccordionItem title="Stream went down">
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

          <AccordionItem title="ATEM disconnected">
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

          <AccordionItem title="OBS not responding">
            <p style={paraStyle}>Causes: OBS crashed, WebSocket server disabled, port conflict.</p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              <strong style={{ color: WHITE }}>Fix:</strong> Check if OBS is running on the booth computer, verify WebSocket server is enabled (Tools &rarr; WebSocket Server Settings), restart OBS if needed, check that port 4455 is not blocked.
            </p>
          </AccordionItem>

          <AccordionItem title="Audio issues detected">
            <p style={paraStyle}>
              Tally can detect audio silence during streams. Causes: mixer master muted, audio routing misconfigured, cable disconnected.
            </p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              <strong style={{ color: WHITE }}>Fix:</strong> Check mixer master fader and mute status, verify audio routing from mixer to OBS/stream encoder, check physical cable connections.
            </p>
          </AccordionItem>

          <AccordionItem title="Equipment offline between services">
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

          {/* ── Category 4: Billing & Account ── */}
          <CategoryHeading>Billing &amp; Account</CategoryHeading>

          <AccordionItem title="Managing your subscription">
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

          <AccordionItem title="Trial information">
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

          <AccordionItem title="Refund policy">
            <p style={paraStyle}>
              Cancel anytime — your service continues through the end of the current billing period. We do not offer refunds for partial months. If you are unhappy with Tally, cancel before your next billing date.
            </p>
            <p style={{ ...paraStyle, marginTop: 8 }}>
              Contact <a href="mailto:support@atemschool.com" style={linkStyle}>support@atemschool.com</a> with any billing questions.
            </p>
          </AccordionItem>

          <AccordionItem title="Does Tally work without an ATEM?">
            <p style={paraStyle}>
              Yes. Tally supports OBS-only and vMix-only setups. The ATEM integration provides the richest feature set (camera switching, recording control, HyperDeck), but OBS and vMix monitoring, auto-recovery, and remote control all work independently.
            </p>
          </AccordionItem>

          <AccordionItem title="Can I use Tally for a one-time event?">
            <p style={paraStyle}>
              Yes — the Event tier ($99 one-time) provides 72-hour monitoring for conferences, Easter services, weddings, or any special event. No subscription required.
            </p>
          </AccordionItem>

          <AccordionItem title="What happens if my internet goes down?">
            <p style={paraStyle}>
              The Tally desktop client stores status locally and reconnects automatically when internet is restored. Any queued commands from remote control will replay. Local monitoring and auto-recovery continue working even without internet.
            </p>
          </AccordionItem>

          <AccordionItem title="Is my video stream data stored?">
            <p style={paraStyle}>
              No. Tally monitors stream health metrics (bitrate, FPS, connection status) but does not record or store your video content. Preview frames are transient and not persisted.
            </p>
          </AccordionItem>

          <AccordionItem title="Can multiple TDs use Tally?">
            <p style={paraStyle}>
              Yes. Add multiple tech directors in the portal. Use guest tokens to give other TDs app access. On-call rotation ensures the right person gets alerts. The Telegram bot supports multiple users.
            </p>
          </AccordionItem>

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
              <a href="mailto:support@atemschool.com" style={linkStyle}>
                support@atemschool.com
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
              <ResponseBadge tier="Managed" time="15 min" note="Mon-Fri 9-5 ET + service windows" />
            </div>
          </div>
        </div>
      </div>
    </main>
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

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
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
