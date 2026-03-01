'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { BG, CARD_BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM } from '../../lib/tokens';

/* ─── Quick-action pills shown on first open ─── */
const PILLS = [
  { label: 'Ask about features', msg: 'What are the main features of Tally?' },
  { label: 'See pricing',        msg: 'What are your pricing plans?' },
  { label: 'Try a live demo',    msg: 'I want to try a live demo. What commands can I send?' },
];

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
