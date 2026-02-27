'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { C, s, canWrite } from './adminStyles';

const STATE_COLORS = { operational: C.green, degraded: C.yellow, outage: C.red };
const STATE_LABELS = { operational: 'Operational', degraded: 'Degraded', outage: 'Outage' };

function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return '\u2014';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function timeAgo(iso) {
  if (!iso) return '\u2014';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function StatCard({ label, value }) {
  return (
    <div style={s.statCard}>
      <div style={s.statLbl}>{label}</div>
      <div style={s.statVal}>{value}</div>
    </div>
  );
}

function overallState(components) {
  if (!components || components.length === 0) return null;
  if (components.some(c => c.state === 'outage')) return 'outage';
  if (components.some(c => c.state === 'degraded')) return 'degraded';
  return 'operational';
}

export default function StatusTab({ relay, role }) {
  const [health, setHealth]         = useState(null);
  const [components, setComponents] = useState(null);
  const [incidents, setIncidents]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState('');
  const [checking, setChecking]     = useState(false);
  const intervalRef = useRef(null);

  const load = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setErr('');
      const [h, comp, inc] = await Promise.all([
        relay('/api/health'),
        relay('/api/status/components'),
        relay('/api/status/incidents?limit=20'),
      ]);
      setHealth(h);
      setComponents(comp?.components || []);
      setIncidents(Array.isArray(inc) ? inc : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [relay]);

  useEffect(() => {
    load();
    // Auto-refresh every 30s
    intervalRef.current = setInterval(() => load(false), 30000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const runChecks = async () => {
    try {
      setChecking(true);
      await relay('/api/status/run-checks', { method: 'POST' });
      await load(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div style={{ color: C.muted, padding: 24 }}>Loading system status\u2026</div>;
  if (err) return <div style={{ color: C.red, padding: 24 }}>Error: {err}</div>;

  const overall = overallState(components);
  const overallColor = overall ? (STATE_COLORS[overall] || C.muted) : C.muted;

  return (
    <div>
      {/* Health summary bar */}
      <div style={{
        ...s.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%', background: overallColor,
            boxShadow: overall === 'operational' ? `0 0 8px ${C.green}` : 'none',
          }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {overall === 'operational' ? 'All Systems Operational' : overall === 'degraded' ? 'Degraded Performance' : overall === 'outage' ? 'Service Outage' : 'Unknown'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {health?.service || 'tally-relay'} v{health?.version || '?'}
              {health?.build ? ` (${health.build.slice(0, 8)})` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            Up {formatUptime(health?.uptime)}
          </div>
          <button style={s.btn('secondary')} onClick={() => load(false)}>{'\u21BB'} Refresh</button>
          {canWrite(role) && (
            <button style={s.btn('primary')} onClick={runChecks} disabled={checking}>
              {checking ? 'Running\u2026' : 'Run Checks'}
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Registered" value={(health?.registeredChurches || 0).toLocaleString()} />
        <StatCard label="Connected" value={(health?.connectedChurches || 0).toLocaleString()} />
        <StatCard label="Controllers" value={(health?.controllers || 0).toLocaleString()} />
        <StatCard label="Messages Relayed" value={(health?.totalMessagesRelayed || 0).toLocaleString()} />
      </div>

      {/* System components */}
      <div style={s.card}>
        <div style={s.sectionTitle}>System Components</div>
        {(!components || components.length === 0) ? (
          <div style={{ color: C.muted, fontSize: 13 }}>No component data available.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Component</th>
                <th style={s.th}>State</th>
                <th style={s.th}>Latency</th>
                <th style={s.th}>Detail</th>
                <th style={s.th}>Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {components.map(c => (
                <tr key={c.component_id}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{c.name}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: STATE_COLORS[c.state] || C.muted,
                        boxShadow: c.state === 'operational' ? `0 0 6px ${C.green}` : 'none',
                      }} />
                      <span style={s.badge(STATE_COLORS[c.state] || C.muted)}>
                        {STATE_LABELS[c.state] || c.state}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12 }}>
                    {c.latency_ms != null ? `${c.latency_ms}ms` : '\u2014'}
                  </td>
                  <td style={{ ...s.td, color: C.muted, fontSize: 12 }}>{c.detail || '\u2014'}</td>
                  <td style={{ ...s.td, color: C.muted, fontSize: 12 }}>{timeAgo(c.last_checked_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent incidents */}
      <div style={s.card}>
        <div style={s.sectionTitle}>Recent Incidents</div>
        {(!incidents || incidents.length === 0) ? (
          <div style={{ color: C.muted, fontSize: 13 }}>No recent incidents.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {incidents.map(inc => {
              const resolved = !!inc.resolved_at;
              const fromColor = STATE_COLORS[inc.previous_state] || C.muted;
              const toColor = STATE_COLORS[inc.new_state] || C.muted;
              return (
                <div key={inc.id} style={{
                  borderLeft: `3px solid ${resolved ? C.muted : toColor}`,
                  padding: '10px 14px', borderBottom: `1px solid rgba(26,46,31,0.3)`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{inc.component_id}</span>
                    <span style={s.badge(fromColor)}>{STATE_LABELS[inc.previous_state] || inc.previous_state}</span>
                    <span style={{ color: C.dim, fontSize: 12 }}>{'\u2192'}</span>
                    <span style={s.badge(toColor)}>{STATE_LABELS[inc.new_state] || inc.new_state}</span>
                    {resolved && <span style={{ ...s.badge(C.green), marginLeft: 4 }}>Resolved</span>}
                  </div>
                  {inc.message && (
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{inc.message}</div>
                  )}
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
                    {timeAgo(inc.started_at)}
                    {resolved && ` \u2022 Resolved ${timeAgo(inc.resolved_at)}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
