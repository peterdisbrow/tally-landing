'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { BG, CARD_BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM } from '../../lib/tokens';
import { FEATURES, INTEGRATIONS, PRICING } from '../../lib/data';

/* ─── Quick-action pills shown on first open ─── */
const PILLS = [
  { label: 'Ask about features', msg: 'What are the main features of Tally?' },
  { label: 'See pricing',        msg: 'What are your pricing plans?' },
  { label: 'Try a live demo',    msg: 'I want to try a live demo. What commands can I send?' },
];

/* ─── Static responses — no AI tokens needed ─── */

function buildPricingResponse() {
  const lines = PRICING.map(p => {
    const save = p.annualPrice ? ` ($${p.annualPrice}/yr — save 2 months)` : '';
    return `**${p.name}** — $${p.monthlyPrice}/mo${save}\n${p.desc}\n• ${p.features.join('\n• ')}`;
  });
  return `Here are our plans:\n\n${lines.join('\n\n')}\n\nAll plans include a 30-day free trial — no credit card required. Which plan sounds like the best fit for your church?`;
}

function buildFeaturesResponse() {
  const top6 = FEATURES.slice(0, 6);
  const lines = top6.map(f => `**${f.name}** — ${f.desc}`);
  return `Tally has ${FEATURES.length} major features. Here are the highlights:\n\n${lines.join('\n\n')}\n\nWant to hear about the other ${FEATURES.length - 6} features, or ask about a specific one?`;
}

function buildIntegrationsResponse() {
  const byTag = {};
  INTEGRATIONS.forEach(i => {
    if (!byTag[i.tag]) byTag[i.tag] = [];
    byTag[i.tag].push(i.name);
  });
  const lines = Object.entries(byTag).map(([tag, names]) => `**${tag}**: ${names.join(', ')}`);
  return `Tally supports ${INTEGRATIONS.length} integrations:\n\n${lines.join('\n')}\n\nIs your gear on the list? Tell me what you run and I'll confirm compatibility.`;
}

function buildSetupResponse() {
  return `Setup takes about 10 minutes:\n\n1. **Download** the Tally app on your booth computer (macOS or Windows)\n2. **Sign in** with your registration code\n3. **Auto-discovery** — Tally finds your ATEM, OBS, Companion, and other devices on the network automatically\n4. **AI Setup Assistant** (optional) — upload a patch list, camera plot, CSV, or even a photo and Tally auto-configures your mixer channels and ATEM input labels\n\nNo port forwarding needed. Works behind church firewalls. Runs alongside OBS, ProPresenter, etc. on your existing computer.\n\nWant to start a free trial?`;
}

function buildTrialResponse() {
  return `Getting started is easy:\n\n• **30-day free trial** — no credit card required\n• Full access to all features on your chosen plan\n• Cancel anytime, no questions asked\n• If you don't subscribe after the trial, monitoring stops but your data is preserved for 30 days\n\n→ **Start your free trial at /signup**\n\nNot sure which plan? Tell me about your setup (how many rooms, what gear) and I'll recommend one.`;
}

function buildSupportResponse() {
  return `Here's how to get help:\n\n• **Email**: support@atemschool.com\n• **Sales**: sales@atemschool.com\n• **How-To Guides**: 16 step-by-step setup guides at tallyconnect.app → Guides\n• **Help Center**: tallyconnect.app/help\n\nOr just ask me here — I can answer most questions about features, setup, and troubleshooting!`;
}

function buildDemoIntro() {
  return `Welcome to the live demo! This simulates a real Tally-connected production booth.\n\nYour demo setup:\n• **ATEM** — 6 inputs (CAM 1 Wide, CAM 2 Pastor, CAM 3 Band, CAM 4 Overhead, Media Player 1, Color Bars)\n• **Audio** — Behringer X32 (Ch 1: Pastor Lav, Ch 2: Worship Lead, Ch 3–12: Band & Choir)\n• **OBS** — Streaming to YouTube at 6000kbps\n• **ProPresenter** — "Sunday Morning" playlist, slide 3 of 12\n\nTry any of these commands:\n• "cut to camera 2"\n• "fade to black"\n• "mute channel 3"\n• "next slide"\n• "start recording"\n• "run pre-service check"\n\nType a command and I'll show you what Tally does!`;
}

