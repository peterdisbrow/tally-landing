'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, s, canWrite } from './adminStyles';

const STATUS_COLORS = {
  open: C.red, in_progress: C.yellow, waiting_customer: C.blue,
  resolved: C.green, closed: C.muted,
};
const STATUS_LABELS = {
  open: 'Open', in_progress: 'In Progress', waiting_customer: 'Waiting',
  resolved: 'Resolved', closed: 'Closed',
};
const SEVERITY_COLORS = { P1: C.red, P2: C.yellow, P3: C.blue, P4: C.muted };
const CATEGORY_LABELS = {
  stream_down: '📡 Stream Down', no_audio_stream: '🔇 No Audio',
  slides_issue: '🖥️ Slides Issue', atem_connectivity: '🔌 ATEM',
  recording_issue: '⏺️ Recording', other: '📋 Other',
};

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function TicketDetail({ ticket, relay, role, onClose, onUpdate }) {
  const [status, setStatus] = useState(ticket.status);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const saveStatus = async () => {
    if (status === ticket.status) return;
    try {
      setSaving(true); setErr('');
      await relay(`/api/support/tickets/${ticket.id}`, {
        method: 'PUT',
        body: { status },
      });
      onUpdate({ ...ticket, status });
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  let diagnostics = null;
  try { diagnostics = typeof ticket.diagnostics_json === 'string' ? JSON.parse(ticket.diagnostics_json) : ticket.diagnostics_json; } catch {}

  return (
    <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...s.wideModalBox, maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{ticket.title}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {ticket.church_name || ticket.church_id} · {CATEGORY_LABELS[ticket.issue_category] || ticket.issue_category} · <span style={{ color: SEVERITY_COLORS[ticket.severity] || C.muted }}>{ticket.severity}</span>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer' }} onClick={onClose}>×</button>
        </div>

        {/* Status changer */}
        {canWrite(role) && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...s.input, width: 180, padding: '6px 10px', fontSize: 13 }}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button style={{ ...s.btn('primary'), padding: '6px 14px', fontSize: 12 }} onClick={saveStatus} disabled={saving || status === ticket.status}>
              {saving ? 'Saving…' : 'Update Status'}
            </button>
            {err && <span style={{ color: C.red, fontSize: 12 }}>{err}</span>}
          </div>
        )}

        {/* Description */}
        {ticket.description && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>Description</div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 13, whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </div>
          </div>
        )}

        {/* Diagnostics */}
        {diagnostics && Object.keys(diagnostics).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>Diagnostics</div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
              {JSON.stringify(diagnostics, null, 2)}
            </div>
          </div>
        )}

        {/* Updates timeline */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Updates</div>
          {(!ticket.updates || ticket.updates.length === 0)
            ? <div style={{ color: C.muted, fontSize: 13 }}>No updates yet.</div>
            : ticket.updates.map((u, i) => (
                <div key={u.id || i} style={{ borderLeft: `2px solid ${C.border}`, paddingLeft: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {u.actor_type === 'admin' ? '👤 Admin' : '⛪ Church'} · {timeAgo(u.created_at)}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{u.message}</div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

export default function TicketsTab({ relay, role }) {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  const load = useCallback(async () => {
    try {
      setErr('');
      setLoading(true);
      const d = await relay('/api/admin/tickets');
      let list = Array.isArray(d) ? d : [];
      if (statusFilter) list = list.filter(t => t.status === statusFilter);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(t =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.church_name || '').toLowerCase().includes(q)
        );
      }
      setTickets(list);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
    setSelected(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
  };

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...s.input, width: 160, padding: '6px 10px', fontSize: 13 }}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <input
          placeholder="Search title or church…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...s.input, width: 220, padding: '6px 10px', fontSize: 13 }}
        />

        <button style={s.btn('secondary')} onClick={load}>↻ Refresh</button>

        <div style={{ marginLeft: 'auto', color: C.muted, fontSize: 12 }}>
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading && <div style={{ color: C.muted, padding: 24 }}>Loading tickets…</div>}
      {err && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && (
        tickets.length === 0
          ? <div style={{ color: C.muted, padding: 24, textAlign: 'center' }}>No tickets found.</div>
          : <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Created</th>
                    <th style={s.th}>Church</th>
                    <th style={s.th}>Severity</th>
                    <th style={s.th}>Category</th>
                    <th style={s.th}>Title</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(t)}>
                      <td style={s.td} title={t.created_at}>{timeAgo(t.created_at)}</td>
                      <td style={s.td}>{t.church_name || t.church_id || '—'}</td>
                      <td style={s.td}>
                        <span style={s.badge(SEVERITY_COLORS[t.severity] || C.muted)}>{t.severity}</span>
                      </td>
                      <td style={s.td}>{CATEGORY_LABELS[t.issue_category] || t.issue_category}</td>
                      <td style={s.td}>{t.title}</td>
                      <td style={s.td}>
                        <span style={s.badge(STATUS_COLORS[t.status] || C.muted)}>
                          {STATUS_LABELS[t.status] || t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {selected && (
        <TicketDetail
          ticket={selected}
          relay={relay}
          role={role}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
