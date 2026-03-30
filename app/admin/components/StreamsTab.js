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
  const [selectedRoom, setSelectedRoom] = useState('');
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

  // When selectedChurch changes, reset player and load new stream
  useEffect(() => {
    destroyPlayer();
    setIsLive(false);
    setStreamKey(null);
    setStreamMeta(null);
    setEquipmentStatus(null);
    setSelectedRoom('');
    if (!selectedChurch) return;
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

  const isLiveRef = useRef(isLive);
  isLiveRef.current = isLive;

  async function loadChurchStream(churchId) {
    try {
      const data = await relay(`/api/admin/stream/${churchId}/key`);
      // Only update streamKey state when key or rtmpUrl changes (not on every poll)
      setStreamKey(prev => {
        if (prev && prev.streamKey === data.streamKey && prev.rtmpUrl === data.rtmpUrl) return prev;
        return data;
      });
      // Update meta (sidebar only, doesn't affect video)
      if (data.meta) setStreamMeta(data.meta);
      // Only update isLive when it actually changes
      const wasLive = isLiveRef.current;
      if (data.active !== wasLive) {
        setIsLive(data.active);
        if (data.active && !wasLive) startPlayer(churchId, data.hlsUrl);
        else if (!data.active && wasLive) destroyPlayer();
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

  async function startPlayer(churchId, hlsUrl) {
    const video = videoRef.current;
    if (!video) return;
    // Direct Railway HLS URL (bypasses Vercel proxy — no body size limit, lower latency)
    // Falls back to proxy if direct URL not available
    const src = hlsUrl || streamKey?.hlsUrl || `/api/admin/relay?path=${encodeURIComponent(`/api/admin/stream/${churchId}/live.m3u8`)}`;

    // Dynamic import — hls.js uses browser APIs that break SSR
    const { default: Hls } = await import('hls.js');

    if (Hls.isSupported()) {
      destroyPlayer();
      const hls = new Hls({
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
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
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

  // ── Room data from support-view ──
  const rooms = equipmentStatus?.rooms || [];
  const roomInstanceMap = equipmentStatus?.roomInstanceMap || {};
  const instanceStatusMap = equipmentStatus?.instanceStatusMap || {};

  // ── Equipment rendering ──
  function renderEquipment() {
    if (!equipmentStatus) return <div style={{ color: C.muted, fontSize: 13, padding: '12px 0' }}>No data yet</div>;
    const st = equipmentStatus.status || {};
    let devices, online;
    if (selectedRoom) {
      const instName = roomInstanceMap[selectedRoom];
      const instData = instName ? instanceStatusMap[instName] : null;
      devices = instData?.connectedDevices || {};
      online = instData?.online ?? false;
    } else {
      devices = st.connectedDevices || {};
      online = st.online;
    }

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

  function formatUptime(startedAt) {
    if (!startedAt) return null;
    const seconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  function formatBitrate(kbps) {
    if (!kbps) return '—';
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
    return `${kbps} kbps`;
  }

  function bitrateColor(kbps) {
    if (!kbps) return C.muted;
    if (kbps >= 4000) return C.green;
    if (kbps >= 2000) return C.greenLt;
    if (kbps >= 1000) return C.yellow;
    return C.red;
  }

  function renderStreamMeta() {
    if (!isLive) {
      return <div style={{ color: C.muted, fontSize: 13, padding: '8px 0' }}>Stream not active</div>;
    }

    const sections = [];

    // ── Ingest Status ──
    const statusItems = [];
    statusItems.push({ label: 'RTMP Ingest', value: 'Connected', color: C.green });
    if (streamKey?.startedAt) {
      statusItems.push({ label: 'Uptime', value: formatUptime(streamKey.startedAt) });
    }
    sections.push({ title: 'Ingest Status', items: statusItems });

    // ── Video ──
    if (streamMeta) {
      const videoItems = [];
      if (streamMeta.resolution) videoItems.push({ label: 'Resolution', value: streamMeta.resolution });
      if (streamMeta.fps) videoItems.push({ label: 'Frame Rate', value: `${streamMeta.fps} fps` });
      if (streamMeta.codec) videoItems.push({ label: 'Video Codec', value: streamMeta.codec.toUpperCase() });
      if (streamMeta.audioCodec) videoItems.push({ label: 'Audio Codec', value: streamMeta.audioCodec.toUpperCase() });
      if (videoItems.length) sections.push({ title: 'Media', items: videoItems });
    }

    // ── Bitrate ──
    if (streamMeta?.bitrateKbps) {
      const br = streamMeta.bitrateKbps;
      sections.push({
        title: 'Bitrate',
        custom: (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: bitrateColor(br), fontFamily: 'monospace' }}>
                {formatBitrate(br)}
              </span>
              <span style={{ fontSize: 11, color: C.muted }}>
                {br >= 4000 ? 'Excellent' : br >= 2000 ? 'Good' : br >= 1000 ? 'Low' : 'Very Low'}
              </span>
            </div>
            <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${Math.min(100, (br / 10000) * 100)}%`,
                background: bitrateColor(br),
                transition: 'width 0.5s, background 0.5s',
              }} />
            </div>
          </div>
        ),
      });
    }

    // ── Church Equipment Context ──
    if (equipmentStatus) {
      const st = equipmentStatus.status || {};
      const eqItems = [];
      if (st.currentSession) {
        eqItems.push({ label: 'Service Session', value: 'Active', color: C.green });
        if (st.currentSession.duration) {
          eqItems.push({ label: 'Session Duration', value: `${Math.floor(st.currentSession.duration / 60)} min` });
        }
      }
      if (eqItems.length) sections.push({ title: 'Service Context', items: eqItems });
    }

    return sections.map((section, si) => (
      <div key={si} style={{ marginBottom: si < sections.length - 1 ? 14 : 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          {section.title}
        </div>
        {section.custom || section.items.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
            <span style={{ color: C.muted }}>{m.label}</span>
            <span style={{ color: m.color || C.white, fontWeight: 500, fontFamily: 'monospace' }}>{m.value}</span>
          </div>
        ))}
      </div>
    ));
  }

  if (loading) return <div style={{ color: C.muted, padding: 24 }}>Loading...</div>;

  return (
    <>
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

        {/* Room selector */}
        {selectedChurch && rooms.length > 0 && (
          <select
            value={selectedRoom}
            onChange={e => setSelectedRoom(e.target.value)}
            style={{ ...s.input, width: 180, cursor: 'pointer' }}
          >
            <option value="">All Rooms</option>
            {rooms.map(rm => (
              <option key={rm.id} value={rm.id}>{rm.name}</option>
            ))}
          </select>
        )}

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