/* Keyword matching for static flows */
const STATIC_FLOWS = [
  { match: (m) => /\b(pricing|plans?|cost|how much|price)\b/i.test(m),         reply: buildPricingResponse },
  { match: (m) => /\b(features?|what (does|can)|capabilities|overview)\b/i.test(m) && !/demo/i.test(m), reply: buildFeaturesResponse },
  { match: (m) => /\b(integrations?|devices?|supported|compatible|work with|connect to)\b/i.test(m), reply: buildIntegrationsResponse },
  { match: (m) => /\b(set ?up|install|get started|onboard|how.*(start|begin))\b/i.test(m) && !/trial/i.test(m), reply: buildSetupResponse },
  { match: (m) => /\b(free trial|sign ?up|try|start.*trial|cancel)\b/i.test(m) && !/demo/i.test(m), reply: buildTrialResponse },
  { match: (m) => /\b(support|help|contact|email|phone)\b/i.test(m),           reply: buildSupportResponse },
  { match: (m) => /\b(demo|try.*command|simulate|live demo)\b/i.test(m),       reply: buildDemoIntro },
];

function getStaticReply(message) {
  for (const flow of STATIC_FLOWS) {
    if (flow.match(message)) return flow.reply();
  }
  return null;
}

/* ─── Parse tally-output fenced blocks ─── */
function renderContent(text) {
  const parts = text.split(/```tally-output\n([\s\S]*?)```/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <div key={i} style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 8, padding: '10px 12px', margin: '6px 0',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 12, color: GREEN_LT, whiteSpace: 'pre-wrap', lineHeight: 1.5,
        }}>
          {part.trim()}
        </div>
      );
    }
    return part.trim() ? <span key={i}>{part}</span> : null;
  });
}

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  /* ── Check viewport width ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send message ── */
  const send = useCallback(async (overrideMsg) => {
    const msg = (overrideMsg || input).trim();
    if (!msg || sending) return;

    if (!overrideMsg) setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    /* ── Try static response first (no tokens) ── */
    const staticReply = getStaticReply(msg);
    if (staticReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: staticReply }]);
      return;
    }

    /* ── Fall through to AI for custom questions & demo commands ── */
    setSending(true);
    try {
      const history = [...messages, userMsg].slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'No response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setSending(false);
    }
  }, [input, sending, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  /* ── Drawer sizing ── */
  const drawerStyle = isMobile
    ? { position: 'fixed', inset: 0, width: '100%', height: '100%', borderRadius: 0, zIndex: 100 }
    : { position: 'fixed', bottom: 86, right: 28, width: 380, maxHeight: '60vh', borderRadius: 14, zIndex: 100 };

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close chat' : 'Open Tally AI chat'}
        style={{
          position: 'fixed', bottom: 24, right: 28, width: 52, height: 52,
          borderRadius: '50%', background: open ? MUTED : GREEN, color: open ? WHITE : '#000',
          border: 'none', fontSize: 22, cursor: 'pointer', zIndex: 101,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title="Tally AI"
      >
        {open ? '\u00d7' : '\u2726'}
      </button>

      {/* ── Drawer ── */}
      {open && (
        <div style={{
          ...drawerStyle,
          background: CARD_BG, border: `1px solid ${BORDER}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 18, color: GREEN }}>&#10022;</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Tally AI</div>
              <div style={{ fontSize: 10, color: MUTED }}>Sales, support &amp; live demo</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflow: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            minHeight: 200, maxHeight: isMobile ? 'calc(100vh - 130px)' : 'calc(60vh - 130px)',
          }}>
            {/* Welcome state — quick-action pills */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>
                  Hi! I can answer questions, recommend plans, or give you a live demo of Tally commands.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  {PILLS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.msg)}
                      style={{
                        background: 'transparent', border: `1px solid ${BORDER}`,
                        borderRadius: 20, padding: '7px 16px', color: GREEN_LT,
                        fontSize: 12, cursor: 'pointer', fontFamily: 'ui-monospace, monospace',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = GREEN}
                      onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <div style={{
                  background: m.role === 'user' ? 'rgba(34,197,94,0.15)' : BG,
                  border: `1px solid ${m.role === 'user' ? 'rgba(34,197,94,0.3)' : BORDER}`,
                  borderRadius: 10, padding: '8px 12px', fontSize: 13,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: WHITE,
                }}>
                  {m.role === 'assistant' ? renderContent(m.content) : m.content}
                </div>
                <div style={{ fontSize: 9, color: DIM, marginTop: 2, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.role === 'user' ? 'You' : 'Tally AI'}
                </div>
              </div>
            ))}

            {sending && (
              <div style={{ alignSelf: 'flex-start', color: GREEN, fontSize: 12, padding: '4px 0' }}>
                &#10022; Thinking&hellip;
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 14px', borderTop: `1px solid ${BORDER}`,
            display: 'flex', gap: 8,
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Tally, or try a command..."
              rows={1}
              style={{
                flex: 1, background: BG, border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: '8px 10px', color: WHITE,
                fontSize: 13, resize: 'none', outline: 'none',
                fontFamily: 'inherit', maxHeight: 80,
              }}
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              style={{
                background: GREEN, color: '#000', border: 'none',
                borderRadius: 8, padding: '8px 14px', fontSize: 13,
                fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
                opacity: (sending || !input.trim()) ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
