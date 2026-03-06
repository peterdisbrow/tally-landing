import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Privacy Policy — Tally',
  description: 'How Tally collects, uses, and protects your data. Covers cookies, third-party services, GDPR, CCPA, and your data rights.',
  openGraph: {
    title: 'Privacy Policy — Tally',
    description: 'How Tally collects, uses, and protects your church production data.',
    url: 'https://tallyconnect.app/privacy',
  },
};

export default function PrivacyPage() {
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
            marginBottom: 60,
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: '40px 36px',
          }}
        >
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 32 }}>
            Last updated: March 2026
          </p>

          <Section title="Who we are">
            Tally is a church production monitoring and remote control platform operated by ATEM
            School (Andrew Disbrow). Our website is{' '}
            <a href="https://tallyconnect.app" style={{ color: GREEN }}>
              tallyconnect.app
            </a>
            . This Privacy Policy explains how we collect, use, store, and protect your information
            when you use the Tally website, desktop application, and related services.
          </Section>

          <Section title="What data we collect">
            <ul style={ulStyle}>
              <li>
                <strong>Early access form:</strong> name, church name, and email address. Stored in
                Mailchimp for email communications.
              </li>
              <li>
                <strong>Account signup:</strong> church name, admin email, and password (hashed
                using bcrypt). Stored on our relay server for authentication.
              </li>
              <li>
                <strong>Payment:</strong> billing is handled entirely by Stripe. We never see or
                store credit card numbers. We store only your Stripe customer ID and subscription
                status.
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
              <li>
                <strong>AI chat conversations:</strong> if you use the built-in AI support chat,
                your questions are processed by Anthropic&apos;s Claude API to generate responses.
                Chat transcripts are not stored permanently. See &ldquo;Third-Party Services&rdquo;
                below for details.
              </li>
              <li>
                <strong>Support requests:</strong> if you contact us via email, we retain the
                correspondence to resolve your issue and improve our service.
              </li>
            </ul>
          </Section>

          <Section title="Cookies & tracking technologies">
            <p style={pStyle}>
              <strong>We do not use cookies for tracking or advertising.</strong> Tally does not
              set any third-party cookies, tracking pixels, or advertising beacons on our website
              or in our application.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Session cookies:</strong> we may use strictly necessary session cookies to
                maintain your login state in the church portal. These expire when you close your
                browser or after 24 hours.
              </li>
              <li>
                <strong>Local storage:</strong> the Tally website may store an authentication token
                in your browser&apos;s local storage to keep you signed in. You can clear this at
                any time by signing out or clearing your browser data.
              </li>
              <li>
                <strong>No cookie banners needed:</strong> because we do not use tracking cookies
                or third-party advertising cookies, we do not display cookie consent banners. Our
                analytics solution (Plausible) is cookieless.
              </li>
            </ul>
          </Section>

          <Section title="Analytics">
            We use Plausible Analytics, a privacy-friendly service that does not use cookies, does
            not track individuals, and is fully GDPR-compliant. No personal data is collected by our
            analytics. All data is aggregated — we see page view counts and referral sources, not
            individual visitor behavior.
          </Section>

          <Section title="Third-party services">
            <p style={pStyle}>
              We share data with the following third-party services only as necessary to operate Tally:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Stripe</strong> (payments) — processes subscription billing and payments.
                Stripe receives your email and payment information. Their privacy policy:{' '}
                <a href="https://stripe.com/privacy" style={{ color: GREEN }}>stripe.com/privacy</a>.
              </li>
              <li>
                <strong>Mailchimp</strong> (email) — stores your name and email if you sign up for
                early access or marketing emails. Their privacy policy:{' '}
                <a href="https://mailchimp.com/legal/privacy/" style={{ color: GREEN }}>mailchimp.com/legal/privacy</a>.
              </li>
              <li>
                <strong>Plausible Analytics</strong> (analytics) — receives anonymized, aggregate
                page view data. No personal data is transmitted. Their data policy:{' '}
                <a href="https://plausible.io/data-policy" style={{ color: GREEN }}>plausible.io/data-policy</a>.
              </li>
              <li>
                <strong>Anthropic</strong> (AI support) — if you use the AI chat feature, your
                messages are sent to Anthropic&apos;s Claude API for processing. Anthropic does not
                use your data to train models. Their privacy policy:{' '}
                <a href="https://www.anthropic.com/privacy" style={{ color: GREEN }}>anthropic.com/privacy</a>.
              </li>
              <li>
                <strong>Vercel</strong> (hosting) — hosts the Tally website. Vercel may collect
                standard server access logs (IP address, browser type, requested URL). Their
                privacy policy:{' '}
                <a href="https://vercel.com/legal/privacy-policy" style={{ color: GREEN }}>vercel.com/legal/privacy-policy</a>.
              </li>
              <li>
                <strong>Railway</strong> (infrastructure) — hosts the Tally relay server. Railway
                processes data transmitted between the Tally desktop app and the cloud. Their
                privacy policy:{' '}
                <a href="https://railway.app/legal/privacy" style={{ color: GREEN }}>railway.app/legal/privacy</a>.
              </li>
            </ul>
            <p style={pStyle}>
              We do not sell, rent, or share your personal information with third parties for
              marketing or advertising purposes.
            </p>
          </Section>

          <Section title="How we use your data">
            <ul style={ulStyle}>
              <li>To provide and maintain the Tally monitoring service</li>
              <li>To authenticate your account and manage your subscription</li>
              <li>To send service-related emails (alerts, onboarding, updates)</li>
              <li>To process payments through Stripe</li>
              <li>To respond to support requests</li>
              <li>To improve the product based on aggregated, anonymized usage patterns</li>
              <li>To detect and prevent abuse or unauthorized access</li>
            </ul>
          </Section>

          <Section title="Data security">
            <p style={pStyle}>
              We take reasonable measures to protect your data:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Encryption in transit:</strong> all data transmitted between your browser,
                the Tally desktop app, and our servers is encrypted using TLS (HTTPS).
              </li>
              <li>
                <strong>Password hashing:</strong> passwords are hashed using bcrypt before storage.
                We never store plaintext passwords.
              </li>
              <li>
                <strong>Access controls:</strong> access to production infrastructure is restricted
                to authorized personnel only and protected by multi-factor authentication.
              </li>
              <li>
                <strong>No credit card storage:</strong> payment data is handled entirely by Stripe.
                Credit card numbers never touch our servers.
              </li>
              <li>
                <strong>Transient video data:</strong> video preview frames are transmitted in
                real-time and never stored. Stream health metrics are retained only for the duration
                specified in our retention policy.
              </li>
            </ul>
            <p style={pStyle}>
              No system is 100% secure. If we become aware of a data breach that affects your
              personal information, we will notify you via email within 72 hours of discovery.
            </p>
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
              <li>
                <strong>Email marketing data:</strong> if you unsubscribe from marketing emails,
                your email is removed from our Mailchimp audience within 30 days.
              </li>
              <li>
                <strong>Support correspondence:</strong> retained for up to 12 months after
                resolution, then deleted.
              </li>
            </ul>
            You can request immediate deletion by emailing{' '}
            <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
              support@atemschool.com
            </a>
            .
          </Section>

          <Section title="Your rights">
            <p style={pStyle}>
              Regardless of where you live, you have the following rights with respect to your data:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Access:</strong> request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong>Correction:</strong> request correction of inaccurate or incomplete data.
              </li>
              <li>
                <strong>Deletion:</strong> request permanent deletion of your data. We will comply
                within 30 days unless we are legally required to retain it.
              </li>
              <li>
                <strong>Portability:</strong> request your data in a machine-readable format (JSON).
              </li>
              <li>
                <strong>Objection:</strong> object to processing of your data for specific purposes.
              </li>
              <li>
                <strong>Withdrawal of consent:</strong> where processing is based on consent, you
                may withdraw it at any time.
              </li>
            </ul>
            <p style={pStyle}>
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
                support@atemschool.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="GDPR (European users)">
            <p style={pStyle}>
              If you are located in the European Economic Area (EEA), the UK, or Switzerland, the
              following additional provisions apply:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Legal basis for processing:</strong> we process your personal data based on
                (a) your consent (e.g., signing up for early access), (b) performance of a contract
                (e.g., providing the Tally service you subscribed to), and (c) our legitimate
                interests (e.g., improving the product, preventing abuse).
              </li>
              <li>
                <strong>Data controller:</strong> ATEM School (Andrew Disbrow) is the data controller
                for personal data collected through Tally.
              </li>
              <li>
                <strong>International transfers:</strong> your data may be transferred to and
                processed in the United States, where our servers are located. We rely on standard
                contractual clauses and adequate security measures to protect data during transfer.
              </li>
              <li>
                <strong>Right to lodge a complaint:</strong> you have the right to lodge a complaint
                with your local data protection authority if you believe your data has been processed
                unlawfully.
              </li>
            </ul>
          </Section>

          <Section title="CCPA (California users)">
            <p style={pStyle}>
              If you are a California resident, the California Consumer Privacy Act (CCPA) grants
              you additional rights:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Right to know:</strong> you may request details about the categories and
                specific pieces of personal information we have collected about you.
              </li>
              <li>
                <strong>Right to delete:</strong> you may request deletion of your personal
                information, subject to certain exceptions.
              </li>
              <li>
                <strong>Right to opt out of sale:</strong> we do not sell your personal information.
                No opt-out is necessary.
              </li>
              <li>
                <strong>Non-discrimination:</strong> we will not discriminate against you for
                exercising any of your CCPA rights.
              </li>
            </ul>
          </Section>

          <Section title="Children's privacy">
            Tally is not intended for use by children under the age of 18. We do not knowingly
            collect personal information from children. If you believe a child has provided us with
            personal data, please contact us at{' '}
            <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
              support@atemschool.com
            </a>{' '}
            and we will delete it promptly.
          </Section>

          <Section title="Changes to this policy">
            We may update this Privacy Policy from time to time. If we make material changes, we
            will notify you by email (using the address associated with your account) or by posting
            a notice on our website at least 30 days before the changes take effect. Your continued
            use of Tally after the effective date constitutes acceptance of the updated policy.
          </Section>

          <Section title="Contact">
            For privacy questions, data requests, or concerns, email{' '}
            <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
              support@atemschool.com
            </a>
            .
          </Section>
        </div>
      </div>
    </main>
    <Footer />
    </>
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

const pStyle = {
  marginBottom: 12,
};
