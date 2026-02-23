export const metadata = {
  title: 'Terms of Service — Tally by ATEM School',
};

const BG = '#09090B';
const CARD = '#0F1613';
const BORDER = '#1a2e1f';
const GREEN = '#22c55e';
const WHITE = '#F8FAFC';
const MUTED = '#94A3B8';

export default function TermsPage() {
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
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Terms of Service</h1>
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 32 }}>
            Last updated: February 2026
          </p>

          <Section title="1. Service Description">
            Tally is a church production monitoring and remote control platform operated by ATEM
            School (Andrew Disbrow). The service provides real-time monitoring, alerting, and remote
            control capabilities for broadcast and production equipment including — but not limited
            to — Blackmagic ATEM switchers, OBS Studio, vMix, ProPresenter, Resolume, audio
            consoles, and streaming encoders. By using Tally, you agree to these Terms of Service.
          </Section>

          <Section title="2. Account Terms">
            <ul style={ulStyle}>
              <li>
                You must be at least 18 years of age to create an account and use the service.
              </li>
              <li>
                Each church or organization is entitled to one Tally account. Multiple user logins
                may be provisioned under that account depending on your subscription tier.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your account credentials,
                including your password and any API keys issued to your account.
              </li>
              <li>
                You must provide accurate and complete information during registration. You agree to
                update your account information promptly if it changes.
              </li>
              <li>
                You are responsible for all activity that occurs under your account, whether
                authorized by you or not. Notify us immediately at{' '}
                <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
                  support@atemschool.com
                </a>{' '}
                if you suspect unauthorized access.
              </li>
            </ul>
          </Section>

          <Section title="3. Subscription Plans & Billing">
            Tally is offered under the following subscription tiers:
            <ul style={ulStyle}>
              <li>
                <strong>Connect</strong> — $49/month
              </li>
              <li>
                <strong>Plus</strong> — $99/month
              </li>
              <li>
                <strong>Pro</strong> — $149/month
              </li>
              <li>
                <strong>Managed</strong> — $299/month
              </li>
              <li>
                <strong>Event</strong> — $99 one-time purchase (single-event access)
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              All subscription plans include a 30-day free trial. Subscriptions renew automatically
              at the end of each billing period unless canceled prior to renewal. All billing and
              payment processing is handled through Stripe. We do not store your credit card
              information.
            </p>
            <p style={{ marginTop: 12 }}>
              Prices are subject to change. We will provide at least 30 days written notice (via
              email) before any price changes take effect on your account.
            </p>
          </Section>

          <Section title="4. Refunds & Cancellation">
            <ul style={ulStyle}>
              <li>
                You may cancel your subscription at any time through the Stripe customer portal
                linked in your Tally dashboard.
              </li>
              <li>
                Upon cancellation, your service will remain active through the end of the current
                billing period. No refunds are issued for partial months.
              </li>
              <li>
                After cancellation, your account data (device configurations, alert history, and
                monitoring logs) will be retained for 30 days to allow for reactivation, after which
                it will be permanently deleted.
              </li>
              <li>
                Annual plans that are canceled mid-term will be prorated to the remaining number of
                full months. The prorated credit will be issued to your original payment method via
                Stripe.
              </li>
            </ul>
          </Section>

          <Section title="5. Free Trial">
            All new accounts receive a 30-day free trial with full access to the features of your
            selected subscription tier. No credit card is required to start the trial. At the end of
            the trial period, you must subscribe to a paid plan to continue using the service. If you
            do not subscribe, your account will be placed on hold and your data will be retained for
            30 days before permanent deletion.
          </Section>

          <Section title="6. Acceptable Use">
            You agree to use Tally in a lawful and responsible manner. The following activities are
            prohibited:
            <ul style={ulStyle}>
              <li>
                Reverse engineering, decompiling, or disassembling any part of the Tally software,
                relay server, or client applications.
              </li>
              <li>
                Using automated tools or scripts to scrape, crawl, or extract data from the Tally
                platform beyond normal API usage.
              </li>
              <li>
                Using Tally to intentionally disrupt, damage, or interfere with any production
                equipment, streaming service, or third-party system.
              </li>
              <li>
                Sharing your account credentials with individuals outside your organization.
              </li>
              <li>
                Exceeding fair-use limits for the AI Autopilot feature: Pro tier accounts are limited
                to 10 active automation rules, and Managed tier accounts are limited to 25 active
                automation rules.
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              We reserve the right to throttle or temporarily suspend accounts that generate
              excessive API calls or place unreasonable load on the service infrastructure.
            </p>
          </Section>

          <Section title="7. Service Level Agreement (Managed Tier)">
            Accounts subscribed to the Managed tier receive the following service level commitment:
            <ul style={ulStyle}>
              <li>
                <strong>Response time:</strong> We will acknowledge support requests within 15
                minutes during standard business hours (Monday–Friday, 9:00 AM – 5:00 PM Eastern
                Time) and during your church&apos;s scheduled service windows as configured in your
                Tally dashboard.
              </li>
              <li>
                <strong>Definition of response:</strong> &quot;Response&quot; means written
                acknowledgment that we have received your request and are actively investigating. It
                does not guarantee resolution within the 15-minute window.
              </li>
              <li>
                <strong>SLA credit:</strong> If we fail to meet the 15-minute response commitment
                three or more times within a single billing cycle, you will receive a prorated credit
                for that month applied to your next invoice.
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>The SLA does not apply to the following:</p>
            <ul style={ulStyle}>
              <li>
                Scheduled maintenance windows, which will be announced at least 24 hours in advance
                via email and the Tally dashboard.
              </li>
              <li>
                Force majeure events, including natural disasters, internet backbone outages, or
                other circumstances beyond our reasonable control.
              </li>
              <li>
                Issues caused by the customer&apos;s own equipment, network, internet connection, or
                misconfiguration of third-party software.
              </li>
            </ul>
          </Section>

          <Section title="8. Data & Privacy">
            Your privacy is important to us. Please review our{' '}
            <a href="/privacy" style={{ color: GREEN }}>
              Privacy Policy
            </a>{' '}
            for full details on how we collect, use, and protect your information. In summary, Tally
            collects equipment telemetry, stream health metrics, and connection data solely to
            provide and improve the monitoring service. Video preview data transmitted through the
            relay is transient and is not stored on our servers.
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              Tally is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
              warranties of any kind, whether express or implied, including but not limited to
              implied warranties of merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
            <ul style={ulStyle}>
              <li>
                ATEM School and its operators shall not be held liable for any missed streams,
                equipment failures, production disruptions, or any damages arising from the use or
                inability to use the Tally service.
              </li>
              <li>
                Our total aggregate liability for any claim arising out of or related to the service
                shall not exceed the total fees you have paid to us in the three (3) months
                immediately preceding the event giving rise to the claim.
              </li>
              <li>
                We are not responsible for outages, errors, or disruptions caused by third-party
                services, including but not limited to Stripe, OBS Studio, Blackmagic Design, vMix,
                Renewed Vision (ProPresenter), or any internet service provider.
              </li>
            </ul>
          </Section>

          <Section title="10. Modifications to Terms">
            We reserve the right to update or modify these Terms of Service at any time. If we make
            material changes, we will provide at least 30 days notice via email to the address
            associated with your account. Your continued use of Tally after the effective date of any
            changes constitutes your acceptance of the updated terms. If you do not agree to the
            revised terms, you must discontinue use of the service and cancel your subscription.
          </Section>

          <Section title="11. Termination">
            <ul style={ulStyle}>
              <li>
                We may suspend or terminate your account immediately if you violate any provision of
                these Terms of Service, engage in prohibited activity, or if continued service to
                your account poses a risk to the platform or other users.
              </li>
              <li>
                You may terminate your account at any time by canceling your subscription through the
                Stripe customer portal. Upon termination, the cancellation and data retention
                policies described in Section 4 will apply.
              </li>
              <li>
                Sections that by their nature should survive termination — including Limitation of
                Liability, Data & Privacy, and any accrued obligations — shall remain in effect.
              </li>
            </ul>
          </Section>

          <Section title="12. Contact">
            If you have any questions about these Terms of Service, please contact us at{' '}
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
