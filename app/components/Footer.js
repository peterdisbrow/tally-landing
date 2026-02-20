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
        <span style={{ color: DIM, fontSize: '0.82rem' }}>&middot; by ATEM School</span>
      </div>
      <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', flexWrap: 'wrap' }}>
        <a href="/privacy" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>Privacy Policy</a>
        <a href="https://tally.atemschool.com" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>tally.atemschool.com</a>
        <a href="https://atemschool.com" target="_blank" rel="noopener" className="footer-link" style={{ color: DIM, textDecoration: 'none' }}>atemschool.com &nearr;</a>
      </div>
    </footer>
  );
}
