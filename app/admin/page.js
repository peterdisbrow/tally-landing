'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:      '#09090B',
  surface: '#0F1613',
  border:  '#1a2e1f',
  green:   '#22c55e',
  greenLt: '#4ade80',
  white:   '#F8FAFC',
  muted:   '#94A3B8',
  dim:     '#475569',
  red:     '#ef4444',
  yellow:  '#f59e0b',
  blue:    '#3b82f6',
};

const PLAN_OPTIONS = ['connect', 'plus', 'pro', 'managed', 'event'];
const PLAN_STATUS_OPTIONS = ['active', 'trialing', 'inactive', 'pending', 'past_due', 'canceled', 'trial_expired'];

const s = {
  page:    { minHeight: '100vh', background: C.bg, color: C.white, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", fontSize: 14 },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: `1px solid ${C.border}`, background: C.surface, position: 'sticky', top: 0, zIndex: 10 },
  logo:    { fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', color: C.white },
  logoGreen: { color: C.green },
  main:    { padding: '28px', maxWidth: 1200, margin: '0 auto' },
  card:    { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 },
  tabBar:  { display: 'flex', gap: 2, borderBottom: `1px solid ${C.border}`, marginBottom: 24 },
  tab:     (active) => ({ background: 'none', border: 'none', color: active ? C.green : C.muted, fontSize: 13, fontWeight: 600, padding: '10px 16px', cursor: 'pointer', borderBottom: `2px solid ${active ? C.green : 'transparent'}`, marginBottom: -1, transition: 'all 0.15s', whiteSpace: 'nowrap' }),
  btn:     (variant = 'primary') => ({
    background: variant === 'primary' ? C.green : variant === 'danger' ? C.red : 'rgba(255,255,255,0.08)',
    color: variant === 'primary' ? '#000' : C.white,
    border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.15s',
  }),
  input:   { width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontSize: 13, padding: '9px 12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  label:   { display: 'block', fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  table:   { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:      { textAlign: 'left', padding: '8px 12px', color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.border}` },
  td:      { padding: '10px 12px', borderBottom: `1px solid rgba(26,46,31,0.5)`, verticalAlign: 'middle' },
  badge:   (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}20`, color }),
  modal:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 },
  modalBox:{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, width: 420, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' },
  wideModalBox: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, width: 640, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' },
  detailTab: (active) => ({ background: active ? 'rgba(34,197,94,0.12)' : 'none', border: active ? `1px solid rgba(34,197,94,0.3)` : '1px solid transparent', color: active ? C.green : C.muted, fontSize: 12, fontWeight: 600, padding: '6px 14px', cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s', whiteSpace: 'nowrap' }),
  err:     { color: C.red, fontSize: 12, marginTop: 8 },
  ok:      { color: C.green, fontSize: 12, marginTop: 8 },
  empty:   { textAlign: 'center', color: C.muted, padding: '40px 20px', fontSize: 13 },
  statCard:{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px', flex: 1, minWidth: 110 },
  statVal: { fontSize: 28, fontWeight: 700, color: C.green, marginTop: 4 },
  statLbl: { fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' },
  section: { background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
};

// ── Role helpers ──────────────────────────────────────────────────────────────

const ROLE_COLORS = { super_admin: C.red, admin: C.blue, engineer: C.yellow, sales: C.green };
const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', engineer: 'Engineer', sales: 'Sales' };
const canWrite = (role) => ['super_admin', 'admin'].includes(role);
const canManageUsers = (role) => role === 'super_admin';

function tabsForRole(role) {
  switch (role) {
    case 'super_admin': return [['churches', '⛪ Churches'], ['resellers', '🏢 Resellers'], ['users', '👤 Users']];
    case 'admin':       return [['churches', '⛪ Churches'], ['resellers', '🏢 Resellers']];
    case 'engineer':    return [['churches', '⛪ Churches']];
    case 'sales':       return [['churches', '⛪ Churches'], ['resellers', '🏢 Resellers']];
    default:            return [['churches', '⛪ Churches']];
  }
}

// ── Login ──────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      localStorage.setItem('tally_admin_token', data.token);
      localStorage.setItem('tally_admin_user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...s.card, width: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⛪</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          <span style={s.logoGreen}>Tally</span> Admin
        </div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>ATEM School — Restricted Access</div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14, textAlign: 'left' }}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@atemschool.com" autoFocus />
          </div>
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter password" />
          </div>
          {err && <div style={s.err}>{err}</div>}
          <button style={{ ...s.btn('primary'), width: '100%', padding: '10px', fontSize: 14, marginTop: 16 }} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── API helpers ───────────────────────────────────────────────────────────────

function useRelay(token) {
  const call = useCallback(async (path, opts = {}) => {
    const method = opts.method || 'GET';
    const url = `/api/admin/relay?path=${encodeURIComponent(path)}`;
    const res = await fetch(url, {
      method,
      headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `${method} ${path} failed`);
    return data;
  }, [token]);
  return call;
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({ churches }) {
  const total   = churches.length;
  const online  = churches.filter(c => c.connected).length;
  const alerts  = churches.filter(c => (c.activeAlerts || 0) > 0).length;
  const offline = total - online;
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
      {[['Total', total, C.white], ['Online', online, C.green], ['Alerts', alerts, C.red], ['Offline', offline, C.muted]].map(([lbl, val, color]) => (
        <div key={lbl} style={s.statCard}>
          <div style={s.statLbl}>{lbl}</div>
          <div style={{ ...s.statVal, color }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

// ── Automation Panel (inside ChurchDetailModal) ─────────────────────────────

const TRIGGER_TYPES = [
  { value: 'propresenter_slide_change', label: 'ProPresenter Slide Change' },
  { value: 'schedule_timer', label: 'Schedule Timer (minutes into service)' },
  { value: 'equipment_state_match', label: 'Equipment State Match' },
];

function ChatPanel({ churchId, relay, role }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const lastTimestamp = useRef(null);
  const scrollRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => setTimeout(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, 50);

  const loadMessages = useCallback(async () => {
    try {
      const data = await relay(`/api/churches/${churchId}/chat?limit=100`);
      if (data?.messages) {
        setMessages(data.messages);
        if (data.messages.length > 0) lastTimestamp.current = data.messages[data.messages.length - 1].timestamp;
        scrollToBottom();
      }
    } catch {}
  }, [churchId, relay]);

  useEffect(() => {
    loadMessages();
    const poll = async () => {
      if (!lastTimestamp.current) return;
      try {
        const data = await relay(`/api/churches/${churchId}/chat?since=${encodeURIComponent(lastTimestamp.current)}`);
        if (data?.messages?.length > 0) {
          setMessages(prev => [...prev, ...data.messages]);
          lastTimestamp.current = data.messages[data.messages.length - 1].timestamp;
          scrollToBottom();
        }
      } catch {}
    };
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [churchId, relay, loadMessages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const data = await relay(`/api/churches/${churchId}/chat`, { method: 'POST', body: { message: input.trim() } });
      if (data?.id) {
        setMessages(prev => [...prev, data]);
        lastTimestamp.current = data.timestamp;
        setInput('');
        scrollToBottom();
      }
    } catch {}
    setSending(false);
  };

  const sourceIcon = { telegram: '\uD83D\uDCF1', app: '\uD83D\uDCBB', dashboard: '\uD83C\uDF10' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 400 }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12 }}>
        {messages.length === 0 && (
          <div style={{ color: C.muted, fontSize: 12, textAlign: 'center', padding: 40 }}>
            No messages yet. Start a conversation.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: C.dim, fontFamily: 'monospace' }}>
              {sourceIcon[m.source] || '\uD83D\uDCAC'}{' '}
              <span style={{ color: m.sender_role === 'admin' ? C.green : C.white, fontWeight: 600 }}>
                {m.sender_name}
              </span>
              <span style={{ marginLeft: 8 }}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ fontSize: 13, color: C.white, marginTop: 2, lineHeight: 1.5, paddingLeft: 2 }}>
              {m.message}
            </div>
          </div>
        ))}
      </div>
      {canWrite(role) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            style={{ ...s.input, flex: 1 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
          />
          <button style={s.btn('primary')} onClick={send} disabled={sending || !input.trim()}>
            {sending ? '...' : 'Send'}
          </button>
        </div>
      )}
    </div>
  );
}

function AutomationPanel({ churchId, relay, role }) {
  const [rules, setRules] = useState([]);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [form, setForm] = useState({
    name: '', triggerType: 'propresenter_slide_change',
    presentationPattern: '', minutesIntoService: '5',
    command: '', paramJson: '{}',
  });
  const [commandLog, setCommandLog] = useState(null);
  const [logLoading, setLogLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await relay(`/api/churches/${churchId}/automation`);
      setRules(data.rules || []);
      setPaused(data.paused || false);
    } catch { setRules([]); }
    finally { setLoading(false); }
  }, [churchId, relay]);

  useEffect(() => { load(); }, [load]);

  async function togglePause() {
    const endpoint = paused ? 'resume' : 'pause';
    try {
      await relay(`/api/churches/${churchId}/automation/${endpoint}`, { method: 'POST' });
      setPaused(!paused);
    } catch {}
  }

  async function toggleRule(ruleId, currentEnabled) {
    try {
      await relay(`/api/churches/${churchId}/automation/${ruleId}`, {
        method: 'PUT', body: { enabled: !currentEnabled },
      });
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !currentEnabled } : r));
    } catch {}
  }

  async function deleteRule(ruleId, name) {
    if (!confirm(`Delete rule "${name}"?`)) return;
    try {
      await relay(`/api/churches/${churchId}/automation/${ruleId}`, { method: 'DELETE' });
      setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch {}
  }

  async function createRule(e) {
    e.preventDefault();
    setCreating(true); setCreateErr('');
    try {
      let triggerConfig = {};
      if (form.triggerType === 'propresenter_slide_change') {
        triggerConfig = { presentationPattern: form.presentationPattern || undefined };
      } else if (form.triggerType === 'schedule_timer') {
        triggerConfig = { minutesIntoService: parseInt(form.minutesIntoService) || 0 };
      } else if (form.triggerType === 'equipment_state_match') {
        triggerConfig = { conditions: JSON.parse(form.paramJson || '{}') };
      }

      let params = {};
      try { params = JSON.parse(form.paramJson || '{}'); } catch {}

      await relay(`/api/churches/${churchId}/automation`, {
        method: 'POST',
        body: {
          name: form.name,
          triggerType: form.triggerType,
          triggerConfig,
          actions: [{ command: form.command, params }],
        },
      });
      setShowCreate(false);
      setForm({ name: '', triggerType: 'propresenter_slide_change', presentationPattern: '', minutesIntoService: '5', command: '', paramJson: '{}' });
      load();
    } catch (err) { setCreateErr(err.message); }
    finally { setCreating(false); }
  }

  async function loadCommandLog() {
    setLogLoading(true);
    try {
      const data = await relay(`/api/churches/${churchId}/command-log?limit=30`);
      setCommandLog(Array.isArray(data) ? data : []);
    } catch { setCommandLog([]); }
    finally { setLogLoading(false); }
  }

  if (loading) return <div style={{ color: C.muted, fontSize: 12, padding: '24px 0', textAlign: 'center' }}>Loading automation...</div>;

  return (
    <div>
      {/* Header with pause/resume */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Autopilot Rules ({rules.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canWrite(role) && (
            <button
              style={s.btn(paused ? 'primary' : 'danger')}
              onClick={togglePause}
            >
              {paused ? '\u25B6 Resume' : '\u23F8 Pause'} Autopilot
            </button>
          )}
          {canWrite(role) && (
            <button style={s.btn('primary')} onClick={() => setShowCreate(true)}>+ New Rule</button>
          )}
        </div>
      </div>

      {paused && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.3)`, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: C.yellow }}>
          Autopilot is paused. No automation rules will fire until resumed.
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div style={s.section}>
          <div style={{ color: C.muted, fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
            No automation rules yet. Create one to get started.
          </div>
        </div>
      ) : (
        rules.map(rule => (
          <div key={rule.id} style={{ ...s.section, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{rule.enabled ? '\u{1F7E2}' : '\u{26AA}'}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{rule.name}</span>
                <span style={s.badge(C.blue)}>{rule.trigger_type?.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                {rule.trigger_type === 'propresenter_slide_change' && rule.trigger_config?.presentationPattern
                  ? `When presentation matches: "${rule.trigger_config.presentationPattern}"`
                  : rule.trigger_type === 'schedule_timer'
                  ? `At ${rule.trigger_config?.minutesIntoService || 0} minutes into service`
                  : rule.trigger_type === 'equipment_state_match'
                  ? `When equipment state matches conditions`
                  : 'On any matching event'}
                {' \u2192 '}
                {(rule.actions || []).map(a => a.command).join(', ') || 'No actions'}
              </div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>
                Fired {rule.fire_count || 0} times
                {rule.last_fired_at ? ` \u2022 Last: ${new Date(rule.last_fired_at).toLocaleString()}` : ''}
              </div>
            </div>
            {canWrite(role) && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  style={{ ...s.btn(rule.enabled ? 'secondary' : 'primary'), padding: '4px 10px', fontSize: 11 }}
                  onClick={() => toggleRule(rule.id, rule.enabled)}
                >
                  {rule.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  style={{ ...s.btn('danger'), padding: '4px 10px', fontSize: 11 }}
                  onClick={() => deleteRule(rule.id, rule.name)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Create rule form */}
      {showCreate && canWrite(role) && (
        <div style={{ ...s.section, marginTop: 16 }}>
          <div style={s.sectionTitle}>Create Automation Rule</div>
          <form onSubmit={createRule}>
            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Rule Name *</label>
              <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Switch to Cam 1 during worship" required />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Trigger Type *</label>
              <select style={s.input} value={form.triggerType} onChange={e => setForm(f => ({ ...f, triggerType: e.target.value }))}>
                {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {form.triggerType === 'propresenter_slide_change' && (
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Presentation Name Pattern (optional)</label>
                <input style={s.input} value={form.presentationPattern} onChange={e => setForm(f => ({ ...f, presentationPattern: e.target.value }))} placeholder="worship (matches any presentation containing this)" />
                <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Leave blank to match any slide change.</div>
              </div>
            )}
            {form.triggerType === 'schedule_timer' && (
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Minutes Into Service *</label>
                <input style={s.input} type="number" min="0" value={form.minutesIntoService} onChange={e => setForm(f => ({ ...f, minutesIntoService: e.target.value }))} />
              </div>
            )}
            {form.triggerType === 'equipment_state_match' && (
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Conditions (JSON)</label>
                <input style={s.input} value={form.paramJson} onChange={e => setForm(f => ({ ...f, paramJson: e.target.value }))} placeholder='{"obs.streaming": true}' />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Action Command *</label>
              <input style={s.input} value={form.command} onChange={e => setForm(f => ({ ...f, command: e.target.value }))} placeholder="e.g. atem.setProgram, obs.startStream" required />
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Any Tally command: atem.cut, atem.setProgram, obs.startStream, propresenter.next, etc.</div>
            </div>

            {form.triggerType !== 'equipment_state_match' && (
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Action Parameters (JSON, optional)</label>
                <input style={s.input} value={form.paramJson} onChange={e => setForm(f => ({ ...f, paramJson: e.target.value }))} placeholder='{"input": 1}' />
              </div>
            )}

            {createErr && <div style={s.err}>{createErr}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" style={s.btn('secondary')} onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" style={s.btn('primary')} disabled={creating}>{creating ? 'Creating...' : 'Create Rule'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Command log */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Command Log</div>
          <button style={s.btn('secondary')} onClick={loadCommandLog} disabled={logLoading}>
            {logLoading ? 'Loading...' : commandLog ? 'Refresh' : 'Load Log'}
          </button>
        </div>

        {commandLog && (
          commandLog.length === 0 ? (
            <div style={{ ...s.section, color: C.muted, fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
              No commands logged yet.
            </div>
          ) : (
            <div style={{ ...s.section, maxHeight: 250, overflowY: 'auto' }}>
              {commandLog.map((log, i) => (
                <div key={log.id || i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 11, borderBottom: i < commandLog.length - 1 ? `1px solid ${C.border}` : 'none', paddingBottom: 6 }}>
                  <span style={{ color: C.dim, minWidth: 55, flexShrink: 0 }}>
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <span style={s.badge(log.source === 'autopilot' ? C.blue : log.source === 'telegram' ? C.yellow : C.muted)}>
                    {log.source}
                  </span>
                  <span style={{ color: C.white, fontWeight: 600 }}>{log.command}</span>
                  {log.result && <span style={{ color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(log.result).substring(0, 50)}</span>}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ── Sessions Panel (inside ChurchDetailModal) ──────────────────────────────

function SessionsPanel({ churchId, relay }) {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [debrief, setDebrief] = useState(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await relay(`/api/churches/${churchId}/sessions?limit=20`);
        setSessions(data.sessions || data || []);
        setTotal(data.total || 0);
      } catch { setSessions([]); }
      finally { setLoading(false); }
    })();
  }, [churchId, relay]);

  async function loadTimeline(sessionId) {
    if (expandedId === sessionId) {
      setExpandedId(null);
      setTimeline(null);
      setDebrief(null);
      return;
    }
    setExpandedId(sessionId);
    setTimelineLoading(true);
    setDebrief(null);
    try {
      const data = await relay(`/api/churches/${churchId}/sessions/${sessionId}/timeline`);
      setTimeline(data.timeline || []);
    } catch { setTimeline([]); }
    finally { setTimelineLoading(false); }
  }

  async function loadDebrief(sessionId) {
    setDebriefLoading(true);
    try {
      const data = await relay(`/api/churches/${churchId}/sessions/${sessionId}/debrief`);
      setDebrief(data.debrief || 'No debrief available.');
    } catch { setDebrief('Error loading debrief.'); }
    finally { setDebriefLoading(false); }
  }

  function copyDebrief() {
    if (debrief) {
      navigator.clipboard.writeText(debrief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const gradeIcon = (grade) => {
    if (!grade) return '\u{26AA}';
    if (grade === 'Clean') return '\u{1F7E2}';
    if (grade === 'Minor issues') return '\u{1F7E1}';
    return '\u{1F534}';
  };

  const severityColor = (sev) => {
    if (sev === 'CRITICAL' || sev === 'EMERGENCY') return C.red;
    if (sev === 'WARNING') return C.yellow;
    return C.green;
  };

  if (loading) return <div style={{ color: C.muted, fontSize: 12, padding: '24px 0', textAlign: 'center' }}>Loading sessions...</div>;

  if (sessions.length === 0) {
    return (
      <div style={s.section}>
        <div style={s.sectionTitle}>Service Sessions</div>
        <div style={{ color: C.muted, fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
          No sessions recorded yet. Sessions are tracked automatically during service windows.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Service Sessions ({total})</div>

      {sessions.map(sess => {
        const isExpanded = expandedId === sess.id;
        const start = new Date(sess.started_at);
        const dateStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return (
          <div key={sess.id} style={{ ...s.section, marginBottom: 8, padding: 0 }}>
            {/* Session header — clickable */}
            <div
              onClick={() => loadTimeline(sess.id)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s',
                borderRadius: isExpanded ? '8px 8px 0 0' : 8,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{gradeIcon(sess.grade)}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{dateStr} {timeStr}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {sess.duration_minutes ? `${sess.duration_minutes} min` : 'In progress'} {sess.td_name ? `\u2022 TD: ${sess.td_name}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {(sess.alert_count || 0) > 0 && <span style={s.badge(C.red)}>{sess.alert_count} alerts</span>}
                {(sess.auto_recovered_count || 0) > 0 && <span style={s.badge(C.green)}>{sess.auto_recovered_count} auto-fixed</span>}
                {sess.stream_ran ? <span style={s.badge(C.blue)}>Streamed</span> : null}
                <span style={{ color: C.muted, fontSize: 14 }}>{isExpanded ? '\u25B2' : '\u25BC'}</span>
              </div>
            </div>

            {/* Expanded timeline */}
            {isExpanded && (
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}` }}>
                {timelineLoading ? (
                  <div style={{ color: C.muted, fontSize: 12, padding: '16px 0', textAlign: 'center' }}>Loading timeline...</div>
                ) : !timeline || timeline.length === 0 ? (
                  <div style={{ color: C.muted, fontSize: 12, padding: '16px 0', textAlign: 'center' }}>No events recorded for this session.</div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: 24, marginTop: 12 }}>
                    {/* Vertical line */}
                    <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 2, background: C.border }} />

                    {timeline.map((item, i) => {
                      const time = new Date(item.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
                      let dotColor = C.green;
                      let label = '';
                      let icon = '';

                      if (item._type === 'marker') {
                        dotColor = C.blue;
                        label = item.label;
                        icon = item.label === 'Session Started' ? '\u{25B6}' : '\u{23F9}';
                        if (item.grade) label += ` (${item.grade})`;
                      } else if (item._type === 'alert') {
                        dotColor = severityColor(item.severity);
                        label = item.alert_type?.replace(/_/g, ' ') || 'Alert';
                        icon = item.severity === 'CRITICAL' || item.severity === 'EMERGENCY' ? '\u{1F534}' : '\u{26A0}\u{FE0F}';
                        if (item.acknowledged_at) label += ' \u2714';
                        if (item.escalated) label += ' ESCALATED';
                      } else if (item._type === 'event') {
                        dotColor = item.auto_resolved ? C.green : item.resolved ? C.yellow : C.muted;
                        label = item.event_type?.replace(/_/g, ' ') || 'Event';
                        icon = item.auto_resolved ? '\u{26A1}' : '\u{1F4CB}';
                        if (item.auto_resolved) label += ' (auto-resolved)';
                        else if (item.resolved) label += ' (resolved)';
                      }

                      return (
                        <div key={`${item._type}-${item.id || i}`} style={{ display: 'flex', gap: 10, marginBottom: 10, position: 'relative' }}>
                          {/* Dot */}
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', background: `${dotColor}20`,
                            border: `2px solid ${dotColor}`, position: 'absolute', left: -24, top: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8,
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 12 }}>{icon}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: dotColor }}>{label}</span>
                              <span style={{ fontSize: 11, color: C.dim }}>{time}</span>
                            </div>
                            {item.details && (
                              <div style={{ fontSize: 11, color: C.muted, marginTop: 2, paddingLeft: 20 }}>
                                {typeof item.details === 'string' ? item.details.substring(0, 120) : JSON.stringify(item.details).substring(0, 120)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Debrief section */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button
                    style={s.btn('secondary')}
                    onClick={() => loadDebrief(sess.id)}
                    disabled={debriefLoading}
                  >
                    {debriefLoading ? 'Loading...' : debrief ? 'Refresh Debrief' : 'Generate Debrief'}
                  </button>
                  {debrief && (
                    <button style={s.btn('primary')} onClick={copyDebrief}>
                      {copied ? 'Copied!' : 'Copy Debrief'}
                    </button>
                  )}
                </div>

                {debrief && (
                  <pre style={{
                    marginTop: 8, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 6,
                    fontSize: 11, color: C.muted, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    border: `1px solid ${C.border}`, maxHeight: 300, overflowY: 'auto', fontFamily: 'monospace',
                  }}>
                    {debrief}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Overview Panel (inside ChurchDetailModal) ────────────────────────────────

function OverviewPanel({ churchId, relay }) {
  const [status, setStatus] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [st, sc] = await Promise.all([
          relay(`/api/churches/${churchId}/status`).catch(() => null),
          relay(`/api/churches/${churchId}/schedule`).catch(() => null),
        ]);
        if (!cancelled) { setStatus(st); setSchedule(sc); }
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [churchId, relay]);

  if (loading) return <div style={{ color: C.muted, fontSize: 12, padding: '24px 0', textAlign: 'center' }}>Loading...</div>;

  const st = status || {};
  const eq = st.status?.equipment || st.equipment || {};
  const sc = schedule || {};
  const connected = st.connected ?? false;
  const lastSeen = st.lastSeen || st.last_seen;
  const version = st.status?.version || st.version;

  return (
    <div>
      {/* Connection */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Connection</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={s.badge(connected ? C.green : C.muted)}>{connected ? 'Online' : 'Offline'}</span>
          {lastSeen && <span style={{ fontSize: 11, color: C.dim }}>Last seen: {new Date(lastSeen).toLocaleString()}</span>}
          {version && <span style={s.badge(C.blue)}>v{version}</span>}
        </div>
      </div>

      {/* Equipment */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Equipment</div>
        {Object.keys(eq).length === 0 ? (
          <div style={{ color: C.muted, fontSize: 12 }}>No equipment data available.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            {eq.atem && <div><span style={{ color: C.muted }}>ATEM:</span> <span style={{ color: C.white }}>{eq.atem.model || 'Connected'}</span></div>}
            {eq.obs !== undefined && <div><span style={{ color: C.muted }}>OBS:</span> <span style={{ color: eq.obs ? C.green : C.muted }}>{eq.obs ? 'Connected' : 'Not connected'}</span></div>}
            {eq.propresenter !== undefined && <div><span style={{ color: C.muted }}>ProPresenter:</span> <span style={{ color: eq.propresenter ? C.green : C.muted }}>{eq.propresenter ? 'Connected' : 'Not connected'}</span></div>}
            {eq.audio && <div><span style={{ color: C.muted }}>Audio Inputs:</span> <span style={{ color: C.white }}>{Array.isArray(eq.audio) ? eq.audio.length : eq.audio}</span></div>}
          </div>
        )}
      </div>

      {/* Service Window */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Service Window</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
          <span style={s.badge(sc.inServiceWindow ? C.green : C.muted)}>
            {sc.inServiceWindow ? 'In Service Window' : 'Outside Service Window'}
          </span>
          {sc.nextService && <span style={{ color: C.dim }}>Next: {sc.nextService.day} {sc.nextService.time || ''}</span>}
        </div>
        {sc.schedule && sc.schedule.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
            {sc.schedule.map((d, i) => (
              d.times && d.times.length > 0 ? <div key={i}><span style={{ color: C.white }}>{d.day}:</span> {d.times.join(', ')}</div> : null
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TDs Panel (inside ChurchDetailModal) ─────────────────────────────────────

function TDsPanel({ churchId, relay, role }) {
  const [tds, setTds] = useState([]);
  const [oncall, setOncall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [addName, setAddName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    try {
      setErr('');
      const [tdData, ocData] = await Promise.all([
        relay(`/api/churches/${churchId}/tds`).catch(() => []),
        relay(`/api/churches/${churchId}/oncall`).catch(() => null),
      ]);
      setTds(Array.isArray(tdData) ? tdData : tdData?.tds || []);
      setOncall(ocData?.onCall || ocData?.oncall || null);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [churchId, relay]);

  useEffect(() => { load(); }, [load]);

  async function addTd(e) {
    e.preventDefault();
    if (!addName.trim()) return;
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await relay(`/api/churches/${churchId}/tds/add`, { method: 'POST', body: { name: addName.trim() } });
      setAddName('');
      setMsg({ type: 'ok', text: 'TD added.' });
      load();
    } catch (e) { setMsg({ type: 'err', text: e.message }); }
    finally { setSaving(false); }
  }

  async function removeTd(userId, name) {
    if (!confirm(`Remove TD "${name}"?`)) return;
    try {
      await relay(`/api/churches/${churchId}/tds/${userId}`, { method: 'DELETE' });
      setMsg({ type: 'ok', text: `${name} removed.` });
      load();
    } catch (e) { setMsg({ type: 'err', text: e.message }); }
  }

  async function setOnCall(tdName) {
    try {
      await relay(`/api/churches/${churchId}/oncall`, { method: 'POST', body: { tdName } });
      setOncall({ tdName });
      setMsg({ type: 'ok', text: `${tdName} is now on-call.` });
    } catch (e) { setMsg({ type: 'err', text: e.message }); }
  }

  if (loading) return <div style={{ color: C.muted, fontSize: 12, padding: '24px 0', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      {err && <div style={s.err}>{err}</div>}

      {/* On-Call */}
      <div style={s.section}>
        <div style={s.sectionTitle}>On-Call TD</div>
        {oncall?.tdName ? (
          <span style={s.badge(C.green)}>{oncall.tdName}</span>
        ) : (
          <span style={{ fontSize: 12, color: C.muted }}>No TD on-call</span>
        )}
      </div>

      {/* TD List */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Technical Directors ({tds.length})</div>
        {tds.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 12 }}>No TDs registered.</div>
        ) : (
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Telegram</th>
              <th style={s.th}>Phone</th>
              <th style={s.th}>Status</th>
              {canWrite(role) && <th style={s.th}>Actions</th>}
            </tr></thead>
            <tbody>
              {tds.map((td, i) => (
                <tr key={td.id || td.telegram_user_id || i}>
                  <td style={s.td}>{td.name || td.td_name || '—'}</td>
                  <td style={s.td}>
                    {td.telegram_chat_id ? <span style={s.badge(C.green)}>Linked</span> : <span style={s.badge(C.muted)}>—</span>}
                  </td>
                  <td style={s.td}><span style={{ fontSize: 12, color: C.dim }}>{td.phone || '—'}</span></td>
                  <td style={s.td}><span style={s.badge(td.active !== 0 ? C.green : C.muted)}>{td.active !== 0 ? 'Active' : 'Inactive'}</span></td>
                  {canWrite(role) && (
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ ...s.btn('secondary'), padding: '4px 8px', fontSize: 10 }} onClick={() => setOnCall(td.name || td.td_name)}>On-Call</button>
                        <button style={{ ...s.btn('danger'), padding: '4px 8px', fontSize: 10 }} onClick={() => removeTd(td.telegram_user_id || td.id, td.name || td.td_name)}>Remove</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add TD */}
      {canWrite(role) && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Add TD</div>
          <form onSubmit={addTd} style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...s.input, flex: 1 }} value={addName} onChange={e => setAddName(e.target.value)} placeholder="TD name" disabled={saving} />
            <button type="submit" style={s.btn('primary')} disabled={saving || !addName.trim()}>{saving ? 'Adding...' : 'Add'}</button>
          </form>
        </div>
      )}

      {msg.text && <div style={msg.type === 'ok' ? s.ok : s.err}>{msg.text}</div>}
    </div>
  );
}

// ── Schedule Panel (inside ChurchDetailModal) ────────────────────────────────

function SchedulePanel({ churchId, relay, role }) {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    try {
      const data = await relay(`/api/churches/${churchId}/schedule`);
      setSchedule(data);
      // Build draft from schedule
      const d = {};
      DAYS.forEach(day => { d[day] = ''; });
      if (data?.schedule) {
        data.schedule.forEach(s => { if (s.times?.length) d[s.day] = s.times.join(', '); });
      }
      if (data?.serviceTimes) {
        data.serviceTimes.forEach(s => { if (s.times?.length) d[s.day] = s.times.join(', '); });
      }
      setDraft(d);
    } catch { /* no schedule */ }
    finally { setLoading(false); }
  }, [churchId, relay]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const serviceTimes = DAYS.map(day => ({
        day,
        times: draft[day] ? draft[day].split(',').map(t => t.trim()).filter(Boolean) : [],
      })).filter(d => d.times.length > 0);
      await relay(`/api/churches/${churchId}/schedule`, { method: 'PUT', body: { serviceTimes } });
      setMsg({ type: 'ok', text: 'Schedule saved.' });
      setEditing(false);
      load();
    } catch (e) { setMsg({ type: 'err', text: e.message }); }
    finally { setSaving(false); }
  }

  if (loading) return <div style={{ color: C.muted, fontSize: 12, padding: '24px 0', textAlign: 'center' }}>Loading...</div>;

  const sc = schedule || {};

  return (
    <div>
      {/* Current Status */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Current Status</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
          <span style={s.badge(sc.inServiceWindow ? C.green : C.muted)}>
            {sc.inServiceWindow ? 'In Service Window' : 'Outside Service Window'}
          </span>
          {sc.nextService && <span style={{ color: C.dim }}>Next: {sc.nextService.day} {sc.nextService.time || ''}</span>}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div style={s.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={s.sectionTitle}>Weekly Schedule</div>
          {canWrite(role) && !editing && <button style={{ ...s.btn('secondary'), padding: '4px 12px', fontSize: 11 }} onClick={() => setEditing(true)}>Edit</button>}
        </div>
        {editing ? (
          <div>
            {DAYS.map(day => (
              <div key={day} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ width: 90, fontSize: 12, color: C.muted, flexShrink: 0 }}>{day}</span>
                <input
                  style={{ ...s.input, flex: 1 }}
                  value={draft[day] || ''}
                  onChange={e => setDraft(d => ({ ...d, [day]: e.target.value }))}
                  placeholder="e.g. 9:00 AM, 11:00 AM"
                  disabled={saving}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={s.btn('primary')} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button style={s.btn('secondary')} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {DAYS.map(day => {
              const entry = sc.schedule?.find(d => d.day === day) || sc.serviceTimes?.find(d => d.day === day);
              const times = entry?.times || [];
              return times.length > 0 ? (
                <div key={day} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 12 }}>
                  <span style={{ width: 90, color: C.muted, flexShrink: 0 }}>{day}</span>
                  <span style={{ color: C.white }}>{times.join(', ')}</span>
                </div>
              ) : null;
            })}
            {!sc.schedule?.some(d => d.times?.length > 0) && !sc.serviceTimes?.some(d => d.times?.length > 0) && (
              <div style={{ color: C.muted, fontSize: 12 }}>No service times configured.</div>
            )}
          </div>
        )}
      </div>

      {msg.text && <div style={msg.type === 'ok' ? s.ok : s.err}>{msg.text}</div>}
    </div>
  );
}

// ── Billing Panel (inside ChurchDetailModal) ─────────────────────────────────

function BillingPanel({ churchId, relay, role, church, onUpdate }) {
  const [tier, setTier] = useState(church?.billing_tier || 'connect');
  const [status, setStatus] = useState(church?.billing_status || 'inactive');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  async function save() {
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      await relay(`/api/churches/${churchId}/billing`, { method: 'PUT', body: { tier, status } });
      setMsg({ type: 'ok', text: 'Billing updated.' });
      if (onUpdate) onUpdate({ ...church, billing_tier: tier, billing_status: status });
    } catch (e) { setMsg({ type: 'err', text: e.message }); }
    finally { setSaving(false); }
  }

  return (
    <div>
      {/* Current Plan */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Current Plan</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={s.badge(C.blue)}>{church?.billing_tier || 'connect'}</span>
          <span style={s.badge(
            ['active', 'trialing'].includes(church?.billing_status) ? C.green : C.yellow
          )}>{church?.billing_status || 'inactive'}</span>
        </div>
      </div>

      {/* Change Plan */}
      {canWrite(role) && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Change Plan</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={s.label}>Tier</label>
              <select style={{ ...s.input, width: 'auto', minWidth: 120 }} value={tier} onChange={e => setTier(e.target.value)}>
                {PLAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Status</label>
              <select style={{ ...s.input, width: 'auto', minWidth: 120 }} value={status} onChange={e => setStatus(e.target.value)}>
                {PLAN_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <button style={s.btn('primary')} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      )}

      {msg.text && <div style={msg.type === 'ok' ? s.ok : s.err}>{msg.text}</div>}
    </div>
  );
}

// ── Church Detail Modal ──────────────────────────────────────────────────────

function ChurchDetailModal({ church, relay, role, onClose, onUpdate }) {
  const [detailTab, setDetailTab] = useState('overview');
  const [slackForm, setSlackForm] = useState({ webhookUrl: '', channel: '' });
  const [slackLoaded, setSlackLoaded] = useState(false);
  const [slackSaving, setSlackSaving] = useState(false);
  const [slackTesting, setSlackTesting] = useState(false);
  const [slackMsg, setSlackMsg] = useState({ type: '', text: '' });

  // Load current Slack config when modal opens
  useEffect(() => {
    if (!church?.churchId) return;
    (async () => {
      try {
        const data = await relay(`/api/churches/${church.churchId}/slack`);
        setSlackForm({
          webhookUrl: data.webhookUrlFull || data.webhookUrl || '',
          channel: data.channel || '',
        });
      } catch {
        // No Slack config yet — that's fine, start blank
        setSlackForm({ webhookUrl: '', channel: '' });
      }
      setSlackLoaded(true);
    })();
  }, [church?.churchId, relay]);

  async function saveSlack() {
    if (!slackForm.webhookUrl) {
      setSlackMsg({ type: 'err', text: 'Webhook URL is required.' });
      return;
    }
    setSlackSaving(true);
    setSlackMsg({ type: '', text: '' });
    try {
      await relay(`/api/churches/${church.churchId}/slack`, {
        method: 'PUT',
        body: { webhookUrl: slackForm.webhookUrl, channel: slackForm.channel || undefined },
      });
      setSlackMsg({ type: 'ok', text: 'Slack webhook saved.' });
      if (onUpdate) onUpdate({ ...church, has_slack: true });
    } catch (e) {
      setSlackMsg({ type: 'err', text: e.message });
    } finally {
      setSlackSaving(false);
    }
  }

  async function removeSlack() {
    if (!confirm('Remove Slack integration for this church?')) return;
    setSlackSaving(true);
    setSlackMsg({ type: '', text: '' });
    try {
      await relay(`/api/churches/${church.churchId}/slack`, { method: 'DELETE' });
      setSlackForm({ webhookUrl: '', channel: '' });
      setSlackMsg({ type: 'ok', text: 'Slack integration removed.' });
      if (onUpdate) onUpdate({ ...church, has_slack: false });
    } catch (e) {
      setSlackMsg({ type: 'err', text: e.message });
    } finally {
      setSlackSaving(false);
    }
  }

  async function testSlack() {
    setSlackTesting(true);
    setSlackMsg({ type: '', text: '' });
    try {
      await relay(`/api/churches/${church.churchId}/slack/test`, { method: 'POST' });
      setSlackMsg({ type: 'ok', text: 'Test message sent to Slack!' });
    } catch (e) {
      setSlackMsg({ type: 'err', text: `Test failed: ${e.message}` });
    } finally {
      setSlackTesting(false);
    }
  }

  const statusColor = church.connected ? C.green : C.muted;
  const statusLabel = church.connected ? 'Online' : 'Offline';

  const DETAIL_TABS = [
    ['overview', 'Overview'],
    ['chat', 'Chat'],
    ['tds', 'TDs'],
    ['schedule', 'Schedule'],
    ['slack', 'Slack'],
    ['sessions', 'Sessions'],
    ['automation', 'Automation'],
    ['billing', 'Billing'],
  ];

  return (
    <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.wideModalBox}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{church.name}</div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: 'monospace', marginTop: 2 }}>{church.churchId}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span style={s.badge(statusColor)}>{statusLabel}</span>
              <span style={s.badge(C.blue)}>{church.billing_tier || 'connect'}</span>
              <span style={s.badge(church.billing_status === 'active' || church.billing_status === 'trialing' ? C.green : C.yellow)}>{church.billing_status || 'inactive'}</span>
              {church.has_slack && <span style={s.badge(C.green)}>Slack</span>}
            </div>
          </div>
          <button style={{ ...s.btn('secondary'), padding: '6px 12px', fontSize: 12 }} onClick={onClose}>Close</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          {DETAIL_TABS.map(([id, label]) => (
            <button key={id} style={s.detailTab(detailTab === id)} onClick={() => setDetailTab(id)}>{label}</button>
          ))}
        </div>

        {/* Overview tab */}
        {detailTab === 'overview' && (
          <OverviewPanel churchId={church.churchId} relay={relay} />
        )}

        {/* Chat tab */}
        {detailTab === 'chat' && (
          <ChatPanel churchId={church.churchId} relay={relay} role={role} />
        )}

        {/* Slack tab */}
        {detailTab === 'slack' && (
          <div>
            <div style={s.section}>
              <div style={s.sectionTitle}>
                <span>Slack Alerts Configuration</span>
              </div>
              <div style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>
                Connect a Slack incoming webhook to receive real-time alerts for stream issues, equipment status, and auto-recoveries.
              </div>

              {!slackLoaded ? (
                <div style={{ color: C.muted, fontSize: 12, padding: '12px 0' }}>Loading Slack config...</div>
              ) : (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Webhook URL *</label>
                    <input
                      style={s.input}
                      value={slackForm.webhookUrl}
                      onChange={e => setSlackForm(f => ({ ...f, webhookUrl: e.target.value }))}
                      placeholder="https://hooks.slack.com/services/T00000/B00000/XXXXXXXX"
                      disabled={!canWrite(role)}
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Channel Override (optional)</label>
                    <input
                      style={s.input}
                      value={slackForm.channel}
                      onChange={e => setSlackForm(f => ({ ...f, channel: e.target.value }))}
                      placeholder="#av-alerts"
                      disabled={!canWrite(role)}
                    />
                    <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Leave blank to use the webhook default channel.</div>
                  </div>

                  {slackMsg.text && <div style={slackMsg.type === 'ok' ? s.ok : s.err}>{slackMsg.text}</div>}

                  {canWrite(role) && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <button
                        style={s.btn('primary')}
                        onClick={saveSlack}
                        disabled={slackSaving || !slackForm.webhookUrl}
                      >
                        {slackSaving ? 'Saving...' : 'Save Webhook'}
                      </button>
                      {slackForm.webhookUrl && (
                        <button
                          style={s.btn('secondary')}
                          onClick={testSlack}
                          disabled={slackTesting}
                        >
                          {slackTesting ? 'Sending...' : 'Send Test'}
                        </button>
                      )}
                      {church.has_slack && (
                        <button
                          style={s.btn('danger')}
                          onClick={removeSlack}
                          disabled={slackSaving}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* How-to guide */}
            <div style={s.section}>
              <div style={s.sectionTitle}>How to get a Slack webhook URL</div>
              <ol style={{ margin: 0, paddingLeft: 20, color: C.muted, fontSize: 12, lineHeight: 1.8 }}>
                <li>Go to <span style={{ color: C.white }}>api.slack.com/apps</span> and create a new app</li>
                <li>Enable <span style={{ color: C.white }}>Incoming Webhooks</span></li>
                <li>Click <span style={{ color: C.white }}>Add New Webhook to Workspace</span></li>
                <li>Select a channel and copy the webhook URL</li>
              </ol>
            </div>
          </div>
        )}

        {/* Sessions tab */}
        {detailTab === 'sessions' && (
          <SessionsPanel churchId={church.churchId} relay={relay} />
        )}

        {/* Automation tab */}
        {detailTab === 'automation' && (
          <AutomationPanel churchId={church.churchId} relay={relay} role={role} />
        )}

        {/* TDs tab */}
        {detailTab === 'tds' && (
          <TDsPanel churchId={church.churchId} relay={relay} role={role} />
        )}

        {/* Schedule tab */}
        {detailTab === 'schedule' && (
          <SchedulePanel churchId={church.churchId} relay={relay} role={role} />
        )}

        {/* Billing tab */}
        {detailTab === 'billing' && (
          <BillingPanel churchId={church.churchId} relay={relay} role={role} church={church} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

// ── Churches tab ─────────────────────────────────────────────────────────────

function ChurchesTab({ relay, role }) {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [modal, setModal]       = useState(null); // 'add' | null
  const [detailChurch, setDetailChurch] = useState(null); // church object for detail modal
  const [form, setForm]         = useState({
    name: '',
    contactEmail: '',
    portalEmail: '',
    portalPassword: '',
    tier: 'connect',
    billingStatus: 'active',
  });
  const [formErr, setFormErr]   = useState('');
  const [formOk, setFormOk]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [showTokens, setShowTokens] = useState({});
  const [billingDrafts, setBillingDrafts] = useState({});

  const load = useCallback(async () => {
    try {
      setErr('');
      const data = await relay('/api/churches');
      const rows = Array.isArray(data) ? data : Object.values(data);
      setChurches(rows);
      setBillingDrafts((prev) => {
        const next = { ...prev };
        for (const c of rows) {
          if (!next[c.churchId]) {
            next[c.churchId] = {
              tier: c.billing_tier || 'connect',
              status: c.billing_status || 'inactive',
            };
          }
        }
        return next;
      });
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  async function addChurch(e) {
    e.preventDefault();
    setFormErr(''); setFormOk(''); setSaving(true);
    try {
      const data = await relay('/api/churches/register', {
        method: 'POST',
        body: {
          name: form.name,
          email: form.contactEmail,
          portalEmail: form.portalEmail || undefined,
          password: form.portalPassword || undefined,
          tier: form.tier,
          billingStatus: form.billingStatus,
        },
      });
      setFormOk(`✅ Registered! Code: ${data.registrationCode || data.token || '—'}`);
      setForm({
        name: '',
        contactEmail: '',
        portalEmail: '',
        portalPassword: '',
        tier: 'connect',
        billingStatus: 'active',
      });
      load();
    } catch(e) { setFormErr(e.message); }
    finally { setSaving(false); }
  }

  async function saveBilling(churchId) {
    const draft = billingDrafts[churchId];
    if (!draft) return;
    try {
      await relay(`/api/churches/${churchId}/billing`, {
        method: 'PUT',
        body: {
          tier: draft.tier,
          status: draft.status,
        },
      });
      setChurches((prev) => prev.map((c) => (
        c.churchId === churchId
          ? { ...c, billing_tier: draft.tier, billing_status: draft.status }
          : c
      )));
    } catch (e) {
      alert(`Billing update failed: ${e.message}`);
    }
  }

  async function deleteChurch(churchId, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await relay(`/api/churches/${churchId}`, { method: 'DELETE' });
      setChurches(prev => prev.filter(c => c.churchId !== churchId));
    } catch(e) { alert('Error: ' + e.message); }
  }

  const statusColor = (c) => c.connected ? (c.activeAlerts > 0 ? C.red : C.green) : C.muted;
  const statusLabel = (c) => c.connected ? (c.activeAlerts > 0 ? 'Alert' : 'Online') : 'Offline';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <StatsBar churches={churches} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Churches ({churches.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn('secondary')} onClick={load}>↻ Refresh</button>
          {canWrite(role) && <button style={s.btn('primary')} onClick={() => { setModal('add'); setFormErr(''); setFormOk(''); }}>+ Add Church</button>}
        </div>
      </div>

      {loading && <div style={s.empty}>Loading…</div>}
      {err     && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && (
        churches.length === 0
          ? <div style={s.empty}>No churches yet. Add one to get started.</div>
          : <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Church', 'Account', 'Reg Code', 'Conn Token', 'Plan', 'Status', 'ATEM', 'OBS', 'Stream', 'Last Seen', ...(canWrite(role) ? [''] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {churches.map(c => {
                    const st = c.status || {};
                    const obs = st.obs || {};
                    const draft = billingDrafts[c.churchId] || {
                      tier: c.billing_tier || 'connect',
                      status: c.billing_status || 'inactive',
                    };
                    return (
                      <tr key={c.churchId}>
                        <td style={s.td}>
                          <div
                            style={{ fontWeight: 600, cursor: 'pointer', color: C.white, transition: 'color 0.15s' }}
                            onClick={() => setDetailChurch(c)}
                            onMouseEnter={e => e.currentTarget.style.color = C.green}
                            onMouseLeave={e => e.currentTarget.style.color = C.white}
                            title="Click for details"
                          >{c.name}</div>
                          <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{c.churchId?.slice(0, 12)}…</div>
                          {c.has_slack && <span style={{ ...s.badge(C.green), marginTop: 2, fontSize: 10 }}>Slack</span>}
                        </td>
                        <td style={s.td}>
                          <div style={{ fontSize: 12 }}>{c.portal_email || '—'}</div>
                        </td>
                        <td style={s.td}>
                          <div
                            onClick={() => {
                              if (!c.registrationCode) return;
                              navigator.clipboard.writeText(c.registrationCode);
                            }}
                            title={c.registrationCode ? 'Copy registration code' : ''}
                            style={{
                              fontFamily: 'monospace',
                              letterSpacing: 1,
                              fontSize: 12,
                              color: c.registrationCode ? C.green : C.muted,
                              cursor: c.registrationCode ? 'pointer' : 'default',
                            }}>
                            {c.registrationCode || '—'}
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: 0.5, color: c.token ? C.white : C.muted }}>
                            {showTokens[c.churchId] ? (c.token || '—') : (c.token ? '••••••••••••••••' : '—')}
                          </div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                            {c.token && (
                              <>
                                <button
                                  style={{ ...s.btn('secondary'), padding: '4px 8px', fontSize: 11 }}
                                  onClick={() => setShowTokens((prev) => ({ ...prev, [c.churchId]: !prev[c.churchId] }))}
                                >
                                  {showTokens[c.churchId] ? 'Hide' : 'Reveal'}
                                </button>
                                <button
                                  style={{ ...s.btn('primary'), padding: '4px 8px', fontSize: 11 }}
                                  onClick={() => navigator.clipboard.writeText(c.token)}
                                >
                                  Copy
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select
                              style={{ ...s.input, minWidth: 96, padding: '5px 8px', fontSize: 12 }}
                              value={draft.tier}
                              disabled={!canWrite(role)}
                              onChange={(e) => setBillingDrafts((prev) => ({
                                ...prev,
                                [c.churchId]: { ...draft, tier: e.target.value },
                              }))}
                            >
                              {PLAN_OPTIONS.map((plan) => (
                                <option key={plan} value={plan}>{plan}</option>
                              ))}
                            </select>
                            <select
                              style={{ ...s.input, minWidth: 104, padding: '5px 8px', fontSize: 12 }}
                              value={draft.status}
                              disabled={!canWrite(role)}
                              onChange={(e) => setBillingDrafts((prev) => ({
                                ...prev,
                                [c.churchId]: { ...draft, status: e.target.value },
                              }))}
                            >
                              {PLAN_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            {canWrite(role) && <button
                              style={{ ...s.btn('secondary'), padding: '4px 8px', fontSize: 11 }}
                              onClick={() => saveBilling(c.churchId)}
                            >
                              Save
                            </button>}
                          </div>
                        </td>
                        <td style={s.td}><span style={s.badge(statusColor(c))}>{statusLabel(c)}</span></td>
                        <td style={s.td}><span style={s.badge(st.atem?.connected ? C.green : C.muted)}>{st.atem?.connected ? 'Connected' : '—'}</span></td>
                        <td style={s.td}><span style={s.badge(obs.connected ? C.green : C.muted)}>{obs.connected ? 'Online' : '—'}</span></td>
                        <td style={s.td}><span style={s.badge(obs.streaming ? C.red : C.muted)}>{obs.streaming ? '🔴 Live' : 'Off'}</span></td>
                        <td style={{ ...s.td, color: C.muted, fontSize: 12 }}>{c.lastSeen ? new Date(c.lastSeen).toLocaleString() : '—'}</td>
                        {canWrite(role) && <td style={s.td}>
                          <button style={{ ...s.btn('danger'), padding: '4px 10px', fontSize: 11 }} onClick={() => deleteChurch(c.churchId, c.name)}>Delete</button>
                        </td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
      )}

      {modal === 'add' && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={s.modalBox}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>+ Add Church</div>
            <form onSubmit={addChurch}>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Church Name *</label>
                <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Grace Community Church" autoFocus />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Contact Email</label>
                <input style={s.input} type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="td@gracecommunity.org" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Login Email</label>
                <input style={s.input} type="email" value={form.portalEmail} onChange={e => setForm(f => ({ ...f, portalEmail: e.target.value }))} placeholder="admin@gracecommunity.org" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Login Password</label>
                <input style={s.input} type="password" minLength={8} value={form.portalPassword} onChange={e => setForm(f => ({ ...f, portalPassword: e.target.value }))} placeholder="Minimum 8 characters (optional)" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Plan</label>
                  <select style={s.input} value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Plan Status</label>
                  <select style={s.input} value={form.billingStatus} onChange={e => setForm(f => ({ ...f, billingStatus: e.target.value }))}>
                    {PLAN_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formErr && <div style={s.err}>{formErr}</div>}
              {formOk  && <div style={s.ok}>{formOk}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" style={s.btn('secondary')} onClick={() => setModal(null)}>Close</button>
                <button type="submit" style={s.btn('primary')} disabled={saving}>{saving ? 'Registering…' : 'Register Church'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailChurch && (
        <ChurchDetailModal
          church={detailChurch}
          relay={relay}
          role={role}
          onClose={() => setDetailChurch(null)}
          onUpdate={(updated) => {
            setChurches(prev => prev.map(c => c.churchId === updated.churchId ? { ...c, ...updated } : c));
            setDetailChurch(updated);
          }}
        />
      )}
    </div>
  );
}

// ── Resellers tab ─────────────────────────────────────────────────────────────

function ResellersTab({ relay, role }) {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ name: '', brandName: '', supportEmail: '', primaryColor: '#22c55e', churchLimit: 10 });
  const [formErr, setFormErr]     = useState('');
  const [apiKey, setApiKey]       = useState('');
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    try {
      setErr('');
      const data = await relay('/api/resellers');
      setResellers(Array.isArray(data) ? data : []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  async function createReseller(e) {
    e.preventDefault();
    setFormErr(''); setApiKey(''); setSaving(true);
    try {
      const data = await relay('/api/resellers', { method: 'POST', body: { name: form.name, brandName: form.brandName || form.name, supportEmail: form.supportEmail, primaryColor: form.primaryColor, churchLimit: Number(form.churchLimit) } });
      setApiKey(data.apiKey || '');
      load();
    } catch(e) { setFormErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Resellers ({resellers.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn('secondary')} onClick={load}>↻ Refresh</button>
          {canWrite(role) && <button style={s.btn('primary')} onClick={() => { setModal(true); setFormErr(''); setApiKey(''); }}>+ Create Reseller</button>}
        </div>
      </div>

      {loading && <div style={s.empty}>Loading…</div>}
      {err     && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && (
        resellers.length === 0
          ? <div style={s.empty}>No resellers yet.</div>
          : <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Company', 'Brand', 'Email', 'Churches', 'Limit', 'Status', 'Color'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {resellers.map(r => (
                    <tr key={r.id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{r.name}</td>
                      <td style={s.td}>{r.brand_name || '—'}</td>
                      <td style={{ ...s.td, color: C.muted, fontSize: 12 }}>{r.support_email || '—'}</td>
                      <td style={s.td}>{r.churchCount ?? '—'}</td>
                      <td style={s.td}>{r.church_limit}</td>
                      <td style={s.td}><span style={s.badge(r.active !== 0 ? C.green : C.muted)}>{r.active !== 0 ? 'Active' : 'Inactive'}</span></td>
                      <td style={s.td}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: r.primary_color || C.green, border: `1px solid ${C.border}` }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {modal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={s.modalBox}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Create Reseller</div>
            <form onSubmit={createReseller}>
              {[
                ['Company Name *', 'name', 'text', 'VideoServ AV'],
                ['Brand Name', 'brandName', 'text', 'VideoServ Monitor'],
                ['Support Email', 'supportEmail', 'email', 'support@videoservav.com'],
              ].map(([lbl, key, type, ph]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={s.label}>{lbl}</label>
                  <input style={s.input} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Church Limit</label>
                  <input style={s.input} type="number" min="1" value={form.churchLimit} onChange={e => setForm(f => ({ ...f, churchLimit: e.target.value }))} />
                </div>
                <div>
                  <label style={s.label}>Color</label>
                  <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ height: 38, width: 60, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                </div>
              </div>
              {formErr && <div style={s.err}>{formErr}</div>}
              {apiKey && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.3)`, borderRadius: 8, padding: 14, marginTop: 12 }}>
                  <div style={{ color: C.green, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>✅ Reseller created!</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>API Key (save this — shown once):</div>
                  <div
                    onClick={() => { navigator.clipboard.writeText(apiKey); }}
                    style={{ fontFamily: 'monospace', fontSize: 12, color: C.green, background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', wordBreak: 'break-all', border: `1px solid rgba(34,197,94,0.2)` }}
                    title="Click to copy"
                  >{apiKey}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" style={s.btn('secondary')} onClick={() => setModal(false)}>Close</button>
                {!apiKey && <button type="submit" style={s.btn('primary')} disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Users tab (super_admin only) ─────────────────────────────────────────────

function UsersTab({ relay }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [modal, setModal]     = useState(null); // null | 'add' | { user }
  const [pwModal, setPwModal] = useState(null); // null | { userId, name }
  const [form, setForm]       = useState({ email: '', password: '', name: '', role: 'admin' });
  const [formErr, setFormErr] = useState('');
  const [formOk, setFormOk]   = useState('');
  const [saving, setSaving]   = useState(false);
  const [newPw, setNewPw]     = useState('');
  const [pwErr, setPwErr]     = useState('');
  const [pwOk, setPwOk]       = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setErr('');
      const data = await relay('/api/admin/users');
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  async function createUser(e) {
    e.preventDefault();
    setFormErr(''); setFormOk(''); setSaving(true);
    try {
      await relay('/api/admin/users', { method: 'POST', body: form });
      setFormOk('User created successfully');
      setForm({ email: '', password: '', name: '', role: 'admin' });
      load();
      setTimeout(() => setModal(null), 1200);
    } catch(e) { setFormErr(e.message); }
    finally { setSaving(false); }
  }

  async function updateUser(e) {
    e.preventDefault();
    if (!modal?.user) return;
    setFormErr(''); setFormOk(''); setSaving(true);
    try {
      await relay(`/api/admin/users/${modal.user.id}`, { method: 'PUT', body: { name: form.name, role: form.role, active: form.active } });
      setFormOk('Updated');
      load();
      setTimeout(() => setModal(null), 800);
    } catch(e) { setFormErr(e.message); }
    finally { setSaving(false); }
  }

  async function resetPassword(e) {
    e.preventDefault();
    if (!pwModal) return;
    setPwErr(''); setPwOk(''); setPwSaving(true);
    try {
      await relay(`/api/admin/users/${pwModal.userId}/password`, { method: 'PUT', body: { password: newPw } });
      setPwOk('Password reset');
      setNewPw('');
      setTimeout(() => setPwModal(null), 1000);
    } catch(e) { setPwErr(e.message); }
    finally { setPwSaving(false); }
  }

  async function toggleActive(user) {
    try {
      await relay(`/api/admin/users/${user.id}`, { method: 'PUT', body: { active: !user.active } });
      load();
    } catch(e) { alert(e.message); }
  }

  function openEdit(user) {
    setForm({ name: user.name, role: user.role, active: user.active });
    setFormErr(''); setFormOk('');
    setModal({ user });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Admin Users ({users.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn('secondary')} onClick={load}>↻ Refresh</button>
          <button style={s.btn('primary')} onClick={() => { setModal('add'); setForm({ email: '', password: '', name: '', role: 'admin' }); setFormErr(''); setFormOk(''); }}>+ Add User</button>
        </div>
      </div>

      {loading && <div style={s.empty}>Loading…</div>}
      {err     && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && (
        users.length === 0
          ? <div style={s.empty}>No admin users found.</div>
          : <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{u.name || '—'}</td>
                      <td style={{ ...s.td, fontSize: 12, color: C.muted }}>{u.email}</td>
                      <td style={s.td}><span style={s.badge(ROLE_COLORS[u.role] || C.muted)}>{ROLE_LABELS[u.role] || u.role}</span></td>
                      <td style={s.td}><span style={s.badge(u.active ? C.green : C.muted)}>{u.active ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ ...s.td, fontSize: 12, color: C.muted }}>{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ ...s.btn('secondary'), padding: '4px 8px', fontSize: 11 }} onClick={() => openEdit(u)}>Edit</button>
                          <button style={{ ...s.btn('secondary'), padding: '4px 8px', fontSize: 11 }} onClick={() => { setPwModal({ userId: u.id, name: u.name || u.email }); setNewPw(''); setPwErr(''); setPwOk(''); }}>Reset PW</button>
                          <button style={{ ...s.btn(u.active ? 'danger' : 'primary'), padding: '4px 8px', fontSize: 11 }} onClick={() => toggleActive(u)}>{u.active ? 'Deactivate' : 'Activate'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {/* Add / Edit user modal */}
      {modal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={s.modalBox}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{modal === 'add' ? '+ Add Admin User' : `Edit: ${modal.user?.name || modal.user?.email}`}</div>
            <form onSubmit={modal === 'add' ? createUser : updateUser}>
              {modal === 'add' && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Email *</label>
                    <input style={s.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@atemschool.com" autoFocus required />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Password *</label>
                    <input style={s.input} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" minLength={8} required />
                  </div>
                </>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Name</label>
                <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" {...(modal === 'add' ? {} : { autoFocus: true })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Role</label>
                <select style={s.input} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {Object.entries(ROLE_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
              {modal !== 'add' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={!!form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    Active
                  </label>
                </div>
              )}
              {formErr && <div style={s.err}>{formErr}</div>}
              {formOk  && <div style={s.ok}>{formOk}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" style={s.btn('secondary')} onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" style={s.btn('primary')} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Create User' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password reset modal */}
      {pwModal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setPwModal(null); }}>
          <div style={s.modalBox}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Reset Password: {pwModal.name}</div>
            <form onSubmit={resetPassword}>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>New Password *</label>
                <input style={s.input} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" minLength={8} required autoFocus />
              </div>
              {pwErr && <div style={s.err}>{pwErr}</div>}
              {pwOk  && <div style={s.ok}>{pwOk}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" style={s.btn('secondary')} onClick={() => setPwModal(null)}>Cancel</button>
                <button type="submit" style={s.btn('danger')} disabled={pwSaving}>{pwSaving ? 'Resetting…' : 'Reset Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main admin app ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [token, setToken]   = useState(null);
  const [user, setUser]     = useState(null);
  const [tab, setTab]       = useState('churches');
  const [relayOk, setRelayOk] = useState(null);
  const [relayErr, setRelayErr] = useState('');
  const [relayMeta, setRelayMeta] = useState('');
  const [showDiag, setShowDiag] = useState(false);
  const relay = useRelay(token);

  const role = user?.role || 'admin';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedToken = localStorage.getItem('tally_admin_token');
    const savedUser  = localStorage.getItem('tally_admin_user');
    if (savedToken) {
      setToken(savedToken);
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
  }, []);

  function handleLogin(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
  }

  function signOut() {
    localStorage.removeItem('tally_admin_token');
    localStorage.removeItem('tally_admin_user');
    setToken(null);
    setUser(null);
    setRelayOk(null);
    setRelayErr('');
    setRelayMeta('');
    setShowDiag(false);
  }

  // Validate session and fetch latest user profile on mount
  useEffect(() => {
    if (!token) return;

    async function check() {
      try {
        // Fetch user profile to validate JWT + get latest role
        const profileRes = await fetch('/api/admin/relay?path=%2Fapi%2Fadmin%2Fme', {
          method: 'GET',
          headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile?.user) {
            setUser(profile.user);
            localStorage.setItem('tally_admin_user', JSON.stringify(profile.user));
          }
        } else if (profileRes.status === 401) {
          signOut();
          return;
        }

        // Also check relay health
        const res = await fetch('/api/admin/relay?path=%2Fapi%2Fhealth', {
          method: 'GET',
          headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
        });

        let bodyText = '';
        try { bodyText = await res.text(); } catch {}

        let body;
        try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = bodyText; }

        if (!res.ok) {
          const msg = (body && body.error) || bodyText || `HTTP ${res.status}`;
          setRelayOk(false);
          setRelayErr(String(msg));
          setRelayMeta(`HTTP ${res.status}`);
          return;
        }

        setRelayOk(true);
        setRelayErr('');
        setRelayMeta(`${body?.service || 'tally-relay'} • ${body?.registeredChurches != null ? `${body.registeredChurches} churches` : ''}`);
      } catch (err) {
        setRelayOk(false);
        setRelayErr(String(err.message || err));
        setRelayMeta('');
      }
    }

    check();
  }, [token]);

  // If current tab becomes unavailable for the user's role, reset to churches
  const availTabs = tabsForRole(role);
  useEffect(() => {
    if (!availTabs.find(([id]) => id === tab)) {
      setTab('churches');
    }
  }, [role, tab, availTabs]);

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>⛪ <span style={s.logoGreen}>Tally</span> <span style={{ color: C.muted, fontWeight: 400 }}>Admin</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: relayOk === null ? C.muted : relayOk ? C.green : C.red }} />
            {relayOk === null ? 'Connecting…' : relayOk ? `Relay Live${relayMeta ? ` • ${relayMeta}` : ''}` : `Relay Offline${relayErr ? ' — ' + relayErr : ''}`}
          </div>
          {(!relayOk && relayErr) || showDiag ? (
            <button
              style={{ ...s.btn('secondary'), fontSize: 11, padding: '6px 10px' }}
              onClick={() => setShowDiag((v) => !v)}
            >
              {showDiag ? 'Hide' : 'Show'} details
            </button>
          ) : null}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: C.white }}>{user.name || user.email}</span>
              <span style={s.badge(ROLE_COLORS[role] || C.muted)}>{ROLE_LABELS[role] || role}</span>
            </div>
          )}
          <button
            style={{ ...s.btn('secondary'), fontSize: 12, padding: '6px 12px' }}
            onClick={signOut}
          >Sign Out</button>
        </div>
      </header>

      <main style={s.main}>
        <div style={{ ...s.card, marginBottom: 16, background: '#0d1017', borderColor: '#1d2e24' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Tally operations dashboard</div>
          <div style={{ color: C.muted, fontSize: 12 }}>
            {canWrite(role)
              ? 'Manage churches, control relay registration, and onboard TDs.'
              : role === 'engineer'
                ? 'Monitor church connections, status, and system health.'
                : 'View churches and reseller accounts.'}
          </div>
        </div>
        <nav style={s.tabBar}>
          {availTabs.map(([id, label]) => (
            <button key={id} style={s.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>

        {showDiag && (
          <div style={{ ...s.card, marginBottom: 16, background: '#0d1017' }}>
            <div style={{ fontSize: 12, color: C.muted }}>Diagnostics</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, margin: 0, color: C.yellow }}>{relayErr || 'No issues detected.'}</pre>
          </div>
        )}

        {tab === 'churches'  && <ChurchesTab  relay={relay} role={role} />}
        {tab === 'resellers' && <ResellersTab relay={relay} role={role} />}
        {tab === 'users'     && <UsersTab relay={relay} />}
      </main>
    </div>
  );
}
