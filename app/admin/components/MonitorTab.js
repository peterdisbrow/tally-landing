'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { C, s } from './adminStyles';

function timeAgo(iso) {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function StatusDot({ color, label, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={title || label}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0,
        boxShadow: color === C.green ? `0 0 6px ${C.green}` : 'none',
      }} />
      <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
    </div>
  );
}

function getEquipmentStatus(st) {
  if (!st) return [];
  const items = [];

  // ATEM
  if (st.atem) {
    items.push({
      label: 'ATEM',
      color: st.atem.connected ? C.green : C.red,
      detail: st.atem.connected ? (st.atem.model || 'Connected') : 'Disconnected',
    });
  }

  // Encoder / OBS
  const enc = st.encoder || st.obs;
  if (enc) {
    const type = enc.type || (st.obs ? 'OBS' : 'Encoder');
    const live = enc.live || enc.streaming;
    items.push({
      label: type,
      color: enc.connected ? (live ? C.green : C.yellow) : C.red,
      detail: enc.connected ? (live ? 'Live' : 'Standby') : 'Disconnected',
    });
  }

  // Streaming
  if (st.streaming !== undefined) {
    items.push({
      label: 'Stream',
      color: st.streaming ? C.green : C.muted,
      detail: st.streaming ? '🔴 Live' : 'Off-air',
    });
  }

  // Audio
  if (st.audio) {
    const silent = st.audio.silenceDetected;
    const muted = st.audio.mainMuted || st.mixer?.mainMuted;
    items.push({
      label: 'Audio',
      color: silent ? C.red : (muted ? C.yellow : C.green),
      detail: silent ? 'Silence!' : (muted ? 'Muted' : 'OK'),
    });
  }

  return items;
}

function ChurchCard({ church }) {
  const { name, connected, status, lastSeen, activeAlerts, syncStatus } = church;

  const equipment = getEquipmentStatus(status);
  const hasAlerts = (activeAlerts || 0) > 0;

  // Status dot color
  let dotColor = C.muted; // gray = offline
  if (connected) {
    if (hasAlerts) dotColor = C.red;
    else if (equipment.some(e => e.color === C.yellow)) dotColor = C.yellow;
    else dotColor = C.green;
  }

  return (
    <div style={{
      background: C.surface, border: `1px solid ${hasAlerts ? C.red : C.border}`,
      borderRadius: 10, padding: 14, minWidth: 260,
      transition: 'border-color 0.3s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0,
          boxShadow: dotColor === C.green ? `0 0 6px ${C.green}` : 'none',
        }} />
        <div style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name || church.churchId}
        </div>
        {hasAlerts && (
          <span style={{ ...s.badge(C.red), fontSize: 10, padding: '2px 6px' }}>
            {activeAlerts} alert{activeAlerts > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Equipment rows */}
      {equipment.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {equipment.map((eq, i) => (
            <StatusDot key={i} color={eq.color} label={`${eq.label}: ${eq.detail}`} />
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
          {connected ? 'No equipment data' : 'Offline'}
        </div>
      )}

      {/* Sync status */}
      {syncStatus && syncStatus.status !== 'unavailable' && (
        <div style={{ fontSize: 11, color: syncStatus.status === 'ok' ? C.green : (syncStatus.status === 'warn' ? C.yellow : C.red), marginBottom: 4 }}>
          Sync: {syncStatus.avOffsetMs != null ? `${syncStatus.avOffsetMs}ms` : syncStatus.status}
        </div>
      )}

      {/* Footer */}
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>
        Last seen: {timeAgo(lastSeen || church.last_seen)}
      </div>
    </div>
  );
}

export default function MonitorTab({ token }) {
  const [churches, setChurches] = useState({});
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [err, setErr] = useState('');
  const esRef = useRef(null);
  const reconnectRef = useRef(null);

  const connect = useCallback(() => {
    if (!token) { setErr('No auth token'); return; }

    // Close existing connection
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    if (reconnectRef.current) { clearTimeout(reconnectRef.current); reconnectRef.current = null; }

    const es = new EventSource(`/api/admin/stream?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setErr('');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastUpdate(new Date());

        if (data.type === 'snapshot' || data.type === 'initial') {
          // Full replacement
          const map = {};
          const list = data.churches || (data.type === 'snapshot' ? Object.values(data) : []);
          if (Array.isArray(list)) {
            list.forEach(c => { if (c.churchId) map[c.churchId] = c; });
          } else if (typeof data.churches === 'object') {
            Object.values(data.churches).forEach(c => { if (c.churchId) map[c.churchId] = c; });
          }
          setChurches(map);
        } else if (data.type === 'update' && data.church) {
          setChurches(prev => ({ ...prev, [data.church.churchId]: { ...prev[data.church.churchId], ...data.church } }));
        } else if (data.type === 'status_update' && data.churchId) {
          setChurches(prev => ({
            ...prev,
            [data.churchId]: {
              ...prev[data.churchId],
              churchId: data.churchId,
              name: data.name || prev[data.churchId]?.name,
              status: data.status,
              lastSeen: data.timestamp || new Date().toISOString(),
              connected: true,
            },
          }));
        } else if (data.type === 'church_connected' && data.churchId) {
          setChurches(prev => ({
            ...prev,
            [data.churchId]: { ...prev[data.churchId], ...data, connected: true },
          }));
        } else if (data.type === 'church_disconnected' && data.churchId) {
          setChurches(prev => ({
            ...prev,
            [data.churchId]: { ...prev[data.churchId], churchId: data.churchId, name: data.name || prev[data.churchId]?.name, connected: false, status: null },
          }));
        } else if (data.type === 'alert' && data.churchId) {
          setChurches(prev => {
            const existing = prev[data.churchId] || {};
            return { ...prev, [data.churchId]: { ...existing, activeAlerts: (existing.activeAlerts || 0) + 1 } };
          });
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      esRef.current = null;
      // Reconnect after 5s
      reconnectRef.current = setTimeout(connect, 5000);
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (esRef.current) esRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const churchList = Object.values(churches);
  const onlineCount = churchList.filter(c => c.connected).length;
  const alertCount = churchList.reduce((sum, c) => sum + (c.activeAlerts || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: connected ? C.green : C.red,
            boxShadow: connected ? `0 0 8px ${C.green}` : 'none',
          }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{connected ? 'Live' : 'Connecting…'}</span>
        </div>

        <div style={{ fontSize: 12, color: C.muted }}>
          {onlineCount} online · {churchList.length} total
          {alertCount > 0 && <span style={{ color: C.red, marginLeft: 8 }}>🔔 {alertCount} alert{alertCount > 1 ? 's' : ''}</span>}
        </div>

        {lastUpdate && (
          <div style={{ fontSize: 11, color: C.dim, marginLeft: 'auto' }}>
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {err && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {/* Church grid */}
      {churchList.length === 0 ? (
        <div style={{ color: C.muted, padding: 24, textAlign: 'center' }}>
          {connected ? 'No churches connected.' : 'Connecting to live feed…'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {churchList
            .sort((a, b) => {
              // Online first, then alerts first, then alphabetical
              if (a.connected !== b.connected) return b.connected ? 1 : -1;
              if ((a.activeAlerts || 0) !== (b.activeAlerts || 0)) return (b.activeAlerts || 0) - (a.activeAlerts || 0);
              return (a.name || '').localeCompare(b.name || '');
            })
            .map(c => <ChurchCard key={c.churchId} church={c} />)
          }
        </div>
      )}
    </div>
  );
}
