'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, s, canWrite } from './adminStyles';

const SEVERITY_COLORS = { CRITICAL: C.red, WARNING: C.yellow, INFO: C.blue };
const ALERT_TYPE_LABELS = {
  stream_stopped: '📡 Stream Stopped',
  atem_disconnected: '🔌 ATEM Disconnected',
  recording_failed: '⏺️ Recording Failed',
  fps_low: '🎞️ Low FPS',
  bitrate_low: '📉 Low Bitrate',
  cpu_high: '🔥 High CPU',
  obs_disconnected: '🔌 OBS Disconnected',
  companion_disconnected: '🔌 Companion Disconnected',
  vmix_disconnected: '🔌 vMix Disconnected',
  encoder_disconnected: '🔌 Encoder Disconnected',
  hyperdeck_disconnected: '🔌 HyperDeck Disconnected',
  mixer_disconnected: '🔌 Mixer Disconnected',
  ptz_disconnected: '🔌 PTZ Disconnected',
  stream_started: '▶️ Stream Started',
  recording_started: '⏺️ Recording Started',
  service_ended: '🏁 Service Ended',
  propresenter_disconnected: '🔌 ProPresenter Disconnected',
  multiple_systems_down: '🚨 Multiple Systems Down',
  no_td_response: '📵 No TD Response',
};

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AlertsTab({ relay, role }) {
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [severity, setSeverity] = useState('');
  const [ackFilter, setAckFilter] = useState('unacked');
  const [search, setSearch]     = useState('');

  const load = useCallback(async () => {
    try {
      setErr('');
      setLoading(true);
      let path = '/api/admin/alerts?limit=200';
      if (severity) path += `&severity=${severity}`;
      if (ackFilter === 'unacked') path += '&acknowledged=false';
      if (search) path += `&church=${encodeURIComponent(search)}`;
      const d = await relay(path);
      setAlerts(Array.isArray(d) ? d : []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay, severity, ackFilter, search]);

  useEffect(() => { load(); }, [load]);

  const acknowledge = async (id) => {
    try {
      await relay(`/api/admin/alerts/${id}/acknowledge`, { method: 'POST' });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged_at: new Date().toISOString(), acknowledged_by: 'you' } : a));
    } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          style={{ ...s.input, width: 140, padding: '6px 10px', fontSize: 13 }}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">🔴 Critical</option>
          <option value="WARNING">🟡 Warning</option>
          <option value="INFO">🔵 Info</option>
        </select>

        <select
          value={ackFilter}
          onChange={e => setAckFilter(e.target.value)}
          style={{ ...s.input, width: 160, padding: '6px 10px', fontSize: 13 }}
        >
          <option value="unacked">Unacknowledged</option>
          <option value="all">All</option>
        </select>

        <input
          placeholder="Search by church…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...s.input, width: 200, padding: '6px 10px', fontSize: 13 }}
        />

        <button style={s.btn('secondary')} onClick={load}>↻ Refresh</button>

        <div style={{ marginLeft: 'auto', color: C.muted, fontSize: 12 }}>
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading && <div style={{ color: C.muted, padding: 24 }}>Loading alerts…</div>}
      {err && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && (
        alerts.length === 0
          ? <div style={{ color: C.muted, padding: 24, textAlign: 'center' }}>No alerts found.</div>
          : <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Time</th>
                    <th style={s.th}>Church</th>
                    <th style={s.th}>Type</th>
                    <th style={s.th}>Severity</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(a => (
                    <tr key={a.id}>
                      <td style={s.td} title={a.created_at}>{timeAgo(a.created_at)}</td>
                      <td style={s.td}>{a.church_name || a.church_id || '—'}</td>
                      <td style={s.td}>{ALERT_TYPE_LABELS[a.alert_type] || a.alert_type}</td>
                      <td style={s.td}>
                        <span style={s.badge(SEVERITY_COLORS[a.severity] || C.muted)}>
                          {a.severity}
                        </span>
                      </td>
                      <td style={s.td}>
                        {a.acknowledged_at ? (
                          <span style={s.badge(C.green)} title={`Ack'd by ${a.acknowledged_by || 'admin'} at ${a.acknowledged_at}`}>
                            Ack&apos;d
                          </span>
                        ) : (
                          <span style={s.badge(C.red)}>Active</span>
                        )}
                      </td>
                      <td style={s.td}>
                        {!a.acknowledged_at && canWrite(role) && (
                          <button
                            style={{ ...s.btn('primary'), padding: '4px 10px', fontSize: 11 }}
                            onClick={() => acknowledge(a.id)}
                          >
                            Acknowledge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}
    </div>
  );
}
