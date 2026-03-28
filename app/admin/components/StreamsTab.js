'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { C, s } from './adminStyles';

export default function StreamsTab({ relay }) {
  const [churches, setChurches] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState('');
  const [activeStreams, setActiveStreams] = useState([]);
  const [streamKey, setStreamKey] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [equipmentStatus, setEquipmentStatus] = useState(null);
  const [streamMeta, setStreamMeta] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const pollRef = useRef(null);

  // Load churches + active streams on mount
  useEffect(() => {
    async function init() {
      try {
        const [churchData, streamData] = await Promise.all([
          relay('/api/admin/churches'),
          relay('/api/admin/streams'),
        ]);
        setChurches(churchData.churches || churchData || []);
        setActiveStreams(streamData.streams || []);

        // Auto-select first active stream
        if (streamData.streams?.length > 0 && !selectedChurch) {
          setSelectedChurch(streamData.streams[0].churchId);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [relay]);

  // When selectedChurch changes, load stream key + equipment status
  useEffect(() => {
    if (!selectedChurch) {
      setStreamKey(null);
      setEquipmentStatus(null);
      setIsLive(false);
      destroyPlayer();
      return;
    }
    loadChurchStream(selectedChurch);
    loadEquipmentStatus(selectedChurch);
  }, [selectedChurch]);

  // Poll for status every 8s when a church is selected
  useEffect(() => {
    if (!selectedChurch) return;
    pollRef.current = setInterval(() => {
      loadChurchStream(selectedChurch);
      loadEquipmentStatus(selectedChurch);
    }, 8000);
    return () => clearInterval(pollRef.current);
  }, [selectedChurch]);

  async function loadChurchStream(churchId) {
    try {
      const data = await relay(`/api/admin/stream/${churchId}/key`);
      setStreamKey(data);
      if (data.meta) setStreamMeta(data.meta);
      const wasLive = isLive;
      setIsLive(data.active);
      if (data.active && !wasLive) {
        startPlayer(churchId);
      } else if (!data.active && wasLive) {
        destroyPlayer();
      }
    } catch (e) {
      console.error('Failed to load stream key', e);
    }
  }

  async function loadEquipmentStatus(churchId) {
    try {
      const data = await relay(`/api/admin/church/${churchId}/support-view`);
      setEquipmentStatus(data);
    } catch (e) {
      console.error('Failed to load equipment status', e);
    }
  }

  function startPlayer(churchId) {
    const video = videoRef.current;
    if (!video) return;
    const src = `/api/admin/relay?path=${encodeURIComponent(`/api/admin/stream/${churchId}/live.m3u8`)}`;

    if (typeof window !== 'undefined' && window.Hls && window.Hls.isSupported()) {
      destroyPlayer();
      const hls = new window.Hls({
        liveDurationInfinity: true,
        liveBackBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
        highBufferWatchdogPeriod: 3,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(window.Hls.Events.ERROR, (_, data) => {
        if (data.fatal && data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setTimeout(() => {
            if (hlsRef.current) hlsRef.current.loadSource(src);
          }, 3000);
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => video.play().catch(() => {}));
    }
  }

  function destroyPlayer() {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPlayer();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleRegenerate() {
    if (!selectedChurch) return;
    if (!confirm('Regenerate stream key? This will disconnect any active stream.')) return;
    try {
      const data = await relay(`/api/admin/stream/${selectedChurch}/key/regenerate`, { method: 'POST' });
      setStreamKey(prev => ({ ...prev, ...data }));
      setIsLive(false);
      destroyPlayer();
      showToast('Stream key regenerated');
    } catch (e) {
      showToast('Failed to regenerate key');
    }
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied`));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  // ── Equipment rendering ──
  function renderEquipment() {
    if (!equipmentStatus) return <div style={{ color: C.muted, fontSize: 13, padding: '12px 0' }}>No data yet</div>;
    const st = equipmentStatus.status || {};
    const devices = st.connectedDevices || {};
    const online = st.online;

    const items = [];
    items.push({ label: 'App', ok: online, detail: online ? 'Connected' : 'Offline' });
    if (devices.atem !== undefined) items.push({ label: 'ATEM', ok: devices.atem });
    if (devices.obs !== undefined) items.push({ label: 'OBS', ok: devices.obs });
    if (devices.vmix !== undefined) items.push({ label: 'vMix', ok: devices.vmix });
    if (devices.companion !== undefined) items.push({ label: 'Companion', ok: devices.companion });
    if (Array.isArray(devices.encoders)) {
      devices.encoders.forEach((e, i) => items.push({
        label: `Encoder${devices.encoders.length > 1 ? ` ${i + 1}` : ''}${e.name ? ` (${e.name})` : ''}`,
        ok: e.connected || e.active,
      }));
    }
    if (Array.isArray(devices.mixers)) {
      devices.mixers.forEach(m => items.push({ label: `Audio${m.name ? ` (${m.name})` : ''}`, ok: m.connected }));
    }
    if (Array.isArray(devices.ptz)) {
      items.push({ label: `PTZ Cameras (${devices.ptz.length})`, ok: devices.ptz.length > 0 });
    }
    if (Array.isArray(devices.hyperdeck)) {
      devices.hyperdeck.forEach(h => items.push({ label: `HyperDeck${h.name ? ` (${h.name})` : ''}`, ok: h.connected }));
    }

    return items.map((item, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: item.ok ? C.green : '#555',
          boxShadow: item.ok ? `0 0 5px ${C.green}` : 'none',
        }} />
        <span>{item.label}</span>
        {item.detail && <span style={{ color: C.muted, fontSize: 11, marginLeft: 'auto' }}>{item.detail}</span>}
      </div>
    ));
  }

  function renderStreamMeta() {
    const items = [];

    // RTMP ingest analytics
    if (streamMeta && isLive) {
      if (streamMeta.bitrateKbps) items.push({ label: 'Bitrate', value: `${streamMeta.bitrateKbps} kbps`, color: streamMeta.bitrateKbps > 2000 ? C.green : C.yellow });
      if (streamMeta.resolution) items.push({ label: 'Resolution', value: streamMeta.resolution });
      if (streamMeta.fps) items.push({ label: 'FPS', value: String(streamMeta.fps) });
      if (streamMeta.codec) items.push({ label: 'Codec', value: streamMeta.codec.toUpperCase() });
    }

    // Uptime from stream start
    if (streamKey?.active && streamMeta) {
      const streams = activeStreams;
      // Calculate from startedAt if available
      if (streamKey.startedAt || (activeStreams.length > 0)) {
        // We don't have startedAt on streamKey, use from activeStreams list
      }
    }

    // Equipment session info
    if (equipmentStatus) {
      const st = equipmentStatus.status || {};
      if (st.streamActive !== undefined) items.push({ label: 'Encoder Stream', value: st.streamActive ? 'Active' : 'Inactive' });
      if (st.currentSession?.duration) items.push({ label: 'Session Duration', value: `${Math.floor(st.currentSession.duration / 60)} min` });
    }

    if (items.length === 0) return <div style={{ color: C.muted, fontSize: 13 }}>No stream metadata</div>;
    return items.map((m, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
        <span style={{ color: C.muted }}>{m.label}</span>
        <span style={{ color: m.color || C.white, fontWeight: 500, fontFamily: 'monospace' }}>{m.value}</span>
      </div>
    ));
  }

  if (loading) return <div style={{ color: C.muted, padding: 24 }}>Loading...</div>;

  return (
    <>
      {/* Load HLS.js */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js" />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={selectedChurch}
          onChange={e => setSelectedChurch(e.target.value)}
          style={{
            ...s.input, width: 280, cursor: 'pointer',
          }}
        >
          <option value="">— Select a church —</option>
          {churches.map(c => (
            <option key={c.churchId} value={c.churchId}>
              {c.name}{c.connected ? ' (online)' : ''}
            </option>
          ))}
        </select>

        {isLive && (
          <span style={{
            background: C.red, color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '3px 10px', borderRadius: 12, letterSpacing: '0.5px',
            animation: 'pulse-live 1.5s ease-in-out infinite',
          }}>
            LIVE
          </span>
        )}
        {selectedChurch && !isLive && (
          <span style={{
            background: C.border, color: C.muted, fontSize: 11, fontWeight: 600,
            padding: '3px 10px', borderRadius: 12,
          }}>
            OFFLINE
          </span>
        )}

        <div style={{ flex: 1 }} />
        <span style={{ color: C.muted, fontSize: 13 }}>
          {activeStreams.length > 0
            ? `${activeStreams.length} active stream${activeStreams.length > 1 ? 's' : ''}`
            : 'No active streams'}
        </span>
      </div>

      {/* Main layout: video + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedChurch ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Video player */}
        <div>
          <div style={{
            position: 'relative', width: '100%', paddingTop: '56.25%',
            background: '#000', borderRadius: 10, overflow: 'hidden',
          }}>
            <video
              ref={videoRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
              autoPlay muted={isMuted} playsInline
            />
            {(!selectedChurch || !isLive) && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#555', fontSize: 14,
              }}>
                {!selectedChurch ? 'Select a church to preview their stream' : 'Stream offline — waiting for RTMP input'}
              </div>
            )}
          </div>

          {/* Audio controls */}
          {isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, padding: '8px 0' }}>
              <button
                style={{ ...s.btn(isMuted ? 'secondary' : 'primary'), fontSize: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => {
                  const next = !isMuted;
                  setIsMuted(next);
                  if (videoRef.current) videoRef.current.muted = next;
                }}
              >
                {isMuted ? '\uD83D\uDD07 Unmute Audio' : '\uD83D\uDD0A Audio On'}
              </button>
              {!isMuted && (
                <input
                  type="range" min="0" max="1" step="0.05" defaultValue="0.7"
                  style={{ width: 100, accentColor: C.green }}
                  onChange={e => { if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value); }}
                />
              )}
            </div>
          )}

          {/* Stream key info card */}
          {streamKey && (
            <div style={{ ...s.card, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                RTMP Ingest Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '8px 12px', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: C.muted }}>RTMP URL</span>
                <code style={{ background: C.bg, padding: '6px 10px', borderRadius: 6, fontSize: 12, wordBreak: 'break-all' }}>
                  {streamKey.rtmpUrl?.replace(streamKey.streamKey, '{STREAM_KEY}') || '—'}
                </code>
                <button style={s.btn('secondary')} onClick={() => copyToClipboard(streamKey.rtmpUrl, 'RTMP URL')}>Copy</button>

                <span style={{ color: C.muted }}>Stream Key</span>
                <code style={{ background: C.bg, padding: '6px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }}>
                  {streamKey.streamKey || '—'}
                </code>
                <button style={s.btn('secondary')} onClick={() => copyToClipboard(streamKey.streamKey, 'Stream key')}>Copy</button>
              </div>
              <div style={{ marginTop: 12 }}>
                <button
                  style={{ ...s.btn('secondary'), color: C.red, borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={handleRegenerate}
                >
                  Regenerate Key
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Equipment / Tally sidebar */}
        {selectedChurch && (
          <div>
            <div style={{ ...s.card, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                Equipment Status
              </div>
              {renderEquipment()}
            </div>

            <div style={{ ...s.card }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                Stream Analytics
              </div>
              {renderStreamMeta()}
            </div>
          </div>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`@keyframes pulse-live { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: C.surface, color: C.white, padding: '10px 20px', borderRadius: 8,
          fontSize: 13, zIndex: 10000, border: `1px solid ${C.border}`,
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
