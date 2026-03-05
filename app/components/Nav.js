'use client';
import { useState } from 'react';
import { BG, BORDER, GREEN, WHITE, MUTED } from '../../lib/tokens';
import { NAV_LINKS } from '../../lib/data';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .tally-nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .tally-nav-link:hover { color: ${WHITE} !important; }
        .tally-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: 1px solid ${BORDER};
          border-radius: 10px;
          background: transparent;
          color: ${WHITE};
          cursor: pointer;
        }
        .tally-mobile-menu {
          position: fixed;
          top: 60px;
          left: 5%;
          right: 5%;
          padding: 14px;
          background: ${BG};
          border: 1px solid ${BORDER};
          border-radius: 12px;
          box-shadow: 0 24px 70px rgba(0,0,0,.5);
          z-index: 99;
        }
        .tally-mobile-menu a {
          color: ${MUTED};
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          display: block;
          padding: 10px 4px;
        }
        .tally-mobile-menu a:hover { color: ${WHITE}; }
        .tally-dropdown { position: relative; }
        .tally-dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding-top: 12px;
          z-index: 101;
        }
        .tally-dropdown:hover .tally-dropdown-menu { display: block; }
        .tally-dropdown-inner {
          background: ${BG};
          border: 1px solid ${BORDER};
          border-radius: 10px;
          padding: 8px 0;
          min-width: 220px;
          box-shadow: 0 16px 48px rgba(0,0,0,.5);
        }
        .tally-dropdown-inner a {
          display: block;
          padding: 10px 18px;
          color: ${MUTED};
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.15s, background 0.15s;
        }
        .tally-dropdown-inner a:hover {
          color: ${WHITE};
          background: rgba(34,197,94,0.06);
        }
        @media (max-width: 840px) {
          .tally-nav-links { display: none; }
          .tally-menu-btn { display: inline-flex; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 5%',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: GREEN, display: 'inline-block', boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ color: WHITE, fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.01em' }}>Tally</span>
        </a>
        <div className="tally-nav-links">
          {NAV_LINKS.map(link => (
            link.children ? (
              <div key={link.href} className="tally-dropdown">
                <a
                  href={link.href}
                  className="tally-nav-link"
                  style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', transition: 'color .2s' }}
                >
                  {link.label} <span style={{ fontSize: '0.65rem', marginLeft: 2, opacity: 0.7 }}>&#9662;</span>
                </a>
                <div className="tally-dropdown-menu">
                  <div className="tally-dropdown-inner">
                    {link.children.map(child => (
                      <a key={child.href} href={child.href}>{child.label}</a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="tally-nav-link"
                style={{ color: MUTED, textDecoration: 'none', fontSize: '0.88rem', transition: 'color .2s' }}
              >
                {link.label}
              </a>
            )
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
          className="tally-menu-btn"
          aria-label={menuOpen ? 'Close main menu' : 'Open main menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{menuOpen ? '\u2715' : '\u2630'}</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="tally-mobile-menu" role="navigation" aria-label="Mobile menu">
          {NAV_LINKS.map((link, index) => (
            link.children ? (
              link.children.map(child => (
                <a
                  key={child.href}
                  href={child.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    borderBottom: `1px solid ${BORDER}`,
                    paddingRight: 6,
                  }}
                >
                  {child.label}
                </a>
              ))
            ) : (
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
            )
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
