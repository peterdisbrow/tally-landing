'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, s, canWrite } from './adminStyles';

export default function ResellersTab({ relay, role }) {
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
          <button style={s.btn('secondary')} onClick={load}>{'\u21BB'} Refresh</button>
          {canWrite(role) && <button style={s.btn('primary')} onClick={() => { setModal(true); setFormErr(''); setApiKey(''); }}>+ Create Reseller</button>}
        </div>
      </div>

      {loading && <div style={s.empty}>Loading\u2026</div>}
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
                      <td style={s.td}>{r.brand_name || '\u2014'}</td>
                      <td style={{ ...s.td, color: C.muted, fontSize: 12 }}>{r.support_email || '\u2014'}</td>
                      <td style={s.td}>{r.churchCount ?? '\u2014'}</td>
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
          <div style={s.modalBox} role="dialog" aria-modal="true" aria-labelledby="create-reseller-modal-title">
            <div id="create-reseller-modal-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Create Reseller</div>
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
                  <div style={{ color: C.green, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{'\u2705'} Reseller created!</div>
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
                {!apiKey && <button type="submit" style={s.btn('primary')} disabled={saving}>{saving ? 'Creating\u2026' : 'Create'}</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
