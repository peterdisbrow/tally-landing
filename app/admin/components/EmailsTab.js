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

function fmtType(type) {
  return (type || '').replace(/[-_]/g, ' ');
}

// Badge color by email type (hyphen-case keys matching relay API)
function typeColor(type) {
  if (/welcome|verified|registration|confirmed|first-service|reactivation/.test(type)) return C.green;
  if (/failed|expired|dispute|urgent|cancellation-confirm/.test(type)) return C.red;
  if (/ending|downgrade|grace|win-back|lead-day14|survey/.test(type)) return C.yellow;
  if (/upgrade|invoice|digest|recap|lead-day|email-change/.test(type)) return C.blue;
  return C.muted;
}

// ── Template category grouping ─────────────────────────────────────────────────
const TEMPLATE_CATEGORIES = [
  {
    label: 'Onboarding',
    icon: '🚀',
    match: (t) => /welcome|setup|registration|first-sunday|week-one|first-service/.test(t),
  },
  {
    label: 'Trial & Billing',
    icon: '💳',
    match: (t) => /trial|payment|upgrade|downgrade|grace|invoice|cancellation-confirm/.test(t),
  },
  {
    label: 'Alerts & Operations',
    icon: '🔔',
    match: (t) => /alert|escalation|digest|recap/.test(t),
  },
  {
    label: 'Engagement',
    icon: '📬',
    match: (t) => /win-back|review|survey|reactivation/.test(t),
  },
  {
    label: 'Account',
    icon: '🔑',
    match: (t) => /password|email-change/.test(t),
  },
  {
    label: 'Sales & Leads',
    icon: '🎯',
    match: (t) => /lead-/.test(t),
  },
];

function categorizeTemplates(templates) {
  const grouped = TEMPLATE_CATEGORIES.map(cat => ({ ...cat, items: [] }));
  const other = { label: 'Other', icon: '📄', items: [] };

  for (const tpl of templates) {
    const placed = grouped.find(g => g.match(tpl.type));
    if (placed) placed.items.push(tpl);
    else other.items.push(tpl);
  }

  const result = grouped.filter(g => g.items.length > 0);
  if (other.items.length > 0) result.push(other);
  return result;
}

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
  const [total, setTotal]     = useState(0);
  const [stats, setStats]     = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch]   = useState('');
  const [offset, setOffset]   = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [preview, setPreview] = useState(null);
  const [knownTypes, setKnownTypes] = useState([]);
  const LIMIT = 50;

  // Load stats once
  useEffect(() => {
    (async () => {
      try {
        const d = await relay('/api/admin/emails/stats');
        setStats(d || {});
        // Extract known types from byType for the filter dropdown
        if (Array.isArray(d?.byType)) {
          setKnownTypes(d.byType.map(t => t.email_type).filter(Boolean));
        }
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
      if (search) path += `&search=${encodeURIComponent(search)}`;
      const d = await relay(path);
      // API returns { rows: [...], total: N }
      const list = Array.isArray(d?.rows) ? d.rows : Array.isArray(d) ? d : [];
      const tot = d?.total ?? list.length;
      if (reset) {
        setRows(list);
        setTotal(tot);
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
    // Try fetching template preview
    try {
      const d = await relay(`/api/admin/emails/templates/${encodeURIComponent(row.email_type)}/preview`);
      setPreview({ html: d?.html || '<p>No preview available</p>', title: row.subject || fmtType(row.email_type) });
    } catch {
      setPreview({ html: '<p>No preview available for this email.</p>', title: fmtType(row.email_type) });
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
          style={{ ...s.input, width: 220, padding: '6px 10px', fontSize: 13 }}
        >
          <option value="">All Types</option>
          {knownTypes.map(t => (
            <option key={t} value={t}>{fmtType(t)}</option>
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
          {rows.length}{total > rows.length ? ` of ${total}` : ''} email{rows.length !== 1 ? 's' : ''}
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
                  <td style={s.td} title={fmtDate(r.sent_at)}>{timeAgo(r.sent_at)}</td>
                  <td style={s.td}>{r.church_name || r.church_id || '—'}</td>
                  <td style={s.td}>
                    <span style={s.badge(typeColor(r.email_type))}>
                      {fmtType(r.email_type)}
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
      setPreview({ html: d?.html || '<p>No preview</p>', title: fmtType(type) });
    } catch (e) {
      setPreview({ html: `<p>Error: ${e.message}</p>`, title: type });
    }
  };

  const startEdit = (tpl) => {
    setEditing(tpl);
    setEditSubj(tpl.overrideSubject || tpl.subject || '');
    setEditHtml(tpl.overrideHtml || '');
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
    if (!confirm(`Revert "${fmtType(type)}" to default template?`)) return;
    try {
      await relay(`/api/admin/emails/templates/${encodeURIComponent(type)}`, { method: 'DELETE' });
      load();
    } catch (e) { setErr(e.message); }
  };

  const groups = categorizeTemplates(templates);

  return (
    <div>
      {loading && <div style={{ color: C.muted, padding: 24 }}>Loading templates...</div>}
      {err && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && templates.length === 0 && (
        <div style={s.empty}>No templates found.</div>
      )}

      {!loading && groups.length > 0 && (
        <div>
          {groups.map(group => (
            <div key={group.label} style={{ marginBottom: 24 }}>
              {/* Category header */}
              <div style={{
                fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{group.icon}</span> {group.label}
                <span style={{ fontSize: 11, fontWeight: 400, color: C.dim }}>({group.items.length})</span>
              </div>

              {/* Template cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {group.items.map(tpl => (
                  <div key={tpl.type} style={{
                    ...s.card, marginBottom: 0, padding: 14,
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{tpl.name || fmtType(tpl.type)}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{tpl.trigger || ''}</div>
                      </div>
                      {tpl.hasOverride && (
                        <span style={{ ...s.badge(C.yellow), flexShrink: 0, marginLeft: 6 }}>Override</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 4 }}>
                      <button
                        style={{ ...s.btn('secondary'), fontSize: 11, padding: '4px 10px' }}
                        onClick={() => openPreview(tpl.type)}
                      >
                        Preview
                      </button>
                      {canWrite(role) && (
                        <>
                          <button
                            style={{ ...s.btn('secondary'), fontSize: 11, padding: '4px 10px' }}
                            onClick={() => startEdit(tpl)}
                          >
                            Edit
                          </button>
                          {tpl.hasOverride && (
                            <button
                              style={{ ...s.btn('danger'), fontSize: 11, padding: '4px 10px' }}
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
              <div style={{ fontSize: 14, fontWeight: 700 }}>Edit: {editing.name || fmtType(editing.type)}</div>
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
