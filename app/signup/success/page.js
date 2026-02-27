'use client';

import { useMemo } from 'react';
import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED } from '../../../lib/tokens';

// Page-specific tokens
const DIM = '#64748B';
const AMBER = '#f59e0b';
const AMBER_BG = 'rgba(245,158,11,0.08)';
const AMBER_BORDER = 'rgba(245,158,11,0.3)';

const GITHUB_RELEASES_URL = 'https://github.com/atemschool/tally/releases/latest';
const PORTAL_URL = '/portal';
const HELP_URL = '/help';

export default function SignupSuccessPage() {
  const { churchName, registrationCode } = useMemo(() => {
    if (typeof window === 'undefined') return { churchName: '', registrationCode: '' };
    const params = new URLSearchParams(window.location.search);
    return {
      churchName: params.get('church') || 'Your Church',
      registrationCode: params.get('code') || '',
    };
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: '48px 20px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <a href="/" style={{ color: MUTED, textDecoration: 'none', fontSize: 13 }}>&larr; Back to Home</a>

        <div style={{ marginTop: 14, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '32px 28px' }}>

          {/* Success Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(34,197,94,0.12)', border: `2px solid ${GREEN}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28,
            }}>
              &#10003;
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: WHITE }}>
              Your Account is Ready!
            </h1>
            <p style={{ color: MUTED, fontSize: 15, margin: 0, lineHeight: 1.5 }}>
              Welcome to Tally{churchName && churchName !== 'Your Church' ? `, ${churchName}` : ''}. Follow these steps to start monitoring.
            </p>
          </div>

          {/* Step 1: Download */}
          <div style={stepCard}>
            <div style={stepRow}>
              <div style={stepNumber}>1</div>
              <div>
                <div style={stepTitle}>Download the App</div>
                <p style={stepDesc}>
                  Install Tally on your booth computer &mdash; the one connected to your ATEM and OBS.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer" style={downloadBtn}>
                Download for Mac (Apple Silicon)
              </a>
              <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer" style={downloadBtnSecondary}>
                Download for Windows
              </a>
            </div>
          </div>

          {/* Step 2: Sign In */}
          <div style={stepCard}>
            <div style={stepRow}>
              <div style={stepNumber}>2</div>
              <div>
                <div style={stepTitle}>Sign In</div>
                <p style={stepDesc}>
                  Open the app and sign in with the email and password you just created. The setup wizard will guide you from there.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Connect */}
          <div style={stepCard}>
            <div style={stepRow}>
              <div style={stepNumber}>3</div>
              <div>
                <div style={stepTitle}>Connect Your Gear</div>
                <p style={stepDesc}>
                  Enter your ATEM IP address (or click Auto-Discover). Tally will find your OBS, Companion, and audio console automatically. You&apos;ll be monitoring in minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Code */}
          {registrationCode && (
            <div style={{
              marginTop: 20, padding: 16, borderRadius: 10,
              background: AMBER_BG, border: `1px solid ${AMBER_BORDER}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: AMBER, letterSpacing: '0.08em', marginBottom: 6 }}>
                SAVE THIS CODE
              </div>
              <p style={{ color: MUTED, fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>
                Your tech directors can register for Telegram alerts by sending this command to <strong style={{ color: WHITE }}>@tallybot</strong>:
              </p>
              <div style={{
                fontFamily: 'ui-monospace, monospace', fontSize: 20, fontWeight: 800,
                color: WHITE, letterSpacing: '0.12em', padding: '6px 0',
              }}>
                /register {registrationCode}
              </div>
            </div>
          )}

          {/* Secondary Links */}
          <div style={{ marginTop: 28, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={PORTAL_URL} style={linkBtn}>Church Portal</a>
            <a href={HELP_URL} style={linkBtn}>Help Center</a>
          </div>

          {/* Support Note */}
          <p style={{ textAlign: 'center', color: DIM, fontSize: 13, marginTop: 24, lineHeight: 1.5 }}>
            Need help? Email <a href="mailto:support@atemschool.com" style={{ color: GREEN }}>support@atemschool.com</a> &mdash; we typically respond within a few hours.
          </p>
        </div>
      </div>
    </main>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────────── */

const stepCard = {
  marginTop: 16,
  padding: 16,
  borderRadius: 10,
  border: `1px solid ${BORDER}`,
  background: 'rgba(15,22,19,0.5)',
};

const stepRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
};

const stepNumber = {
  width: 30, height: 30, minWidth: 30,
  borderRadius: '50%',
  background: GREEN,
  color: '#000',
  fontWeight: 800,
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 2,
};

const stepTitle = {
  fontSize: 16,
  fontWeight: 700,
  color: WHITE,
  marginBottom: 4,
};

const stepDesc = {
  fontSize: 14,
  color: MUTED,
  margin: 0,
  lineHeight: 1.55,
};

const downloadBtn = {
  display: 'inline-block',
  padding: '10px 20px',
  fontSize: 13,
  fontWeight: 700,
  background: GREEN,
  color: '#000',
  textDecoration: 'none',
  borderRadius: 8,
};

const downloadBtnSecondary = {
  display: 'inline-block',
  padding: '10px 20px',
  fontSize: 13,
  fontWeight: 600,
  background: 'transparent',
  color: MUTED,
  textDecoration: 'none',
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
};

const linkBtn = {
  fontSize: 13,
  fontWeight: 600,
  color: GREEN,
  textDecoration: 'none',
};
