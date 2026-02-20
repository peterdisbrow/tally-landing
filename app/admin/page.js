'use client';
import { useState, useEffect, useCallback } from 'react';

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
  err:     { color: C.red, fontSize: 12, marginTop: 8 },
  ok:      { color: C.green, fontSize: 12, marginTop: 8 },
  empty:   { textAlign: 'center', color: C.muted, padding: '40px 20px', fontSize: 13 },
  statCard:{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px', flex: 1, minWidth: 110 },
  statVal: { fontSize: 28, fontWeight: 700, color: C.green, marginTop: 4 },
  statLbl: { fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' },
};

// ── Login ──────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid password');
      localStorage.setItem('tally_admin_token', data.token);
      onLogin(data.token);
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
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter admin password" autoFocus />
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

// ── Churches tab ─────────────────────────────────────────────────────────────

function ChurchesTab({ relay }) {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [modal, setModal]       = useState(null); // 'add' | { church }
  const [form, setForm]         = useState({ name: '', contactEmail: '' });
  const [formErr, setFormErr]   = useState('');
  const [formOk, setFormOk]     = useState('');
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    try {
      setErr('');
      const data = await relay('/api/churches');
      setChurches(Array.isArray(data) ? data : Object.values(data));
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  async function addChurch(e) {
    e.preventDefault();
    setFormErr(''); setFormOk(''); setSaving(true);
    try {
      const data = await relay('/api/churches/register', { method: 'POST', body: { name: form.name, email: form.contactEmail } });
      setFormOk(`✅ Registered! Code: ${data.registrationCode || data.token || '—'}`);
      setForm({ name: '', contactEmail: '' });
      load();
    } catch(e) { setFormErr(e.message); }
    finally { setSaving(false); }
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
          <button style={s.btn('primary')} onClick={() => { setModal('add'); setFormErr(''); setFormOk(''); }}>+ Add Church</button>
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
                    {['Church', 'Status', 'ATEM', 'OBS', 'Stream', 'Last Seen', ''].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {churches.map(c => {
                    const st = c.status || {};
                    const obs = st.obs || {};
                    return (
                      <tr key={c.churchId}>
                        <td style={s.td}>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{c.churchId?.slice(0, 12)}…</div>
                        </td>
                        <td style={s.td}><span style={s.badge(statusColor(c))}>{statusLabel(c)}</span></td>
                        <td style={s.td}><span style={s.badge(st.atem?.connected ? C.green : C.muted)}>{st.atem?.connected ? 'Connected' : '—'}</span></td>
                        <td style={s.td}><span style={s.badge(obs.connected ? C.green : C.muted)}>{obs.connected ? 'Online' : '—'}</span></td>
                        <td style={s.td}><span style={s.badge(obs.streaming ? C.red : C.muted)}>{obs.streaming ? '🔴 Live' : 'Off'}</span></td>
                        <td style={{ ...s.td, color: C.muted, fontSize: 12 }}>{c.lastSeen ? new Date(c.lastSeen).toLocaleString() : '—'}</td>
                        <td style={s.td}>
                          <button style={{ ...s.btn('danger'), padding: '4px 10px', fontSize: 11 }} onClick={() => deleteChurch(c.churchId, c.name)}>Delete</button>
                        </td>
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
    </div>
  );
}

// ── Resellers tab ─────────────────────────────────────────────────────────────

function ResellersTab({ relay }) {
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
          <button style={s.btn('primary')} onClick={() => { setModal(true); setFormErr(''); setApiKey(''); }}>+ Create Reseller</button>
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

// ── Main admin app ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [token, setToken]   = useState(null);
  const [tab, setTab]       = useState('churches');
  const [relayOk, setRelayOk] = useState(null);
  const [relayErr, setRelayErr] = useState('');
  const relay = useRelay(token);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tally_admin_token') : null;
    if (saved) setToken(saved);
  }, []);

  function signOut() {
    localStorage.removeItem('tally_admin_token');
    setToken(null);
    setRelayOk(null);
    setRelayErr('');
  }

  useEffect(() => {
    if (!token) return;
    relay('/api/health')
      .then(() => {
        setRelayOk(true);
        setRelayErr('');
      })
      .catch((err) => {
        setRelayOk(false);
        setRelayErr(String(err.message || err));
        if (err.message === 'Unauthorized') signOut();
      });
  }, [token, relay]);

  if (!token) return <LoginScreen onLogin={setToken} />;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>⛪ <span style={s.logoGreen}>Tally</span> <span style={{ color: C.muted, fontWeight: 400 }}>Admin</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: relayOk === null ? C.muted : relayOk ? C.green : C.red }} />
            {relayOk === null ? 'Connecting…' : relayOk ? 'Relay Live' : 'Relay Offline'}
          </div>
          {!relayOk && relayErr ? <div style={{ fontSize: 11, color: C.red, maxWidth: 340, textAlign: 'right' }}>{relayErr}</div> : null}
          <button
            style={{ ...s.btn('secondary'), fontSize: 12, padding: '6px 12px' }}
            onClick={signOut}
          >Sign Out</button>
        </div>
      </header>

      <main style={s.main}>
        <nav style={s.tabBar}>
          {[['churches', '⛪ Churches'], ['resellers', '🏢 Resellers']].map(([id, label]) => (
            <button key={id} style={s.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>

        {tab === 'churches'  && <ChurchesTab  relay={relay} />}
        {tab === 'resellers' && <ResellersTab relay={relay} />}
      </main>
    </div>
  );
}
