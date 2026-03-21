import { BORDER, GREEN, WHITE, DIM } from '../../lib/tokens';

export default function Footer() {
  return (
    <footer style={{
      background: '#060608', borderTop: `1px solid ${BORDER}`,
      padding: '40px 5%',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 6px ${GREEN}` }} />
        <span style={{ color: WHITE, fontWeight: 800, fontSize: '0.95rem' }}>TALLY</span>
      </div>
      <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', flexWrap: 'wrap' }}>
        <a href="/tools/healthcheck/" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>Health Check</a>
        <a href="/tools/checklist/" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>Checklist Generator</a>
        <a href="/blog" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>Blog</a>
        <a href="https://api.tallyconnect.app/how-to" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>How-To Guides</a>
        <a href="/help" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>Help Center</a>
        <a href="/terms" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>Terms of Service</a>
        <a href="/privacy" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>Privacy Policy</a>
        <a href="https://tallyconnect.app" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>tallyconnect.app</a>
        <a href="/es" className="footer-link" style={{ color: GREEN, textDecoration: 'none', fontSize: '0.78rem', border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 5, padding: '2px 8px' }}>
          ES · Español
        </a>
      </div>
    </footer>
  );
}
