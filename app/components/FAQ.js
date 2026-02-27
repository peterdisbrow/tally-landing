'use client';
import { useState } from 'react';
import { CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

const FAQ_ITEMS = [
  {
    q: 'What equipment does Tally work with?',
    a: 'ATEM switchers, OBS Studio, vMix, ProPresenter, Bitfocus Companion, audio consoles (Behringer X32, Midas M32, Allen & Heath, Yamaha CL/QL), HyperDeck recorders, PTZ cameras, Resolume Arena, Video Hub routers, Dante audio, Planning Center, Slack, and Telegram. 17 integrations and counting.',
  },
  {
    q: 'What happens if our internet goes down?',
    a: "Tally can't monitor remotely without internet, but it detects the disconnection immediately and alerts your TD. Your production gear still works normally \u2014 Tally is a monitoring layer, not a dependency. Nothing breaks if Tally goes offline.",
  },
  {
    q: 'How long does setup take?',
    a: 'About 10 minutes. Download the app on your booth computer, sign in with your registration code, and Tally auto-discovers your ATEM, OBS, and other gear on the network. No port forwarding, no complex configuration.',
  },
  {
    q: 'What if our stream drops during service?',
    a: 'Tally detects it in seconds and auto-restarts OBS streaming. Most recoveries happen in under 10 seconds \u2014 before anyone in the congregation notices. You get a Telegram alert that says "handled."',
  },
  {
    q: 'Do I need a dedicated computer?',
    a: "No. Tally runs on whatever computer is already in your booth \u2014 Windows or Mac. It's lightweight and runs alongside OBS, ProPresenter, and everything else you already have running.",
  },
  {
    q: 'Can volunteers run this?',
    a: "That's the whole point. Tally handles troubleshooting automatically so volunteers can focus on the creative side \u2014 camera work, slides, audio levels. They stop dreading tech Sundays because they're not responsible for fixing crashes anymore.",
  },
  {
    q: 'What happens when my trial ends?',
    a: 'Monitoring and auto-recovery stop, but your data and settings are preserved for 30 days. Subscribe anytime to pick up right where you left off \u2014 no re-setup needed.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no cancellation fees. Cancel from your Church Portal whenever you want. Your gear keeps working exactly as it did before Tally.',
  },
];

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div
      style={{
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <h3 style={{ margin: 0 }}>
        <button
          id={buttonId}
          onClick={() => setOpen(prev => !prev)}
          aria-expanded={open}
          aria-controls={panelId}
          style={{
            width: '100%', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '20px 0', gap: 16,
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{
            fontSize: '1rem', fontWeight: 700, color: WHITE, lineHeight: 1.4,
          }}>
            {item.q}
          </span>
          <span aria-hidden="true" style={{
            fontSize: '1.3rem', color: MUTED, flexShrink: 0,
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform .2s',
          }}>
            +
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        style={{
          padding: open ? '0 0 20px' : 0, color: MUTED, fontSize: '0.95rem',
          lineHeight: 1.7, maxWidth: 640,
        }}
      >
        {open && item.a}
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" style={{
      padding: '128px 5%',
      background: CARD_BG,
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>FAQ</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 56px',
          color: WHITE,
        }}>Common questions.</h2>

        <div style={{ borderTop: `1px solid ${BORDER}` }}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <a href="/signup" style={{
            display: 'inline-block', padding: '15px 40px', fontSize: '1rem', fontWeight: 700,
            borderRadius: 8, border: 'none', background: GREEN, color: '#000',
            cursor: 'pointer', textDecoration: 'none',
          }}>
            Start Free &mdash; 30 Days &rarr;
          </a>
          <p style={{ color: DIM, fontSize: '0.85rem', marginTop: 16 }}>
            30-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
