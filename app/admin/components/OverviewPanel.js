'use client';
import { useState, useEffect } from 'react';
import { C, s, getEncoderNameFromStatus, getEncoderConnectedFromStatus, getEncoderLiveFromStatus } from './adminStyles';

export default function OverviewPanel({ churchId, relay }) {
  const [status, setStatus] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [st, sc] = await Promise.all([
          relay(`/api/churches/${churchId}/status`).catch(() => null),
          relay(`/api/churches/${churchId}/schedule`).catch(() => null),
        ]);
        if (!cancelled) { setStatus(st); setSchedule(sc); }
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [churchId, relay]);

  if (loading) return <div style={{ color: C.muted, fontSize: 12, padding: '24px 0', textAlign: 'center' }}>Loading...</div>;

  const st = status || {};
  const eq = st.status?.equipment || st.equipment || {};
  const sc = schedule || {};
  const connected = st.connected ?? false;
  const lastSeen = st.lastSeen || st.last_seen;
  const version = st.status?.version || st.version;
  const encoderName = getEncoderNameFromStatus(st.status || st);
  const encoderConnected = getEncoderConnectedFromStatus(st.status || st);
  const encoderLive = getEncoderLiveFromStatus(st.status || st);

  return (
    <div>
      {/* Connection */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Connection</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={s.badge(connected ? C.green : C.muted)}>{connected ? 'Online' : 'Offline'}</span>
          {lastSeen && <span style={{ fontSize: 11, color: C.dim }}>Last seen: {new Date(lastSeen).toLocaleString()}</span>}
          {version && <span style={s.badge(C.blue)}>v{version}</span>}
        </div>
      </div>

      {/* Equipment */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Equipment</div>
        {Object.keys(eq).length === 0 ? (
          <div style={{ color: C.muted, fontSize: 12 }}>No equipment data available.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            {eq.atem && <div><span style={{ color: C.muted }}>ATEM:</span> <span style={{ color: C.white }}>{eq.atem.model || 'Connected'}</span></div>}
            <div><span style={{ color: C.muted }}>{encoderName}:</span> <span style={{ color: encoderConnected ? C.green : C.muted }}>{encoderConnected ? 'Connected' : 'Not connected'}</span></div>
            <div><span style={{ color: C.muted }}>Stream:</span> <span style={{ color: encoderLive ? C.red : C.muted }}>{encoderLive ? 'Live' : 'Off-air'}</span></div>
            {eq.propresenter !== undefined && <div><span style={{ color: C.muted }}>ProPresenter:</span> <span style={{ color: eq.propresenter ? C.green : C.muted }}>{eq.propresenter ? 'Connected' : 'Not connected'}</span></div>}
            {eq.audio && <div><span style={{ color: C.muted }}>Audio Inputs:</span> <span style={{ color: C.white }}>{Array.isArray(eq.audio) ? eq.audio.length : eq.audio}</span></div>}
          </div>
        )}
      </div>

      {/* Service Window */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Service Window</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
          <span style={s.badge(sc.inServiceWindow ? C.green : C.muted)}>
            {sc.inServiceWindow ? 'In Service Window' : 'Outside Service Window'}
          </span>
          {sc.nextService && <span style={{ color: C.dim }}>Next: {sc.nextService.day} {sc.nextService.time || ''}</span>}
        </div>
        {sc.schedule && sc.schedule.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
            {sc.schedule.map((d, i) => (
              d.times && d.times.length > 0 ? <div key={i}><span style={{ color: C.white }}>{d.day}:</span> {d.times.join(', ')}</div> : null
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
