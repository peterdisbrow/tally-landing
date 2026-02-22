'use client';

import { useCallback, useEffect, useState } from 'react';

const BG = '#09090B';
const CARD = '#0F1613';
const BORDER = '#1a2e1f';
const GREEN = '#22c55e';
const RED = '#ef4444';
const AMBER = '#f59e0b';
const WHITE = '#F8FAFC';
const MUTED = '#94A3B8';
const DIM = '#475569';

/* ─── Helpers ─── */
function StatusDot({ color }) {
  return (
    <span style={{
      width: 10, height: 10, borderRadius: '50%',
      background: color, display: 'inline-block',
      boxShadow: `0 0 6px ${color}`,
      flexShrink: 0,
    }} />
  );
}

function Badge({ label, ok }) {
  const color = ok ? GREEN : ok === false ? RED : DIM;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
      background: `${color}15`, border: `1px solid ${color}40`, color,
      fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
    }}>
      <StatusDot color={color} />
      {label}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: DIM, marginBottom: 3, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, color: WHITE }}>{value || '\u2014'}</div>
    </div>
  );
}

/* ─── Main ─── */
export default function PortalPage() {
  const [token, setToken] = useState(null);
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('status');

  // Account edit state
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const fetchProfile = useCallback(async (tk) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/church/me', {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (res.status === 401) {
        sessionStorage.clear();
        window.location.href = '/signin';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setChurch(data);
      setEditEmail(data.email || data.portalEmail || '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tk = sessionStorage.getItem('tally_token');
    if (!tk) {
      window.location.href = '/signin';
      return;
    }
    setToken(tk);
    fetchProfile(tk);
  }, [fetchProfile]);

  async function handleSaveEmail(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/church/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: editEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaveMsg('Email updated.');
      fetchProfile(token);
    } catch (e) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.newPw.length < 8) { setPwMsg('Password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/church/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, password: pwForm.newPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setPwMsg('Password updated.');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (e) {
      setPwMsg(e.message);
    } finally {
      setPwSaving(false);
    }
  }

  function signOut() {
    sessionStorage.clear();
    window.location.href = '/signin';
  }

  if (!token) return null;

  const churchName = church?.name || sessionStorage.getItem('tally_church_name') || 'Your Church';

  return (
    <main style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ─── Top bar ─── */}
      <header style={{
        borderBottom: `1px solid ${BORDER}`, padding: '14px 5%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot color={GREEN} />
          <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>Tally</span>
          <span style={{ color: DIM, fontSize: 13 }}>&middot; {churchName}</span>
        </div>
        <button onClick={signOut} style={{
          background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6,
          color: MUTED, fontSize: 13, padding: '6px 14px', cursor: 'pointer',
        }}>Sign Out</button>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

        {/* ─── Tabs ─── */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: 4, gap: 4,
          }}>
            {[
              { id: 'status', label: 'Dashboard' },
              { id: 'account', label: 'Account' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '8px 20px', border: 'none', borderRadius: 7,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: tab === t.id ? GREEN : 'transparent',
                color: tab === t.id ? '#000' : MUTED,
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ color: MUTED }}>Loading&hellip;</p>}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '16px 20px', color: RED, fontSize: 14, marginBottom: 24,
          }}>
            {error}
            <button onClick={() => fetchProfile(token)} style={{
              marginLeft: 12, background: 'transparent', border: `1px solid ${RED}40`,
              borderRadius: 6, color: RED, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
            }}>Retry</button>
          </div>
        )}

        {!loading && church && tab === 'status' && (
          <>
            {/* ─── Status cards ─── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12, marginBottom: 28,
            }}>
              {[
                { label: 'Connection', ok: church.connected, text: church.connected ? 'Online' : 'Offline' },
                { label: 'ATEM', ok: church.atem?.connected, text: church.atem?.connected ? church.atem.model || 'Connected' : 'Disconnected' },
                { label: 'OBS', ok: church.obs?.connected, text: church.obs?.connected ? 'Connected' : 'Disconnected' },
                { label: 'Stream', ok: church.streaming, text: church.streaming ? 'Live' : 'Off' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                  padding: '20px 18px',
                }}>
                  <div style={{ fontSize: 11, color: DIM, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>{s.label}</div>
                  <Badge label={s.text} ok={s.ok} />
                </div>
              ))}
            </div>

            {/* ─── Details ─── */}
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
              padding: '28px 24px', marginBottom: 28,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 20px' }}>Church Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                <Field label="Church Name" value={church.name} />
                <Field label="Plan" value={church.billing_tier ? church.billing_tier.charAt(0).toUpperCase() + church.billing_tier.slice(1) : undefined} />
                <Field label="Billing Status" value={church.billing_status} />
                <Field label="Last Seen" value={church.lastSeen ? new Date(church.lastSeen).toLocaleString() : undefined} />
                <Field label="Registration Code" value={church.registrationCode} />
                <Field label="Church ID" value={church.id || church.churchId} />
              </div>
            </div>

            {/* ─── Equipment ─── */}
            {church.devices && church.devices.length > 0 && (
              <div style={{
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
                padding: '28px 24px',
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 20px' }}>Connected Equipment</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {church.devices.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: `1px solid ${BORDER}`,
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name || d.type}</span>
                        {d.ip && <span style={{ color: DIM, fontSize: 12, marginLeft: 10 }}>{d.ip}</span>}
                      </div>
                      <Badge label={d.connected ? 'Online' : 'Offline'} ok={d.connected} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && church && tab === 'account' && (
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: '32px 28px', maxWidth: 520,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Account Settings</h2>
            <p style={{ color: MUTED, fontSize: 13, marginBottom: 28 }}>
              Manage your church account. Contact Andrew for plan changes.
            </p>

            <form onSubmit={handleSaveEmail}>
              <label style={labelStyle}>Admin Email</label>
              <input
                style={inputStyle}
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />

              {saveMsg && (
                <p style={{ fontSize: 13, marginTop: 8, color: saveMsg.includes('updated') ? GREEN : RED }}>
                  {saveMsg}
                </p>
              )}

              <button type="submit" disabled={saving} style={{
                marginTop: 16, padding: '10px 20px', fontSize: 14, fontWeight: 700,
                borderRadius: 8, border: 'none', background: GREEN, color: '#03140A',
                cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
              }}>
                {saving ? 'Saving\u2026' : 'Update Email'}
              </button>
            </form>

            <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '28px 0' }} />

            {/* Password */}
            <form onSubmit={handleChangePassword}>
              <label style={labelStyle}>Change Password</label>
              <input
                style={{ ...inputStyle, marginBottom: 10 }}
                type="password"
                placeholder="Current password"
                value={pwForm.current}
                onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <input
                style={{ ...inputStyle, marginBottom: 10 }}
                type="password"
                placeholder="New password (min 8 characters)"
                value={pwForm.newPw}
                onChange={(e) => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <input
                style={{ ...inputStyle, marginBottom: 6 }}
                type="password"
                placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />

              {pwMsg && (
                <p style={{ fontSize: 13, marginTop: 6, color: pwMsg.includes('updated') ? GREEN : RED }}>
                  {pwMsg}
                </p>
              )}

              <button type="submit" disabled={pwSaving} style={{
                marginTop: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700,
                borderRadius: 8, border: 'none', background: GREEN, color: '#03140A',
                cursor: pwSaving ? 'default' : 'pointer', opacity: pwSaving ? 0.6 : 1,
              }}>
                {pwSaving ? 'Saving\u2026' : 'Change Password'}
              </button>
            </form>

            <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '28px 0' }} />

            {/* Plan */}
            <div>
              <label style={labelStyle}>Current Plan</label>
              <p style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 6 }}>
                {church.billing_tier ? church.billing_tier.charAt(0).toUpperCase() + church.billing_tier.slice(1) : 'Unknown'}
                <span style={{ color: DIM, fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
                  {church.billing_status || ''}
                </span>
              </p>
              <a
                href="mailto:andrew@atemschool.com?subject=Plan%20Upgrade%20Request"
                style={{
                  display: 'inline-block', padding: '8px 16px', fontSize: 13, fontWeight: 600,
                  borderRadius: 6, border: `1px solid ${BORDER}`, background: 'transparent',
                  color: WHITE, textDecoration: 'none',
                }}
              >
                Request Plan Change
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const labelStyle = {
  display: 'block', fontSize: 11, color: DIM, marginBottom: 5, marginTop: 0,
  fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
};

const inputStyle = {
  width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8,
  background: BG, color: WHITE, fontSize: 14, padding: '11px 12px', boxSizing: 'border-box',
};
