'use client';
import { useState, useMemo } from 'react';
import { BG, CARD_BG, BORDER, GREEN, WHITE, MUTED, DIM } from '../../lib/tokens';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import StickyCTA from '../components/StickyCTA';

const CATEGORIES = [
  {
    id: 'switchers',
    name: 'Switchers',
    icon: '\uD83C\uDFAC',
    devices: [
      { name: 'ATEM 1 M/E', features: ['Tally', 'Switching', 'Macros', 'Media Pool', 'Auto-recovery'], minVersion: 'Firmware 8.6+', notes: 'Full control via Ethernet. Most popular church switcher.' },
      { name: 'ATEM 2 M/E', features: ['Tally', 'Switching', 'Macros', 'Media Pool', 'SuperSource', 'Auto-recovery'], minVersion: 'Firmware 8.6+', notes: 'Full control including SuperSource.' },
      { name: 'ATEM 4 M/E', features: ['Tally', 'Switching', 'Macros', 'Media Pool', 'SuperSource', 'Auto-recovery'], minVersion: 'Firmware 8.6+', notes: 'Full control. Recommended for large multi-camera setups.' },
      { name: 'ATEM Mini', features: ['Tally', 'Switching', 'Streaming Control', 'Auto-recovery'], minVersion: 'Firmware 8.6+', notes: 'USB and HDMI output monitoring.' },
      { name: 'ATEM Mini Pro', features: ['Tally', 'Switching', 'Streaming Control', 'Recording', 'Auto-recovery'], minVersion: 'Firmware 8.6+', notes: 'Includes built-in streaming and recording control.' },
      { name: 'ATEM Mini Extreme', features: ['Tally', 'Switching', 'Macros', 'SuperSource', 'Streaming', 'Auto-recovery'], minVersion: 'Firmware 8.6+', notes: 'Full feature set including SuperSource and macros.' },
      { name: 'ATEM Television Studio', features: ['Tally', 'Switching', 'Macros', 'Auto-recovery'], minVersion: 'Firmware 8.6+', notes: 'Full rack-mount switcher control.' },
      { name: 'vMix', features: ['Tally', 'Switching', 'Streaming Control', 'Recording', 'Auto-recovery'], minVersion: 'vMix 24+', notes: 'Connected via vMix TCP API. Supports inputs, overlays, and streaming.' },
    ],
  },
  {
    id: 'encoders',
    name: 'Encoders',
    icon: '\uD83D\uDCE1',
    devices: [
      { name: 'OBS Studio', features: ['Scene Switching', 'Streaming Control', 'Recording', 'Auto-recovery', 'Source Monitoring'], minVersion: 'OBS 28+', notes: 'Connected via obs-websocket 5.x. Full scene and source control.' },
      { name: 'Ecamm Live', features: ['Streaming Control', 'Scene Switching', 'Auto-recovery'], minVersion: 'Ecamm 4+', notes: 'macOS only. HTTP API integration.' },
      { name: 'Teradek', features: ['Stream Health Monitoring', 'Bitrate Monitoring', 'Auto-recovery'], minVersion: 'VidiU Go / Cube', notes: 'RTMP and SRT stream monitoring.' },
      { name: 'YoloBox', features: ['Stream Health Monitoring', 'Auto-recovery'], minVersion: 'YoloBox Pro', notes: 'Monitoring via network API.' },
      { name: 'Epiphan', features: ['Stream Health Monitoring', 'Recording Status', 'Auto-recovery'], minVersion: 'Pearl / Pearl Mini', notes: 'Full API integration for streaming and recording.' },
      { name: 'AJA HELO', features: ['Stream Health Monitoring', 'Recording Status', 'Auto-recovery'], minVersion: 'Firmware 3.0+', notes: 'H.264 streaming and recording monitoring.' },
      { name: 'Blackmagic Web Presenter', features: ['Stream Health Monitoring', 'Status Monitoring'], minVersion: 'Web Presenter HD', notes: 'Basic streaming status via Blackmagic SDK.' },
      { name: 'Kiloview', features: ['Stream Health Monitoring', 'NDI Monitoring', 'Auto-recovery'], minVersion: 'N-series', notes: 'NDI and SRT encoder monitoring.' },
    ],
  },
  {
    id: 'presentation',
    name: 'Presentation',
    icon: '\uD83D\uDCCA',
    devices: [
      { name: 'ProPresenter', features: ['Slide Control', 'Look Triggers', 'Stage Messages', 'Timers', 'Prop Control', 'Remote Control'], minVersion: 'ProPresenter 7.9+', notes: 'Deep integration via Pro7 network API. Control slides, looks, timers, stage messages, and props.' },
      { name: 'Resolume Arena', features: ['Layer Control', 'Composition Triggers', 'Parameter Control'], minVersion: 'Resolume 7+', notes: 'OSC integration for video wall and LED control.' },
    ],
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: '\uD83C\uDFA4',
    devices: [
      { name: 'Behringer X32', features: ['Fader Control', 'Mute/Solo', 'EQ', 'Compression', 'Gates', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 4.0+', notes: 'Full OSC control over Ethernet. Channel strips, buses, and DCA groups.' },
      { name: 'Behringer M32 / Midas M32', features: ['Fader Control', 'Mute/Solo', 'EQ', 'Compression', 'Gates', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 4.0+', notes: 'Same protocol as X32. Full channel control.' },
      { name: 'Allen & Heath SQ', features: ['Fader Control', 'Mute/Solo', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 1.5+', notes: 'TCP/MIDI integration. Scene recall and channel control.' },
      { name: 'Allen & Heath dLive', features: ['Fader Control', 'Mute/Solo', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 1.9+', notes: 'TCP integration for large-format console control.' },
      { name: 'Yamaha CL Series', features: ['Fader Control', 'Mute/Solo', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 5.0+', notes: 'MIDI integration for CL1, CL3, CL5.' },
      { name: 'Yamaha QL Series', features: ['Fader Control', 'Mute/Solo', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 5.0+', notes: 'MIDI integration for QL1, QL5.' },
      { name: 'Yamaha TF Series', features: ['Fader Control', 'Mute/Solo', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 4.0+', notes: 'Network control for TF1, TF3, TF5, TF-Rack.' },
      { name: 'Behringer Wing', features: ['Fader Control', 'Mute/Solo', 'EQ', 'Compression', 'Scene Recall', 'Monitoring'], minVersion: 'Firmware 1.0+', notes: 'OSC control. Full channel and bus management.' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    icon: '\uD83D\uDD27',
    devices: [
      { name: 'Bitfocus Companion 2.x', features: ['Button Triggers', 'Action Execution', 'Feedback Monitoring'], minVersion: '2.4+', notes: 'TCP integration. Trigger any Companion button or action remotely.' },
      { name: 'Bitfocus Companion 3.x', features: ['Button Triggers', 'Action Execution', 'Feedback Monitoring', 'Surface Emulation'], minVersion: '3.0+', notes: 'Updated API with enhanced surface and connection control.' },
      { name: 'HyperDeck', features: ['Recording Control', 'Playback', 'Clip Management', 'Status Monitoring'], minVersion: 'HyperDeck Studio', notes: 'Ethernet control via Blackmagic HyperDeck protocol.' },
      { name: 'NDI', features: ['Source Discovery', 'Stream Monitoring', 'Tally'], minVersion: 'NDI 5+', notes: 'Automatic NDI source discovery and health monitoring on the network.' },
      { name: 'PTZ Cameras (ONVIF)', features: ['Pan/Tilt/Zoom', 'Preset Recall', 'Status Monitoring'], minVersion: 'ONVIF Profile S', notes: 'Works with any ONVIF-compliant PTZ camera.' },
      { name: 'PTZ Cameras (VISCA)', features: ['Pan/Tilt/Zoom', 'Preset Recall', 'Focus Control'], minVersion: 'VISCA over IP', notes: 'Serial or IP VISCA control for Sony, PTZOptics, and compatible cameras.' },
    ],
  },
];

const ALL_CATEGORIES = ['All', ...CATEGORIES.map(c => c.name)];

export default function HardwareCompatibility() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CATEGORIES
      .filter(cat => activeCategory === 'All' || cat.name === activeCategory)
      .map(cat => ({
        ...cat,
        devices: cat.devices.filter(d =>
          !q ||
          d.name.toLowerCase().includes(q) ||
          d.features.some(f => f.toLowerCase().includes(q)) ||
          d.notes.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.devices.length > 0);
  }, [search, activeCategory]);

  return (
    <div style={{ background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", minHeight: '100vh' }}>
      <Nav />
      <StickyCTA />
      <main style={{ paddingTop: 80 }}>
        <section style={{ padding: '96px 5% 128px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{
              fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.15em', color: GREEN,
              textAlign: 'center', marginBottom: 20,
            }}>COMPATIBILITY</p>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900,
              letterSpacing: '-0.02em', textAlign: 'center', margin: '0 auto 16px',
              color: WHITE,
            }}>Hardware &amp; Software Compatibility</h1>

            <p style={{
              color: MUTED, textAlign: 'center', fontSize: '1rem',
              maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7,
            }}>
              Tally integrates with the gear your church already uses. Search by device name or feature to check compatibility.
            </p>

            {/* Search bar */}
            <div style={{ maxWidth: 500, margin: '0 auto 32px' }}>
              <input
                type="text"
                placeholder="Search devices, features, or brands..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search compatible hardware"
                style={{
                  width: '100%', padding: '14px 20px', fontSize: '0.95rem',
                  borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: CARD_BG, color: WHITE,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color .2s',
                }}
                onFocus={e => { e.target.style.borderColor = GREEN; }}
                onBlur={e => { e.target.style.borderColor = BORDER; }}
              />
            </div>

            {/* Category filter */}
            <div style={{
              display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
              gap: 8, marginBottom: 48,
            }}>
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700,
                    borderRadius: 8, cursor: 'pointer', transition: 'all .2s',
                    border: `1px solid ${activeCategory === cat ? GREEN : BORDER}`,
                    background: activeCategory === cat ? 'rgba(34,197,94,0.12)' : 'transparent',
                    color: activeCategory === cat ? GREEN : MUTED,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Device listings */}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: DIM }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>No matching devices found.</p>
                <p style={{ fontSize: '0.9rem' }}>Try a different search term or category.</p>
              </div>
            )}

            {filtered.map(cat => (
              <div key={cat.id} style={{ marginBottom: 56 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                  <h2 style={{
                    fontSize: '1.3rem', fontWeight: 800, color: WHITE, margin: 0,
                  }}>{cat.name}</h2>
                  <span style={{
                    fontFamily: 'ui-monospace, monospace', fontSize: '0.65rem',
                    fontWeight: 700, letterSpacing: '0.1em', color: GREEN,
                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 4, padding: '3px 8px',
                  }}>{cat.devices.length} DEVICES</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 16,
                }}>
                  {cat.devices.map((device, i) => (
                    <div key={i} style={{
                      background: CARD_BG, border: `1px solid ${BORDER}`,
                      borderRadius: 14, padding: '28px 24px',
                      transition: 'border-color .2s',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                      }}>
                        <span style={{
                          color: GREEN, fontSize: '0.9rem', fontWeight: 700,
                        }}>{'\u2713'}</span>
                        <h3 style={{
                          fontSize: '1rem', fontWeight: 800, color: WHITE, margin: 0,
                        }}>{device.name}</h3>
                      </div>

                      {/* Features */}
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16,
                      }}>
                        {device.features.map((feat, j) => (
                          <span key={j} style={{
                            fontFamily: 'ui-monospace, monospace', fontSize: '0.6rem',
                            fontWeight: 700, letterSpacing: '0.06em', color: MUTED,
                            background: 'rgba(148,163,184,0.08)',
                            border: `1px solid ${BORDER}`,
                            borderRadius: 4, padding: '3px 8px',
                          }}>{feat}</span>
                        ))}
                      </div>

                      {/* Min version */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 8,
                      }}>
                        <span style={{
                          color: DIM, fontSize: '0.75rem', fontWeight: 700,
                          fontFamily: 'ui-monospace, monospace',
                        }}>MIN VERSION</span>
                        <span style={{
                          color: WHITE, fontSize: '0.82rem', fontWeight: 600,
                        }}>{device.minVersion}</span>
                      </div>

                      {/* Notes */}
                      <p style={{
                        color: MUTED, fontSize: '0.82rem', margin: 0,
                        lineHeight: 1.6,
                      }}>{device.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div style={{
              textAlign: 'center', padding: '48px 0 0',
              borderTop: `1px solid ${BORDER}`,
            }}>
              <p style={{ color: MUTED, fontSize: '0.95rem', marginBottom: 20 }}>
                Don&apos;t see your device? Reach out &mdash; we add integrations fast.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <a href="/signup" style={{
                  display: 'inline-block', padding: '13px 28px', fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: 8, textDecoration: 'none',
                  background: GREEN, color: '#000',
                }}>Start Free Trial &rarr;</a>
                <a href="mailto:support@tallyconnect.app" style={{
                  display: 'inline-block', padding: '13px 28px', fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: 8, textDecoration: 'none',
                  background: 'transparent', color: WHITE,
                  border: `1px solid ${BORDER}`,
                }}>Request a Device &rarr;</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
