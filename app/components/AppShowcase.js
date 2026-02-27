'use client';
import { useState } from 'react';
import Image from 'next/image';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';

const TABS = [
  { id: 'status',    label: '\ud83d\udcca  Status View' },
  { id: 'equipment', label: '\u2699\ufe0f  Equipment Setup' },
];

const CAPTIONS = {
  status: [
    { icon: '\ud83d\udfe2', label: 'All green', desc: 'Relay, ATEM, OBS, Companion, ProPresenter \u2014 every connection at a glance' },
    { icon: '\ud83d\udcf9', label: 'PGM & PVW cameras', desc: 'See which camera is live and which is on deck \u2014 with live video preview' },
    { icon: '\u26a1', label: 'Auto-recovery alerts', desc: 'Tally fixes problems before you notice \u2014 then shows you what happened' },
  ],
  equipment: [
    { icon: '\ud83c\udfdb\ufe0f', label: 'Auto-discovers devices', desc: 'Finds your ATEM, OBS, Companion, ProPresenter, HyperDecks, and PTZ cameras' },
    { icon: '\u2699\ufe0f', label: 'One-time setup', desc: 'Enter IPs once, test connections, save \u2014 done in 10 minutes' },
    { icon: '\ud83c\udfa4', label: 'Audio + video', desc: 'PTZ cameras, HyperDecks, audio consoles \u2014 all from the same screen' },
  ],
};

export default function AppShowcase() {
  const [activeTab, setActiveTab] = useState('status');

  return (
    <section id="the-app" style={{
      padding: '128px 5%',
      background: CARD_BG,
      borderTop: `1px solid ${BORDER}`,
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
          textAlign: 'center', marginBottom: 20,
        }}>THE APP</p>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
          color: WHITE,
        }}>
          See exactly what&apos;s happening.<br />From anywhere.
        </h2>
        <p style={{
          color: MUTED, textAlign: 'center', fontSize: '1rem',
          maxWidth: 560, margin: '0 auto 64px', lineHeight: 1.7,
        }}>
          The Tally client installs on your booth computer in minutes.
          Your TD sees every device status at a glance &mdash; and you see every church from your phone.
        </p>

        {/* Tab selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: 4, gap: 4,
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className="app-tab-btn"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 22px', border: 'none', borderRadius: 7,
                  fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all .2s',
                  background: activeTab === tab.id ? GREEN : 'transparent',
                  color: activeTab === tab.id ? '#000' : MUTED,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot frame */}
        <div style={{
          position: 'relative',
          borderRadius: 16,
          border: `1px solid ${activeTab === 'status' ? GREEN : BORDER}`,
          overflow: 'hidden',
          boxShadow: activeTab === 'status'
            ? '0 0 60px rgba(34,197,94,0.18), 0 32px 80px rgba(0,0,0,0.6)'
            : '0 0 30px rgba(34,197,94,0.06), 0 32px 80px rgba(0,0,0,0.6)',
          transition: 'box-shadow .3s, border-color .3s',
          animation: 'glow-pulse 3s ease-in-out infinite',
        }}>
          {/* Window chrome bar */}
          <div style={{
            background: '#0d1117',
            padding: '12px 18px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{
              marginLeft: 12, fontSize: '0.78rem',
              fontFamily: 'ui-monospace, monospace', color: DIM,
            }}>
              Tally by ATEM School &mdash; {activeTab === 'status' ? 'Main Sanctuary' : 'Equipment Configuration'}
            </span>
          </div>
          <Image
            src={activeTab === 'status' ? '/app-status.png' : '/app-equipment.png'}
            alt={activeTab === 'status' ? 'Tally status dashboard showing live stream status, connected devices, and camera preview' : 'Tally equipment setup screen showing auto-discovered ATEM, OBS, and Companion devices'}
            width={1200}
            height={761}
            priority={activeTab === 'status'}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Caption */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16, marginTop: 32,
        }}>
          {CAPTIONS[activeTab].map((item, i) => (
            <div key={i} style={{
              background: BG, border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: '18px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: WHITE, fontSize: '0.9rem', marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: MUTED, fontSize: '0.82rem', lineHeight: 1.55 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
