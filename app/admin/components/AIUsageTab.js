'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, s } from './adminStyles';

const FEATURE_LABELS = {
  command_parser: '🎤 Command Parser',
  setup_assistant: '🎛️ Setup Assistant',
  dashboard_chat: '💬 Dashboard Chat',
  church_chat: '💬 Church Chat',
};

function StatCard({ label, value, highlight }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${highlight ? C.green : C.border}`,
      borderRadius: 10, padding: '16px 20px', textAlign: 'center', flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.green, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

export default function AIUsageTab({ relay }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  const load = useCallback(async () => {
    try {
      setErr('');
      setLoading(true);
      const d = await relay('/api/admin/ai-usage');
      setData(d);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ color: C.muted, padding: 24 }}>Loading AI usage data…</div>;
  if (err) return <div style={{ color: C.red, padding: 24 }}>Error: {err}</div>;
  if (!data) return null;

  const { totals, byChurch, byFeature } = data;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Requests (30d)" value={(totals.total_requests || 0).toLocaleString()} />
        <StatCard label="Input Tokens" value={(totals.total_input_tokens || 0).toLocaleString()} />
        <StatCard label="Output Tokens" value={(totals.total_output_tokens || 0).toLocaleString()} />
        <StatCard label="Est. Cost (30d)" value={'$' + (totals.total_cost || 0).toFixed(4)} highlight />
        <StatCard label="Cache Hits" value={(totals.cache_hits || 0).toLocaleString()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* By Church */}
        <div style={s.card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Usage by Church
          </div>
          {(!byChurch || byChurch.length === 0) ? (
            <div style={{ color: C.muted, fontSize: 13, padding: '12px 0' }}>No usage data yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Church</th>
                  <th style={s.th}>Requests</th>
                  <th style={s.th}>Input Tok</th>
                  <th style={s.th}>Output Tok</th>
                  <th style={s.th}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {byChurch.map((r, i) => (
                  <tr key={i}>
                    <td style={s.td}>{r.church_name || r.church_id || 'Admin / Dashboard'}</td>
                    <td style={s.td}>{(r.requests || 0).toLocaleString()}</td>
                    <td style={s.td}>{(r.input_tokens || 0).toLocaleString()}</td>
                    <td style={s.td}>{(r.output_tokens || 0).toLocaleString()}</td>
                    <td style={s.td}>${(r.cost || 0).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* By Feature */}
        <div style={s.card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Usage by Feature
          </div>
          {(!byFeature || byFeature.length === 0) ? (
            <div style={{ color: C.muted, fontSize: 13, padding: '12px 0' }}>No usage data yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Feature</th>
                  <th style={s.th}>Requests</th>
                  <th style={s.th}>Input Tok</th>
                  <th style={s.th}>Output Tok</th>
                  <th style={s.th}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {byFeature.map((r, i) => (
                  <tr key={i}>
                    <td style={s.td}>{FEATURE_LABELS[r.feature] || r.feature}</td>
                    <td style={s.td}>{(r.requests || 0).toLocaleString()}</td>
                    <td style={s.td}>{(r.input_tokens || 0).toLocaleString()}</td>
                    <td style={s.td}>{(r.output_tokens || 0).toLocaleString()}</td>
                    <td style={s.td}>${(r.cost || 0).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
