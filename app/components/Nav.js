'use client';
import { useState } from 'react';
import { BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import { NAV_LINKS } from '../../lib/data';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 5%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ color: WHITE, fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>Tally</span>
        </div>
        <div className="nav-links">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', transition: 'color .2s' }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/signup"
            style={{
              display: 'inline-block', padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700,
              borderRadius: 8, border: 'none', background: GREEN, color: '#000', cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Get Started Free
          </a>
        </div>

        <button
          className="menu-button"
          aria-label={menuOpen ? 'Close main menu' : 'Open main menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{menuOpen ? '\u2715' : '\u2630'}</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" role="navigation" aria-label="Mobile menu">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                borderBottom: index < NAV_LINKS.length - 1 ? `1px solid ${BORDER}` : 'none',
                paddingRight: 6,
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/signup"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 8,
              paddingTop: 12,
              borderTop: `1px solid ${BORDER}`
            }}
          >
            Get Started Free
          </a>
        </div>
      )}
    </>
  );
}
