export const metadata = {
  title: 'Privacy Policy — Tally by ATEM School',
};

const BG = '#09090B';
const CARD = '#0F1613';
const BORDER = '#1a2e1f';
const GREEN = '#22c55e';
const WHITE = '#F8FAFC';
const MUTED = '#94A3B8';

export default function PrivacyPage() {
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
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 32 }}>
            Last updated: February 2026
          </p>

          <Section title="Who we are">
            Tally is operated by ATEM School (Andrew Disbrow). Our website is{' '}
            <a href="https://tally.atemschool.com" style={{ color: GREEN }}>
              tally.atemschool.com
            </a>
            .
          </Section>

          <Section title="What data we collect">
            <ul style={ulStyle}>
              <li>
                <strong>Early access form:</strong> name, church name, and email address. Stored in
                Mailchimp for email communications.
              </li>
              <li>
                <strong>Account signup:</strong> church name, admin email, and password (hashed).
                Stored on our relay server for authentication.
              </li>
              <li>
                <strong>Payment:</strong> billing is handled entirely by Stripe. We never see or
                store credit card numbers.
              </li>
              <li>
                <strong>Device telemetry:</strong> equipment connection status, hardware model identifiers,
                and configuration data from ATEM switchers, OBS, vMix, ProPresenter, audio consoles,
                and other connected devices. Collected solely to provide monitoring and remote control.
              </li>
              <li>
                <strong>Stream health metrics:</strong> bitrate, frame rate, encoder status, and
                streaming platform connection data. Used for alerts, auto-recovery, and session recaps.
              </li>
              <li>
                <strong>Video preview data:</strong> low-resolution preview frames may be transmitted
                for live monitoring. This data is transient, transmitted in real-time, and never
                stored on our servers.
              </li>
            </ul>
          </Section>

          <Section title="Analytics">
            We use Plausible Analytics, a privacy-friendly service that does not use cookies, does
            not track individuals, and is fully GDPR-compliant. No personal data is collected by our
            analytics.
          </Section>

          <Section title="How we use your data">
            <ul style={ulStyle}>
              <li>To provide and maintain the Tally monitoring service</li>
              <li>To send service-related emails (alerts, onboarding, updates)</li>
              <li>To process payments through Stripe</li>
              <li>To improve the product based on aggregated, anonymized usage patterns</li>
            </ul>
            We do not sell, rent, or share your personal information with third parties for
            marketing purposes.
          </Section>

          <Section title="Data retention">
            <ul style={ulStyle}>
              <li>
                <strong>Active accounts:</strong> data is retained while your subscription is active.
              </li>
              <li>
                <strong>After cancellation:</strong> account data, monitoring history, and session
                recaps are retained for 30 days, then permanently deleted.
              </li>
              <li>
                <strong>After trial expiration:</strong> if you do not subscribe, data is retained for
                30 days then deleted.
              </li>
              <li>
                <strong>Stream/preview data:</strong> video preview frames are transient and never
                stored. Stream health metrics are retained for 90 days for session history.
              </li>
              <li>
                <strong>Stripe billing data:</strong> payment history and subscription records are
                managed by Stripe under their privacy policy. We store only your Stripe customer ID
                and subscription status.
              </li>
            </ul>
            You can request immediate deletion by emailing{' '}
            <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
              support@atemschool.com
            </a>
            .
          </Section>

          <Section title="Your rights">
            You may request access to, correction of, or deletion of your personal data at any time
            by contacting us at{' '}
            <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
              support@atemschool.com
            </a>
            .
          </Section>

          <Section title="Contact">
            For privacy questions or data requests, email{' '}
            <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
              support@atemschool.com
            </a>
            .
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 8 }}>{title}</h2>
      <div style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

const ulStyle = {
  margin: '8px 0 0',
  paddingLeft: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};
