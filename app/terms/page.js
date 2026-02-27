import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';

export const metadata = {
  title: 'Terms of Service — Tally by ATEM School',
};

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
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
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
            consoles, and streaming encoders. You are responsible for the lawful operation of the
            software and hardware used in your church environment. By using Tally, you agree to these
            Terms of Service.
          </Section>

          <Section title="2. Account Terms">
            <ul style={ulStyle}>
              <li>
                You must be at least 18 years of age to create an account and use the service.
              </li>
              <li>
                Each church or organization is entitled to one Tally account. Multiple user logins
                may be provisioned under that account depending on subscription tier.
              </li>
              <li>
                You are responsible for maintaining confidentiality of account credentials, passwords,
                and API keys.
              </li>
              <li>
                You are responsible for all activity on your account, authorized or not. Notify us
                immediately at{' '}
                <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>
                  support@atemschool.com
                </a>{' '}
                if you suspect unauthorized activity.
              </li>
              <li>
                You represent you have authority to bind your organization and accept these Terms.
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
              All subscription plans include a 30-day free trial. Subscriptions renew automatically at
              the end of each billing period unless canceled before renewal. All billing and payment
              processing is handled through Stripe. We do not store your credit card information.
            </p>
            <p style={{ marginTop: 12 }}>
              Prices are subject to change. We will provide at least 30 days written notice (via email)
              before any price changes take effect on your account.
            </p>
            <p style={{ marginTop: 12 }}>
              Taxes and fees assessed by Stripe or any applicable government authority may be added and
              will be your responsibility unless otherwise stated.
            </p>
          </Section>

          <Section title="4. Refunds & Cancellation">
            <ul style={ulStyle}>
              <li>
                You may cancel your subscription at any time through the Stripe customer portal linked in
                your Tally dashboard.
              </li>
              <li>
                Upon cancellation, your service remains active until the end of the current billing
                period.
              </li>
              <li>
                No refunds are issued for partial monthly service except where required by law.
              </li>
              <li>
                After cancellation, account data (device configurations, alert history, and monitoring
                logs) is retained for 30 days for reactivation, then permanently deleted.
              </li>
              <li>
                Annual plan cancellations are prorated by remaining full months and credited via Stripe
                to the original method.
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              You are responsible for checking your payment method details and renewal dates in the
              portal. We are not responsible for missed renewal emails or spam filtering.
            </p>
          </Section>

          <Section title="5. Free Trial">
            All new accounts receive a 30-day free trial with full access to the selected tier. No
            credit card is required to start the trial. At trial end, if you do not subscribe, your
            account is placed on hold and retained for 30 days before deletion.
          </Section>

          <Section title="6. Acceptable Use">
            You agree to use Tally lawfully and responsibly.
            <ul style={ulStyle}>
              <li>
                Reverse engineering, decompiling, or disassembling Tally software, relay server, or
                client applications is prohibited.
              </li>
              <li>
                Automated scraping or data extraction beyond normal API usage is prohibited.
              </li>
              <li>
                Do not use Tally to intentionally disrupt, damage, or interfere with production,
                streaming systems, or third-party services.
              </li>
              <li>
                Do not share credentials with individuals outside your organization.
              </li>
              <li>
                AI Autopilot fair-use limits apply: Pro tier limits 10 active rules, Managed limits
                25 active rules.
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              We may throttle or temporarily suspend accounts that generate unreasonable API volume or
              abusive load.
            </p>
          </Section>

          <Section title="7. Service Commitment (Managed Tier) and All-Tier Baseline">
            <p style={{ marginBottom: 8 }}>
              Managed tier includes support commitments for response acknowledgment (not guaranteed
              issue resolution time):
            </p>
            <ul style={ulStyle}>
              <li>
                We acknowledge support requests within 15 minutes during business hours (Mon–Fri,
                9:00 AM–5:00 PM ET) and during configured service windows.
              </li>
              <li>
                "Response" means we acknowledge receipt and begin investigation.
              </li>
              <li>
                A prorated credit applies if this managed-response commitment is missed three or more
                times in one billing cycle.
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              All non-Managed plans receive support through standard channels with reasonable best-effort
              response times and no guaranteed SLA credit schedule unless specifically stated in a
              separate service agreement.
            </p>
          </Section>

          <Section title="8. Incident Reporting and Escalation">
            To help us support production issues quickly, service requests must include:
            <ul style={ulStyle}>
              <li>Church name and account email</li>
              <li>Plan/tier and affected service window</li>
              <li>Timestamped description of symptoms and any impacted streams</li>
              <li>Relevant logs or screenshots (if available)</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              For mission-critical service windows, we recommend keeping an internal fallback procedure
              and offsite manual control path ready in advance.
            </p>
          </Section>

          <Section title="9. Data & Privacy">
            Please review our{' '}
            <a href="/privacy" style={{ color: GREEN }}>
              Privacy Policy
            </a>{' '}
            for detailed treatment of data collection and use.
            <ul style={ulStyle}>
              <li>
                We process telemetry, stream-health metrics, and connection data only to provide and
                improve the service.
              </li>
              <li>
                Video preview data transmitted through relay is transient and not stored on our servers.
              </li>
              <li>
                We maintain reasonable security practices; however, no system is completely risk-free.
              </li>
              <li>
                For church compliance review, you should confirm operational data handling expectations with
                your ministry leadership before use.
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              You may request export or deletion of your organization&apos;s account data through support.
            </p>
          </Section>

          <Section title="10. Security, Security Incidents, and Vendor Changes">
            You agree to keep local machine credentials secure and rotate access whenever staff roles
            change.
            <ul style={ulStyle}>
              <li>
                We may use trusted sub-processors and infrastructure partners as needed to operate the
                service.
              </li>
              <li>
                If we identify a material service-affecting security incident, we will work to notify
                affected customers as reasonably as possible.
              </li>
              <li>
                Material changes to these terms will be posted with notice as described in Section 12.
              </li>
            </ul>
          </Section>

          <Section title="11. Limitation of Liability">
            Tally is provided on an "as is" and "as available" basis.
            <ul style={ulStyle}>
              <li>
                ATEM School is not liable for missed streams, equipment failures, or production
                disruptions.
              </li>
              <li>
                Aggregate liability is limited to the total fees paid by you in the prior three (3) months
                before the claim.
              </li>
              <li>
                We are not responsible for outages or disruptions caused by third-party services (e.g.
                Stripe, OBS, Blackmagic, vMix, ProPresenter, ISP).
              </li>
            </ul>
            <p style={{ marginTop: 12 }}>
              This section applies to the maximum extent allowed by law.
            </p>
          </Section>

          <Section title="12. Indemnity, Disputes, and Governing Law">
            You agree to indemnify ATEM School for misuse of the service or breach of these Terms.
            <ul style={ulStyle}>
              <li>
                Unless required by law, claims must be submitted by written notice and handled in
                good-faith support coordination.
              </li>
              <li>
                Governing law and venue: these Terms are governed by the laws of New York, with courts
                in New York County having jurisdiction, unless mandatory consumer law requires otherwise.
              </li>
              <li>
                Any arbitration clause is not included in this version to preserve straightforward email
                dispute resolution unless separately added later.
              </li>
            </ul>
          </Section>

          <Section title="13. Modifications to Terms">
            We may update these Terms at any time. Material changes receive at least 30 days&apos; notice via
            email. Continued use after the effective date means acceptance; otherwise cancel before that
            date.
          </Section>

          <Section title="14. Termination">
            <ul style={ulStyle}>
              <li>
                We may suspend or terminate your account immediately for violations or conduct that
                creates platform risk.
              </li>
              <li>
                You may terminate anytime by canceling your subscription; Section 4 and data handling
                provisions apply.
              </li>
              <li>
                Surviving provisions include Limitation of Liability, Data & Privacy, and accrued
                payment obligations.
              </li>
            </ul>
          </Section>

          <Section title="15. Contact">
            If you have questions about these Terms, contact us at{' '}
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
