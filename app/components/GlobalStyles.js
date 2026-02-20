import { BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM } from '../../lib/tokens';

export default function GlobalStyles() {
  return (
    <style>{`
      @keyframes marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 30px rgba(34,197,94,0.15); }
        50%       { box-shadow: 0 0 60px rgba(34,197,94,0.28); }
      }
      .marquee-track {
        display: flex;
        width: max-content;
        animation: marquee 22s linear infinite;
      }
      .integration-card:hover {
        border-color: ${GREEN} !important;
        box-shadow: 0 0 20px rgba(34,197,94,0.1);
      }
      .feature-card:hover {
        border-color: ${GREEN} !important;
        box-shadow: 0 0 20px rgba(34,197,94,0.1);
      }
      .price-card-default:hover {
        border-color: ${GREEN} !important;
      }
      .cta-ghost:hover {
        border-color: ${GREEN} !important;
        color: ${GREEN_LT} !important;
      }
      .nav-link:hover { color: ${WHITE} !important; }
      .footer-link:hover { color: ${MUTED} !important; }
      .app-tab-btn {
        transition: all 0.2s;
      }
      .app-tab-btn:hover {
        color: ${WHITE} !important;
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 24px;
      }
      .menu-button {
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
      .mobile-menu {
        display: none;
        position: fixed;
        top: 78px;
        left: 5%;
        right: 5%;
        padding: 14px;
        background: ${BG};
        border: 1px solid ${BORDER};
        border-radius: 12px;
        box-shadow: 0 24px 70px rgba(0,0,0,.5);
        z-index: 99;
      }
      .mobile-menu a {
        color: ${MUTED};
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        display: block;
        padding: 10px 4px;
      }
      input:focus, select:focus, textarea:focus {
        border-color: ${GREEN} !important;
        box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
        outline: none;
      }
      button:focus-visible {
        outline: 2px solid ${GREEN};
        outline-offset: 2px;
      }
      a:focus-visible {
        outline: 2px solid ${GREEN};
        outline-offset: 2px;
        border-radius: 4px;
      }
      @media (prefers-reduced-motion: reduce) {
        .marquee-track {
          animation: none !important;
        }
        * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
      @media (max-width: 840px) {
        .nav-links {
          display: none;
        }
        .menu-button {
          display: inline-flex;
        }
        .mobile-menu {
          display: block;
        }
      }
    `}</style>
  );
}
