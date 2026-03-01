'use client';
import { useState } from 'react';
import { GREEN, GREEN_LT, WHITE, BORDER, CARD_BG, BG } from './tokens';

/* ─── Lightweight markdown renderer for chat messages ───
   Handles: **bold**, *italic*, [links](url), bullet/numbered lists,
   ```tally-output``` fences, [CTA:Label:/path] buttons, [LEAD_FORM] inline capture.
   No external deps — ~80 lines replacing the old renderContent(). */

/* ── Inline email capture form ── */
function LeadForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const handle = () => {
    if (!email.includes('@')) return;
    onSubmit(email);
    setSent(true);
  };
  if (sent) return <div style={{ color: GREEN_LT, fontSize: 12, marginTop: 6 }}>Thanks! We'll be in touch.</div>;
  return (
    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
      <input
        type="email" placeholder="your@email.com" value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handle()}
        style={{
          flex: 1, padding: '6px 10px', borderRadius: 6,
          border: `1px solid ${BORDER}`, background: CARD_BG,
          color: WHITE, fontSize: 12, outline: 'none', fontFamily: 'inherit',
        }}
      />
      <button onClick={handle} style={{
        padding: '6px 14px', borderRadius: 6, border: 'none',
        background: GREEN, color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>Send</button>
    </div>
  );
}

/* ── Render a tally-output terminal block ── */
function TallyOutput({ text, idx }) {
  return (
    <div key={`to-${idx}`} style={{
      background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: 8, padding: '10px 12px', margin: '6px 0',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 12, color: GREEN_LT, whiteSpace: 'pre-wrap', lineHeight: 1.5,
    }}>{text.trim()}</div>
  );
}

/* ── Render a CTA button ── */
function CtaButton({ label, href, idx }) {
  return (
    <a key={`cta-${idx}`} href={href}
      target={href.startsWith('http') || href.startsWith('mailto') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      style={{
        display: 'inline-block', background: GREEN, color: '#000',
        padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13,
        textDecoration: 'none', marginTop: 8, marginRight: 8,
      }}>{label}</a>
  );
}

/* ── Parse inline markdown (bold, italic, links) ── */
function parseInline(text, keyBase) {
  // Split on bold, italic, and link patterns — process in order of specificity
  const parts = [];
  // Regex that captures **bold**, *italic*, and [text](url) in one pass
  const rx = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = rx.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) { // **bold**
      parts.push(<strong key={`${keyBase}-b${i}`} style={{ color: WHITE, fontWeight: 600 }}>{match[2]}</strong>);
    } else if (match[3]) { // *italic*
      parts.push(<em key={`${keyBase}-i${i}`} style={{ color: GREEN_LT }}>{match[4]}</em>);
    } else if (match[5]) { // [text](url)
      parts.push(<a key={`${keyBase}-a${i}`} href={match[7]} style={{ color: GREEN_LT, textDecoration: 'underline' }}
        target={match[7].startsWith('http') ? '_blank' : undefined}
        rel={match[7].startsWith('http') ? 'noopener noreferrer' : undefined}
      >{match[6]}</a>);
    }
    last = match.index + match[0].length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

/* ── Main export: parse full message into React elements ── */
export function parseMarkdown(text, { onLeadSubmit } = {}) {
  if (!text) return null;

  // Step 1: Split on tally-output fences
  const fenceParts = text.split(/(```tally-output\n[\s\S]*?```)/g);

  return fenceParts.map((segment, si) => {
    // Tally-output fence
    const fenceMatch = segment.match(/^```tally-output\n([\s\S]*?)```$/);
    if (fenceMatch) return <TallyOutput key={si} text={fenceMatch[1]} idx={si} />;

    // Regular text segment — process line by line
    if (!segment.trim()) return null;
    const lines = segment.split('\n');
    const elements = [];

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const key = `${si}-${li}`;

      // CTA button: [CTA:Label:/path]
      const ctaMatch = line.match(/\[CTA:([^:]+):([^\]]+)\]/);
      if (ctaMatch) {
        // Render any text before the CTA on the same line
        const before = line.slice(0, line.indexOf('[CTA:'));
        if (before.trim()) elements.push(<span key={`${key}-pre`}>{parseInline(before, key)}</span>);
        elements.push(<CtaButton key={key} label={ctaMatch[1]} href={ctaMatch[2]} idx={li} />);
        // Any text after the CTA
        const after = line.slice(line.indexOf(ctaMatch[0]) + ctaMatch[0].length);
        if (after.trim()) elements.push(<span key={`${key}-post`}>{parseInline(after, key)}</span>);
        continue;
      }

      // Lead form: [LEAD_FORM]
      if (line.includes('[LEAD_FORM]')) {
        elements.push(<LeadForm key={key} onSubmit={onLeadSubmit || (() => {})} />);
        continue;
      }

      // Strip [LEAD_CAPTURE:...] tags (handled by ChatWidget, not rendered)
      if (/\[LEAD_CAPTURE:[^\]]+\]/.test(line)) continue;

      // Bullet list item: • or -
      if (/^[•\-]\s/.test(line.trim())) {
        elements.push(
          <div key={key} style={{ paddingLeft: 12, marginTop: 2 }}>
            {parseInline(line.trim(), key)}
          </div>
        );
        continue;
      }

      // Numbered list item: 1. 2. etc.
      if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <div key={key} style={{ paddingLeft: 12, marginTop: 2 }}>
            {parseInline(line.trim(), key)}
          </div>
        );
        continue;
      }

      // Regular line with inline markdown
      if (line.trim()) {
        elements.push(<div key={key}>{parseInline(line, key)}</div>);
      } else if (li > 0 && li < lines.length - 1) {
        // Blank line between content → spacer
        elements.push(<div key={key} style={{ height: 8 }} />);
      }
    }

    return elements.length ? <span key={si}>{elements}</span> : null;
  });
}
