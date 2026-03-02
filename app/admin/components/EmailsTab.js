'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, s, canWrite } from './adminStyles';

// ── helpers ────────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

const TYPE_COLORS = {
  welcome: C.green, trial_ending: C.yellow, trial_expired: C.red,
  payment_success: C.green, payment_failed: C.red, plan_upgraded: C.blue,
  weekly_recap: C.blue, first_service: C.green, downgrade: C.yellow,
  grace_period_ending: C.yellow, invoice_upcoming: C.blue,
  dispute_alert: C.red, urgent_alert_escalation: C.red,
  cancellation_survey: C.muted, email_change: C.blue,
  registration_confirmation: C.green, lead_welcome: C.green,
  lead_day3: C.blue, lead_day7: C.blue, lead_day14: C.yellow,
};

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({ html, title, onClose }) {
  return (
    <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...s.wideModalBox, width: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{title || 'Email Preview'}</div>
          <button style={{ background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer' }} onClick={onClose}>&times;</button>
        </div>
        <iframe
          srcDoc={html}
          style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', minHeight: 400 }}
          sandbox="allow-same-origin"
          title="email preview"
        />
      </div>
    </div>
  );
}

// ── Send History sub-tab ───────────────────────────────────────────────────────
function SendHistory({ relay }) {
  const [rows, setRows]       = useState([]);
  const [stats, setStats]     = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch]   = useState('');
  const [offset, setOffset]   = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [preview, setPreview] = useState(null);
  const LIMIT = 50;

  // Load stats once
  useEffect(() => {
    (async () => {
      try {
        const d = await relay('/api/admin/emails/stats');
        setStats(d || {});
      } catch {}
    })();
  }, [relay]);

  const load = useCallback(async (reset = true) => {
    try {
      setErr('');
      setLoading(true);
      const off = reset ? 0 : offset;
      let path = `/api/admin/emails?limit=${LIMIT}&offset=${off}`;
      if (typeFilter) path += `&type=${encodeURIComponent(typeFilter)}`;
      if (search) path += `&church=${encodeURIComponent(search)}`;
      const d = await relay(path);
      const list = Array.isArray(d) ? d : d?.emails || [];
      if (reset) {
        setRows(list);
        setOffset(list.length);
      } else {
        setRows(prev => [...prev, ...list]);
        setOffset(off + list.length);
      }
      setHasMore(list.length === LIMIT);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay, typeFilter, search, offset]);

  useEffect(() => { load(true); }, [relay, typeFilter, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPreview = async (row) => {
    // Build a simple preview from stored data
    if (row.html_body) {
      setPreview({ html: row.html_body, title: row.subject || row.email_type });
      return;
    }
    // Try fetching template preview as fallback
    try {
      const d = await relay(`/api/admin/emails/templates/${encodeURIComponent(row.email_type)}/preview`);
      setPreview({ html: d?.html || '<p>No preview available</p>', title: row.subject || row.email_type });
    } catch {
      setPreview({ html: '<p>No preview available for this email.</p>', title: row.email_type });
    }
  };

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={s.statCard}>
          <div style={s.statLbl}>Total Sent</div>
          <div style={s.statVal}>{stats.total ?? '—'}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLbl}>Today</div>
          <div style={s.statVal}>{stats.today ?? '—'}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLbl}>This Week</div>
          <div style={s.statVal}>{stats.thisWeek ?? '—'}</div>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ ...s.input, width: 200, padding: '6px 10px', fontSize: 13 }}
        >
          <option value="">All Types</option>
          {Object.keys(TYPE_COLORS).map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <input
          placeholder="Search by church..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...s.input, width: 200, padding: '6px 10px', fontSize: 13 }}
        />

        <button style={s.btn('secondary')} onClick={() => load(true)}>&#8635; Refresh</button>

        <div style={{ marginLeft: 'auto', color: C.muted, fontSize: 12 }}>
          {rows.length} email{rows.length !== 1 ? 's' : ''} shown
        </div>
      </div>

      {loading && rows.length === 0 && <div style={{ color: C.muted, padding: 24 }}>Loading emails...</div>}
      {err && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && rows.length === 0 && (
        <div style={s.empty}>No emails found.</div>
      )}

      {rows.length > 0 && (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Sent</th>
                <th style={s.th}>Church</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Recipient</th>
                <th style={s.th}>Subject</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} style={{ cursor: 'pointer' }} onClick={() => openPreview(r)}>
                  <td style={s.td} title={fmtDate(r.sent_at || r.created_at)}>{timeAgo(r.sent_at || r.created_at)}</td>
                  <td style={s.td}>{r.church_name || r.church_id || '—'}</td>
                  <td style={s.td}>
                    <span style={s.badge(TYPE_COLORS[r.email_type] || C.muted)}>
                      {(r.email_type || '').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontSize: 12, color: C.muted }}>{r.recipient || '—'}</td>
                  <td style={{ ...s.td, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.subject || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <button style={s.btn('secondary')} onClick={() => load(false)} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}

      {preview && <PreviewModal html={preview.html} title={preview.title} onClose={() => setPreview(null)} />}
    </div>
  );
}

// ── Templates sub-tab ──────────────────────────────────────────────────────────
function Templates({ relay, role }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');
  const [preview, setPreview]     = useState(null);
  const [editing, setEditing]     = useState(null);
  const [editSubj, setEditSubj]   = useState('');
  const [editHtml, setEditHtml]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');

  const load = useCallback(async () => {
    try {
      setErr('');
      setLoading(true);
      const d = await relay('/api/admin/emails/templates');
      setTemplates(Array.isArray(d) ? d : d?.templates || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  const openPreview = async (type) => {
    try {
      const d = await relay(`/api/admin/emails/templates/${encodeURIComponent(type)}/preview`);
      setPreview({ html: d?.html || '<p>No preview</p>', title: type.replace(/_/g, ' ') });
    } catch (e) {
      setPreview({ html: `<p>Error: ${e.message}</p>`, title: type });
    }
  };

  const startEdit = (tpl) => {
    setEditing(tpl);
    setEditSubj(tpl.override_subject || tpl.subject || '');
    setEditHtml(tpl.override_html || '');
    setSaveMsg('');
  };

  const saveOverride = async () => {
    if (!editing) return;
    try {
      setSaving(true); setSaveMsg('');
      await relay(`/api/admin/emails/templates/${encodeURIComponent(editing.type)}`, {
        method: 'PUT',
        body: { subject: editSubj || undefined, html: editHtml || undefined },
      });
      setSaveMsg('Saved!');
      load();
    } catch (e) { setSaveMsg(`Error: ${e.message}`); }
    finally { setSaving(false); }
  };

  const revertOverride = async (type) => {
    if (!confirm(`Revert "${type.replace(/_/g, ' ')}" to default template?`)) return;
    try {
      await relay(`/api/admin/emails/templates/${encodeURIComponent(type)}`, { method: 'DELETE' });
      load();
    } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      {loading && <div style={{ color: C.muted, padding: 24 }}>Loading templates...</div>}
      {err && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && templates.length === 0 && (
        <div style={s.empty}>No templates found.</div>
      )}

      {!loading && templates.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {templates.map(tpl => (
            <div key={tpl.type} style={{ ...s.card, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{(tpl.type || '').replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{tpl.trigger || tpl.description || ''}</div>
                </div>
                {tpl.has_override && (
                  <span style={s.badge(C.yellow)}>Override</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                <button
                  style={{ ...s.btn('secondary'), fontSize: 11, padding: '5px 10px' }}
                  onClick={() => openPreview(tpl.type)}
                >
                  Preview
                </button>
                {canWrite(role) && (
                  <>
                    <button
                      style={{ ...s.btn('secondary'), fontSize: 11, padding: '5px 10px' }}
                      onClick={() => startEdit(tpl)}
                    >
                      Edit
                    </button>
                    {tpl.has_override && (
                      <button
                        style={{ ...s.btn('danger'), fontSize: 11, padding: '5px 10px' }}
                        onClick={() => revertOverride(tpl.type)}
                      >
                        Revert
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && <PreviewModal html={preview.html} title={preview.title} onClose={() => setPreview(null)} />}

      {/* Edit modal */}
      {editing && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) { setEditing(null); } }}>
          <div style={{ ...s.wideModalBox, width: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Edit: {(editing.type || '').replace(/_/g, ' ')}</div>
              <button style={{ background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer' }} onClick={() => setEditing(null)}>&times;</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={s.label}>Subject Override</label>
              <input
                value={editSubj}
                onChange={e => setEditSubj(e.target.value)}
                style={s.input}
                placeholder="Leave blank for default"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={s.label}>HTML Override</label>
              <textarea
                value={editHtml}
                onChange={e => setEditHtml(e.target.value)}
                style={{ ...s.input, minHeight: 200, fontFamily: 'monospace', fontSize: 12 }}
                placeholder="Paste full HTML here, or leave blank for default template"
              />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button style={s.btn('primary')} onClick={saveOverride} disabled={saving}>
                {saving ? 'Saving...' : 'Save Override'}
              </button>
              <button style={s.btn('secondary')} onClick={() => setEditing(null)}>Cancel</button>
              {saveMsg && <span style={{ fontSize: 12, color: saveMsg.startsWith('Error') ? C.red : C.green }}>{saveMsg}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Send Custom sub-tab ────────────────────────────────────────────────────────
function SendCustom({ relay }) {
  const [to, setTo]           = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml]       = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg]         = useState('');
  const [preview, setPreview] = useState(null);

  const send = async () => {
    if (!to || !subject || !html) { setMsg('All fields are required.'); return; }
    if (!confirm(`Send email to ${to}?`)) return;
    try {
      setSending(true); setMsg('');
      await relay('/api/admin/emails/send', {
        method: 'POST',
        body: { to, subject, html },
      });
      setMsg('Sent successfully!');
      setTo(''); setSubject(''); setHtml('');
    } catch (e) { setMsg(`Error: ${e.message}`); }
    finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 14 }}>
        <label style={s.label}>Recipient Email</label>
        <input value={to} onChange={e => setTo(e.target.value)} style={s.input} placeholder="user@example.com" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={s.label}>Subject</label>
        <input value={subject} onChange={e => setSubject(e.target.value)} style={s.input} placeholder="Email subject" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={s.label}>HTML Body</label>
        <textarea
          value={html}
          onChange={e => setHtml(e.target.value)}
          style={{ ...s.input, minHeight: 200, fontFamily: 'monospace', fontSize: 12 }}
          placeholder="<h1>Hello</h1><p>Your email body here...</p>"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button style={s.btn('primary')} onClick={send} disabled={sending || !to || !subject || !html}>
          {sending ? 'Sending...' : 'Send Email'}
        </button>
        {html && (
          <button style={s.btn('secondary')} onClick={() => setPreview({ html, title: subject || 'Preview' })}>
            Preview
          </button>
        )}
      </div>

      {msg && (
        <div style={{ marginTop: 10, fontSize: 12, color: msg.startsWith('Error') ? C.red : msg === 'Sent successfully!' ? C.green : C.yellow }}>
          {msg}
        </div>
      )}

      {preview && <PreviewModal html={preview.html} title={preview.title} onClose={() => setPreview(null)} />}
    </div>
  );
}

// ── Main EmailsTab ─────────────────────────────────────────────────────────────
export default function EmailsTab({ relay, role }) {
  const [sub, setSub] = useState('history');

  const SUBS = [
    { id: 'history',   label: 'Send History' },
    { id: 'templates', label: 'Templates' },
    ...(canWrite(role) ? [{ id: 'send', label: 'Send Custom' }] : []),
  ];

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {SUBS.map(t => (
          <button key={t.id} style={s.detailTab(sub === t.id)} onClick={() => setSub(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'history'   && <SendHistory relay={relay} />}
      {sub === 'templates' && <Templates relay={relay} role={role} />}
      {sub === 'send'      && <SendCustom relay={relay} />}
    </div>
  );
}
