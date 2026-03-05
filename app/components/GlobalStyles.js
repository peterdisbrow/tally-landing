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
      .blog-card:hover {
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
      .footer-link:hover { color: ${MUTED} !important; }
      .app-tab-btn {
        transition: all 0.2s;
      }
      .app-tab-btn:hover {
        color: ${WHITE} !important;
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
      @media (max-width: 840px) {}
    `}</style>
  );
}
