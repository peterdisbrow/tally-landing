'use client';
import { useState } from 'react';
import { C, s, canWrite, PLAN_OPTIONS, PLAN_STATUS_OPTIONS } from './adminStyles';

export default function BillingPanel({ churchId, relay, role, church, onUpdate }) {
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
