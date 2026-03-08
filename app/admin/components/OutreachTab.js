'use client';
import { useState } from 'react';
import { C, s } from './adminStyles';

const SOURCE_OPTIONS = [
  { id: 'facebook', label: 'Facebook Group' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'direct', label: 'Direct Outreach' },
  { id: 'healthcheck', label: 'After Health Check' },
];

const TYPE_OPTIONS = [
  { id: 'cold-dm', label: 'Cold DM' },
  { id: 'healthcheck-followup', label: 'Health Check Follow-up' },
  { id: 'group-reply', label: 'Group Reply' },
  { id: 'email', label: 'Email' },
];

const pill = (active) => ({
  padding: '9px 16px',
  background: active ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${active ? C.green : C.border}`,
  borderRadius: 8,
  color: active ? C.green : C.muted,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
});

export default function OutreachTab() {
  const [prospectName, setProspectName] = useState('');
  const [churchName, setChurchName] = useState('');
  const [source, setSource] = useState('');
  const [messageType, setMessageType] = useState('');
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!messageType) {
      setError('Select a message type.');
      return;
    }
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': typeof sessionStorage !== 'undefined'
            ? sessionStorage.getItem('tally_admin_token') || ''
            : '',
        },
        body: JSON.stringify({
          messageType,
          prospectName: prospectName.trim(),
          churchName: churchName.trim(),
          source,
          context: context.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setOutput(data.message || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      {/* Context */}
      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          Who are you reaching out to?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={s.label}>Their name</label>
            <input
              style={s.input}
              placeholder="e.g. Dave"
              value={prospectName}
              onChange={e => setProspectName(e.target.value)}
            />
          </div>
          <div>
            <label style={s.label}>Church name</label>
            <input
              style={s.input}
              placeholder="e.g. Harvest Church"
              value={churchName}
              onChange={e => setChurchName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label style={s.label}>What do you know about them?</label>
          <textarea
            style={{
              ...s.input,
              minHeight: 80,
              resize: 'vertical',
              lineHeight: 1.6,
            }}
            placeholder="e.g. Posted about their ATEM dropping during Easter service. Runs a 300-person church, solo tech person. Uses OBS for streaming."
            value={context}
            onChange={e => setContext(e.target.value)}
          />
        </div>
      </div>

      {/* Source */}
      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          Where did you find them?
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SOURCE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              style={pill(source === opt.id)}
              onClick={() => setSource(source === opt.id ? '' : opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Type */}
      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          What kind of message?
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              style={pill(messageType === opt.id)}
              onClick={() => setMessageType(messageType === opt.id ? '' : opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          style={{ ...s.btn('primary'), padding: '12px 28px', fontSize: 13, opacity: loading ? 0.6 : 1 }}
          onClick={generate}
          disabled={loading || !messageType}
        >
          {loading ? 'Generating...' : 'Generate Message'}
        </button>
      </div>

      {error && (
        <div style={{ ...s.card, borderColor: C.red, marginBottom: 16 }}>
          <div style={{ color: C.red, fontSize: 13 }}>{error}</div>
        </div>
      )}

      {/* Output */}
      {output && (
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Your Message</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.btn('primary')} onClick={copyOutput}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button style={s.btn('secondary')} onClick={generate} disabled={loading}>
                Regenerate
              </button>
            </div>
          </div>
          <textarea
            style={{
              ...s.input,
              minHeight: 160,
              resize: 'vertical',
              lineHeight: 1.7,
              fontSize: 13,
            }}
            value={output}
            onChange={e => setOutput(e.target.value)}
          />
        </div>
      )}
    </>
  );
}
