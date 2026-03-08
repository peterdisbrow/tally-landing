'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, s, canWrite } from './adminStyles';

const RELAY_HOST = 'api.tallyconnect.app';

export default function ResellersTab({ relay, role }) {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');

  // Create modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm]   = useState({ name: '', brandName: '', supportEmail: '', primaryColor: '#22c55e', commissionRate: '' });
  const [createErr, setCreateErr]     = useState('');
  const [apiKeyResult, setApiKeyResult] = useState('');
  const [creating, setCreating]       = useState(false);

  // Detail modal
  const [detail, setDetail]     = useState(null); // { reseller, churches }
  const [detailLoading, setDetailLoading] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');
  const [saveErr, setSaveErr]   = useState('');

  // Password form in detail
  const [pwForm, setPwForm]     = useState({ email: '', password: '' });
  const [pwMsg, setPwMsg]       = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // ── Load list ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setErr('');
      const data = await relay('/api/resellers');
      setResellers(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  // ── Open detail ────────────────────────────────────────────────────────────
  async function openDetail(id) {
    setDetailLoading(true);
    setDetail(null);
    setSaveMsg('');
    setSaveErr('');
    setPwMsg('');
    try {
      const data = await relay(`/api/resellers/${id}`);
      setDetail(data);
      const r = data.reseller;
      setEditForm({
        name:            r.name || '',
        brand_name:      r.brand_name || '',
        support_email:   r.support_email || '',
        commission_rate: r.commission_rate != null ? String(Math.round(r.commission_rate * 100)) : '',
        slug:            r.slug || '',
        primary_color:   r.primary_color || '#22c55e',
        custom_domain:   r.custom_domain || '',
        logo_url:        r.logo_url || '',
        webhook_url:     r.webhook_url || '',
        active:          r.active !== 0,
      });
      setPwForm({ email: r.portal_email || '', password: '' });
    } catch (e) { setSaveErr(e.message); }
    finally { setDetailLoading(false); }
  }

  // ── Save reseller edits ────────────────────────────────────────────────────
  async function saveEdits() {
    if (!detail || !editForm) return;
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    try {
      const r = detail.reseller;
      const patch = {};
      if (editForm.name !== r.name) patch.name = editForm.name;
      if (editForm.brand_name !== (r.brand_name || '')) patch.brand_name = editForm.brand_name;
      if (editForm.support_email !== (r.support_email || '')) patch.support_email = editForm.support_email;
      if (editForm.slug !== (r.slug || '')) patch.slug = editForm.slug;
      if (editForm.primary_color !== (r.primary_color || '#22c55e')) patch.primary_color = editForm.primary_color;
      if (editForm.custom_domain !== (r.custom_domain || '')) patch.custom_domain = editForm.custom_domain;
      if (editForm.logo_url !== (r.logo_url || '')) patch.logo_url = editForm.logo_url;
      if (editForm.webhook_url !== (r.webhook_url || '')) patch.webhook_url = editForm.webhook_url;
      if (editForm.active !== (r.active !== 0)) patch.active = editForm.active ? 1 : 0;

      // Commission rate: convert percentage to decimal
      const newRate = editForm.commission_rate ? Number(editForm.commission_rate) / 100 : null;
      const oldRate = r.commission_rate;
      if (newRate !== oldRate) patch.commission_rate = newRate;

      if (Object.keys(patch).length === 0) {
        setSaveMsg('No changes to save.');
        setSaving(false);
        return;
      }
      await relay(`/api/resellers/${r.id}`, { method: 'PUT', body: patch });
      setSaveMsg('Saved!');
      load();
      // Refresh detail
      const fresh = await relay(`/api/resellers/${r.id}`);
      setDetail(fresh);
      const fr = fresh.reseller;
      setEditForm({
        name: fr.name || '', brand_name: fr.brand_name || '', support_email: fr.support_email || '',
        commission_rate: fr.commission_rate != null ? String(Math.round(fr.commission_rate * 100)) : '',
        slug: fr.slug || '', primary_color: fr.primary_color || '#22c55e',
        custom_domain: fr.custom_domain || '', logo_url: fr.logo_url || '',
        webhook_url: fr.webhook_url || '', active: fr.active !== 0,
      });
    } catch (e) { setSaveErr(e.message); }
    finally { setSaving(false); }
  }

  // ── Set portal password ────────────────────────────────────────────────────
  async function setPortalPassword() {
    if (!detail || !pwForm.password) return;
    setPwSaving(true);
    setPwMsg('');
    try {
      await relay(`/api/resellers/${detail.reseller.id}/password`, {
        method: 'POST',
        body: { password: pwForm.password, email: pwForm.email || undefined },
      });
      setPwMsg('Portal credentials updated!');
      setPwForm(f => ({ ...f, password: '' }));
    } catch (e) { setPwMsg(`Error: ${e.message}`); }
    finally { setPwSaving(false); }
  }

  // ── Deactivate ─────────────────────────────────────────────────────────────
  async function deactivateReseller() {
    if (!detail) return;
    if (!confirm(`Deactivate "${detail.reseller.name}"? This will disable their account.`)) return;
    try {
      await relay(`/api/resellers/${detail.reseller.id}`, { method: 'DELETE' });
      setDetail(null);
      load();
    } catch (e) { setSaveErr(e.message); }
  }

  // ── Create reseller ────────────────────────────────────────────────────────
  async function handleCreate(e) {
    e.preventDefault();
    setCreateErr('');
    setApiKeyResult('');
    setCreating(true);
    try {
      const body = {
        name: createForm.name,
        brandName: createForm.brandName || createForm.name,
        supportEmail: createForm.supportEmail,
        primaryColor: createForm.primaryColor,
      };
      if (createForm.commissionRate) body.commissionRate = Number(createForm.commissionRate) / 100;
      const data = await relay('/api/resellers', { method: 'POST', body });
      setApiKeyResult(data.apiKey || '');
      load();
    } catch (e) { setCreateErr(e.message); }
    finally { setCreating(false); }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Resellers ({resellers.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn('secondary')} onClick={load}>{'\u21BB'} Refresh</button>
          {canWrite(role) && <button style={s.btn('primary')} onClick={() => { setCreateModal(true); setCreateErr(''); setApiKeyResult(''); }}>+ Create Reseller</button>}
        </div>
      </div>

      {loading && <div style={s.empty}>Loading…</div>}
      {err && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {/* Resellers table */}
      {!loading && !err && (
        resellers.length === 0
          ? <div style={s.empty}>No resellers yet.</div>
          : <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Company', 'Brand', 'Email', 'Churches', 'Commission', 'Status', 'Color'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {resellers.map(r => (
                    <tr key={r.id} onClick={() => openDetail(r.id)} style={{ cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{r.name}</td>
                      <td style={s.td}>{r.brand_name || '—'}</td>
                      <td style={{ ...s.td, color: C.muted, fontSize: 12 }}>{r.support_email || '—'}</td>
                      <td style={s.td}>{r.churchCount ?? '—'}</td>
                      <td style={s.td}>{r.commission_rate != null ? `${Math.round(r.commission_rate * 100)}%` : '—'}</td>
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

      {/* ── Create Modal ── */}
      {createModal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setCreateModal(false); }}>
          <div style={s.modalBox} role="dialog" aria-modal="true">
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Create Reseller</div>
            <form onSubmit={handleCreate}>
              {[
                ['Company Name *', 'name', 'text', 'VideoServ AV'],
                ['Brand Name', 'brandName', 'text', 'VideoServ Monitor'],
                ['Support Email', 'supportEmail', 'email', 'support@videoservav.com'],
                ['Commission Rate (%)', 'commissionRate', 'number', '20'],
              ].map(([lbl, key, type, ph]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={s.label}>{lbl}</label>
                  <input style={s.input} type={type} value={createForm[key]} onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} {...(type === 'number' ? { min: 0, max: 100 } : {})} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Color</label>
                <input type="color" value={createForm.primaryColor} onChange={e => setCreateForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ height: 38, width: 60, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', padding: 2 }} />
              </div>
              {createErr && <div style={s.err}>{createErr}</div>}
              {apiKeyResult && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 14, marginTop: 12 }}>
                  <div style={{ color: C.green, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>✅ Reseller created!</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>API Key (save this — shown once):</div>
                  <div onClick={() => copyText(apiKeyResult)} style={{ fontFamily: 'monospace', fontSize: 12, color: C.green, background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', wordBreak: 'break-all', border: '1px solid rgba(34,197,94,0.2)' }} title="Click to copy">{apiKeyResult}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" style={s.btn('secondary')} onClick={() => setCreateModal(false)}>Close</button>
                {!apiKeyResult && <button type="submit" style={s.btn('primary')} disabled={creating}>{creating ? 'Creating…' : 'Create'}</button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail/Edit Modal ── */}
      {(detail || detailLoading) && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) { setDetail(null); setDetailLoading(false); } }}>
          <div style={{ ...s.wideModalBox, width: 780 }} role="dialog" aria-modal="true">
            {detailLoading && !detail && <div style={s.empty}>Loading…</div>}
            {detail && editForm && (
              <>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{detail.reseller.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>ID: {detail.reseller.id}</div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', padding: '4px 8px' }} onClick={() => setDetail(null)}>×</button>
                </div>

                <div style={{ display: 'flex', gap: 24 }}>
                  {/* Left: Editable fields */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: C.green }}>Settings</div>

                    {[
                      ['Company Name', 'name', 'text'],
                      ['Brand Name', 'brand_name', 'text'],
                      ['Support Email', 'support_email', 'email'],
                    ].map(([lbl, key, type]) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <label style={s.label}>{lbl}</label>
                        <input style={s.input} type={type} value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} />
                      </div>
                    ))}

                    <div style={{ marginBottom: 12 }}>
                      <label style={s.label}>Commission Rate (%)</label>
                      <input style={s.input} type="number" min="0" max="100" value={editForm.commission_rate} onChange={e => setEditForm(f => ({ ...f, commission_rate: e.target.value }))} placeholder="e.g. 20" />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={s.label}>Slug</label>
                      <input style={s.input} type="text" value={editForm.slug} onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))} />
                      {editForm.slug && (
                        <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
                          Portal: https://{RELAY_HOST}/reseller-login
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={s.label}>Custom Domain</label>
                        <input style={s.input} type="text" value={editForm.custom_domain} onChange={e => setEditForm(f => ({ ...f, custom_domain: e.target.value }))} placeholder="monitor.example.com" />
                      </div>
                      <div>
                        <label style={s.label}>Color</label>
                        <input type="color" value={editForm.primary_color} onChange={e => setEditForm(f => ({ ...f, primary_color: e.target.value }))} style={{ height: 38, width: 60, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                      </div>
                    </div>

                    {[
                      ['Logo URL', 'logo_url'],
                      ['Webhook URL', 'webhook_url'],
                    ].map(([lbl, key]) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <label style={s.label}>{lbl}</label>
                        <input style={s.input} type="url" value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} placeholder={`https://...`} />
                      </div>
                    ))}

                    {/* Active toggle */}
                    <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <label style={{ ...s.label, marginBottom: 0 }}>Active</label>
                      <button
                        type="button"
                        onClick={() => setEditForm(f => ({ ...f, active: !f.active }))}
                        style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: editForm.active ? C.green : C.dim, position: 'relative', transition: 'background 0.2s' }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: editForm.active ? 23 : 3, transition: 'left 0.2s' }} />
                      </button>
                      <span style={{ fontSize: 12, color: editForm.active ? C.green : C.muted }}>{editForm.active ? 'Active' : 'Inactive'}</span>
                    </div>

                    {/* Save button */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
                      <button style={s.btn('primary')} onClick={saveEdits} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                      {saveMsg && <span style={s.ok}>{saveMsg}</span>}
                      {saveErr && <span style={s.err}>{saveErr}</span>}
                    </div>
                  </div>

                  {/* Right: Info & Actions */}
                  <div style={{ width: 280, flexShrink: 0 }}>
                    {/* Links */}
                    <div style={{ ...s.section, marginBottom: 16 }}>
                      <div style={s.sectionTitle}>🔗 Links</div>

                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', marginBottom: 3 }}>Portal Login</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <div style={{ fontSize: 11, color: C.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            https://{RELAY_HOST}/reseller-login
                          </div>
                          <button style={{ ...s.btn('secondary'), padding: '3px 8px', fontSize: 10 }} onClick={() => copyText(`https://${RELAY_HOST}/reseller-login`)}>Copy</button>
                        </div>
                      </div>

                      {detail.reseller.api_key && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', marginBottom: 3 }}>API Key</div>
                          <ApiKeyDisplay apiKey={detail.reseller.api_key} onCopy={copyText} />
                        </div>
                      )}

                      {detail.reseller.api_key && (
                        <div>
                          <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', marginBottom: 3 }}>Legacy Portal</div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <div style={{ fontSize: 11, color: C.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              https://{RELAY_HOST}/portal?key=...
                            </div>
                            <button style={{ ...s.btn('secondary'), padding: '3px 8px', fontSize: 10 }} onClick={() => copyText(`https://${RELAY_HOST}/portal?key=${detail.reseller.api_key}`)}>Copy</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Churches */}
                    <div style={{ ...s.section, marginBottom: 16 }}>
                      <div style={s.sectionTitle}>⛪ Churches ({detail.churches?.length || 0})</div>
                      {(!detail.churches || detail.churches.length === 0) ? (
                        <div style={{ fontSize: 12, color: C.muted }}>No churches yet</div>
                      ) : (
                        <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                          {detail.churches.map(c => (
                            <div key={c.churchId} style={{ fontSize: 12, padding: '4px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{c.name}</span>
                              <span style={{ color: C.dim, fontSize: 10 }}>{c.churchId?.slice(0, 8)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Portal Password */}
                    <div style={{ ...s.section, marginBottom: 16 }}>
                      <div style={s.sectionTitle}>🔐 Portal Credentials</div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={s.label}>Portal Email</label>
                        <input style={{ ...s.input, fontSize: 12 }} type="email" value={pwForm.email} onChange={e => setPwForm(f => ({ ...f, email: e.target.value }))} placeholder="login@example.com" />
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={s.label}>New Password</label>
                        <input style={{ ...s.input, fontSize: 12 }} type="password" value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} placeholder="min 6 chars" />
                      </div>
                      <button style={{ ...s.btn('secondary'), fontSize: 11, padding: '6px 12px' }} onClick={setPortalPassword} disabled={pwSaving || !pwForm.password}>
                        {pwSaving ? 'Saving…' : 'Set Credentials'}
                      </button>
                      {pwMsg && <div style={{ fontSize: 11, marginTop: 6, color: pwMsg.startsWith('Error') ? C.red : C.green }}>{pwMsg}</div>}
                    </div>

                    {/* Danger zone */}
                    {canWrite(role) && (
                      <div style={{ ...s.section, borderColor: 'rgba(239,68,68,0.3)' }}>
                        <div style={{ ...s.sectionTitle, color: C.red }}>⚠️ Danger Zone</div>
                        <button style={{ ...s.btn('danger'), fontSize: 11, padding: '6px 12px' }} onClick={deactivateReseller}>
                          Deactivate Reseller
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── API Key display with reveal/copy ─────────────────────────────────────────
function ApiKeyDisplay({ apiKey, onCopy }) {
  const [revealed, setRevealed] = useState(false);
  const masked = apiKey ? `${apiKey.slice(0, 8)}${'•'.repeat(20)}` : '';

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {revealed ? apiKey : masked}
      </div>
      <button style={{ ...buttonMini, color: C.muted }} onClick={() => setRevealed(r => !r)} title={revealed ? 'Hide' : 'Reveal'}>
        {revealed ? '🙈' : '👁'}
      </button>
      <button style={{ ...buttonMini, color: C.muted }} onClick={() => onCopy(apiKey)} title="Copy">
        📋
      </button>
    </div>
  );
}

const buttonMini = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: '2px 4px' };
