import { BG, CARD_BG as CARD, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Download Tally — Desktop App for Mac & Windows',
  description: 'Download the Tally desktop app for macOS and Windows. Signed and notarized by Apple. Works with Apple Silicon, Intel Macs, and Windows PCs.',
  openGraph: {
    title: 'Download Tally',
    description: 'Get the Tally desktop app for macOS and Windows.',
    url: 'https://tallyconnect.app/download',
  },
};

const GITHUB_REPO = 'peterdisbrow/tally';
const GITHUB_LATEST = `https://github.com/${GITHUB_REPO}/releases/latest/download`;

async function getLatestRelease() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      version: data.tag_name?.replace(/^v/, '') || null,
      publishedAt: data.published_at,
    };
  } catch {
    return null;
  }
}

export default async function DownloadPage() {
  const release = await getLatestRelease();
  const version = release?.version || '1.1.38';
  const releaseDate = release?.publishedAt
    ? new Date(release.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const windowsUrl = `${GITHUB_LATEST}/Tally-Setup-${version}.exe`;

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
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 40, marginBottom: 8 }}>
            Download Tally
          </h1>
          <p style={{ color: MUTED, fontSize: 15, marginBottom: 40 }}>
            v{version}{releaseDate ? ` \u00b7 ${releaseDate}` : ''} &middot; macOS 12+ / Windows 10+
          </p>

          {/* Download Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
            {/* Apple Silicon */}
            <div
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{'\uF8FF'}</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Mac &mdash; Apple Silicon</h2>
              <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>
                M1, M2, M3, M4 MacBook, iMac &amp; Mac Mini
              </p>
              <a
                href={`${GITHUB_LATEST}/Tally-arm64.dmg`}
                style={{
                  display: 'inline-block',
                  background: GREEN,
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '12px 32px',
                  borderRadius: 10,
                  textDecoration: 'none',
                }}
              >
                Download .dmg
              </a>
              <p style={{ color: MUTED, fontSize: 11, marginTop: 10 }}>~130 MB</p>
            </div>

            {/* Intel */}
            <div
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{'\uF8FF'}</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Mac &mdash; Intel</h2>
              <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>
                2015&ndash;2020 MacBook &amp; iMac
              </p>
              <a
                href={`${GITHUB_LATEST}/Tally-x64.dmg`}
                style={{
                  display: 'inline-block',
                  background: '#1e293b',
                  color: WHITE,
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '12px 32px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  border: `1px solid ${BORDER}`,
                }}
              >
                Download .dmg
              </a>
              <p style={{ color: MUTED, fontSize: 11, marginTop: 10 }}>~140 MB</p>
            </div>

            {/* Windows */}
            <div
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{'\u{1FA9F}'}</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Windows</h2>
              <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>
                Windows 10 or later (64-bit)
              </p>
              <a
                href={windowsUrl}
                style={{
                  display: 'inline-block',
                  background: '#0078d4',
                  color: WHITE,
                  fontWeight: 700,
                  fontSize: 15,
                  padding: '12px 32px',
                  borderRadius: 10,
                  textDecoration: 'none',
                }}
              >
                Download .exe
              </a>
              <p style={{ color: MUTED, fontSize: 11, marginTop: 10 }}>~90 MB</p>
            </div>
          </div>

          {/* Not sure which Mac? */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: '20px 28px',
              marginBottom: 40,
              textAlign: 'left',
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Not sure which Mac you have?</h3>
            <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Click the Apple menu () &rarr; <strong style={{ color: WHITE }}>About This Mac</strong>. If you see &ldquo;Apple M1&rdquo; or &ldquo;Apple M2&rdquo; (or later), choose <strong style={{ color: GREEN }}>Apple Silicon</strong>. If you see &ldquo;Intel&rdquo;, choose <strong style={{ color: WHITE }}>Intel</strong>.
            </p>
          </div>

          {/* Security & Trust */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
            <TrustItem icon="\u2705" title="Signed" desc="Apple Developer ID" />
            <TrustItem icon="\uD83D\uDEE1\uFE0F" title="Notarized" desc="Scanned by Apple" />
            <TrustItem icon="\uD83D\uDD12" title="Secure" desc="HTTPS + encrypted relay" />
          </div>

          {/* System Requirements */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: '24px 28px',
              marginBottom: 40,
              textAlign: 'left',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>System Requirements</h3>
            <ul style={{ color: MUTED, fontSize: 13, lineHeight: 2, paddingLeft: 18, margin: 0 }}>
              <li>macOS 12 Monterey or later / Windows 10 or later</li>
              <li>Apple Silicon (M1+), Intel processor, or 64-bit Windows</li>
              <li>4 GB RAM minimum</li>
              <li>200 MB free disk space</li>
              <li>Internet connection for relay communication</li>
              <li>ATEM Switcher on the same network (for ATEM features)</li>
            </ul>
          </div>

          {/* Links */}
          <div style={{ marginBottom: 60, display: 'flex', justifyContent: 'center', gap: 24 }}>
            <a href="/changelog" style={{ color: GREEN, fontSize: 14, textDecoration: 'none' }}>
              View changelog &rarr;
            </a>
            <a href="/signup" style={{ color: GREEN, fontSize: 14, textDecoration: 'none' }}>
              Create an account &rarr;
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function TrustItem({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: MUTED }}>{desc}</div>
    </div>
  );
}
