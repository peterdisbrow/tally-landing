import { useState, useEffect, useRef, useCallback } from "react";

const RELAY_URL = "https://api.tallyconnect.app";
const WS_URL = "wss://api.tallyconnect.app";
const TOKEN_KEY = "tallyconnect-clock-token";
const CHURCH_KEY = "tallyconnect-clock-church";
const ROOM_KEY = "tallyconnect-clock-room";

export interface ProPresenterStatus {
  connected: boolean;
  currentSlide?: string;
  slideIndex?: number;
  slideTotal?: number;
  currentItem?: string;
  nextItem?: string;
  presentation?: string;
  timers?: Array<{
    name: string;
    running: boolean;
    value: string; // HH:MM:SS
    total?: string;
  }>;
}

export interface HyperDeckStatus {
  connected: boolean;
  recording?: boolean;
  playing?: boolean;
  paused?: boolean;
  currentTimecode?: string; // HH:MM:SS:FF
  currentClip?: string;
  clipDuration?: string;
  transportState?: string;
  name?: string;
  host?: string;
  index?: number;
}

export interface AtemStatus {
  connected: boolean;
  streaming?: boolean;
  recording?: boolean;
  model?: string;
  timecode?: string; // HH:MM:SS:FF
}

export interface RoomStatus {
  proPresenter?: ProPresenterStatus;
  hyperdecks?: HyperDeckStatus[];
  atem?: AtemStatus;
}

export interface RoomInfo {
  id: string;
  name: string;
  description?: string;
}

export interface ChurchInfo {
  churchId: string;
  name: string;
  email?: string;
}

export interface TallyConnectState {
  isAuthenticated: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  church: ChurchInfo | null;
  rooms: RoomInfo[];
  selectedRoom: string | null;
  status: RoomStatus;
  error: string | null;
  streamStartedAt: number | null;
  recordingStartedAt: number | null;
  atemRecordingStartedAt: number | null;
  lastCueAt: number | null;
  atemTimecode: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  selectRoom: (roomId: string | null) => void;
}

export function useTallyConnect(): TallyConnectState {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  });
  const [church, setChurch] = useState<ChurchInfo | null>(() => {
    try {
      const raw = localStorage.getItem(CHURCH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(() => {
    try { return localStorage.getItem(ROOM_KEY); } catch { return null; }
  });
  const [status, setStatus] = useState<RoomStatus>({});
  const [error, setError] = useState<string | null>(null);
  const [streamStartedAt, setStreamStartedAt] = useState<number | null>(null);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [atemRecordingStartedAt, setAtemRecordingStartedAt] = useState<number | null>(null);
  const [lastCueAt, setLastCueAt] = useState<number | null>(null);
  const [atemTimecode, setAtemTimecode] = useState<string | null>(null);

  // Refs to track previous state for edge detection
  const prevStreamingRef = useRef<boolean | undefined>(undefined);
  const prevRecordingRef = useRef<boolean | undefined>(undefined);
  const prevAtemRecordingRef = useRef<boolean | undefined>(undefined);
  const prevSlideIndexRef = useRef<number | undefined>(undefined);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempt = useRef(0);

  const fetchRooms = useCallback(async (jwt: string) => {
    try {
      const res = await fetch(`${RELAY_URL}/api/church/app/rooms`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.rooms && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
        // If saved room no longer exists, clear it
        const savedRoom = localStorage.getItem(ROOM_KEY);
        if (savedRoom && !data.rooms.some((r: RoomInfo) => r.id === savedRoom)) {
          setSelectedRoom(null);
          localStorage.removeItem(ROOM_KEY);
        }
      }
    } catch {}
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const connect = useCallback((jwt: string) => {
    cleanup();
    setIsConnecting(true);
    setError(null);

    const ws = new WebSocket(`${WS_URL}/portal?token=${encodeURIComponent(jwt)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempt.current = 0;
      setIsConnecting(false);
      setIsConnected(true);
      fetchRooms(jwt);
      // Re-subscribe to saved room on reconnect
      const savedRoom = localStorage.getItem(ROOM_KEY);
      if (savedRoom && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "subscribe_room", roomId: savedRoom }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "connected") {
          setChurch({ churchId: msg.churchId, name: msg.name });
          try {
            localStorage.setItem(CHURCH_KEY, JSON.stringify({ churchId: msg.churchId, name: msg.name }));
          } catch {}
        }

        if (msg.type === "status_update" && msg.status) {
          // Resolve room-specific status for multi-room churches
          const savedRoom = localStorage.getItem(ROOM_KEY);
          let s = msg.status;
          if (savedRoom && msg.instanceStatus && msg.roomInstanceMap) {
            const instanceKey = msg.roomInstanceMap[savedRoom];
            if (instanceKey && msg.instanceStatus[instanceKey]) {
              s = msg.instanceStatus[instanceKey];
            }
          }

          // Track ATEM streaming state transitions
          if (s.atem?.streaming !== undefined) {
            if (s.atem.streaming && !prevStreamingRef.current) {
              setStreamStartedAt(Date.now());
            } else if (!s.atem.streaming && prevStreamingRef.current) {
              setStreamStartedAt(null);
            }
            prevStreamingRef.current = s.atem.streaming;
          }

          // Track ATEM recording state transitions
          if (s.atem?.recording !== undefined) {
            if (s.atem.recording && !prevAtemRecordingRef.current) {
              setAtemRecordingStartedAt(Date.now());
            } else if (!s.atem.recording && prevAtemRecordingRef.current) {
              setAtemRecordingStartedAt(null);
            }
            prevAtemRecordingRef.current = s.atem.recording;
          }

          // Track HyperDeck recording state transitions (use first recording deck)
          const hdRecording = s.hyperdecks?.some((hd: any) => hd.recording) ??
            s.hyperdeck?.recording;
          if (hdRecording !== undefined) {
            if (hdRecording && !prevRecordingRef.current) {
              setRecordingStartedAt(Date.now());
            } else if (!hdRecording && prevRecordingRef.current) {
              setRecordingStartedAt(null);
            }
            prevRecordingRef.current = hdRecording;
          }

          // Track ProPresenter slide changes
          if (s.proPresenter?.slideIndex !== undefined &&
              s.proPresenter.slideIndex !== prevSlideIndexRef.current) {
            if (prevSlideIndexRef.current !== undefined) {
              setLastCueAt(Date.now());
            }
            prevSlideIndexRef.current = s.proPresenter.slideIndex;
          }

          // Track ATEM timecode
          if (s.atem?.timecode !== undefined) {
            setAtemTimecode(s.atem.timecode);
          }

          setStatus(prev => {
            const next = { ...prev };
            if (s.proPresenter !== undefined) {
              next.proPresenter = s.proPresenter;
            }
            if (s.hyperdecks !== undefined) {
              next.hyperdecks = s.hyperdecks;
            }
            if (s.atem !== undefined) {
              next.atem = s.atem;
            }
            // Room list is fetched via REST API on connect
            return next;
          });
        }

        if (msg.type === "pong") {
          // keepalive acknowledged
        }
      } catch {}
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(false);
      wsRef.current = null;

      // Don't reconnect on auth failures
      if (event.code === 1008) {
        const reason = event.reason || "";
        if (reason.includes("token") || reason.includes("invalid") || reason.includes("billing")) {
          setError(reason);
          setToken(null);
          try { localStorage.removeItem(TOKEN_KEY); } catch {}
          return;
        }
      }

      // Exponential backoff reconnect
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 30000);
      reconnectAttempt.current++;
      reconnectTimer.current = setTimeout(() => connect(jwt), delay);
    };

    ws.onerror = () => {
      // onclose will fire after this
    };

    // Keepalive ping every 30s
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
      }
    }, 30000);

    const origOnclose = ws.onclose;
    ws.onclose = (event) => {
      clearInterval(pingInterval);
      if (origOnclose) origOnclose.call(ws, event);
    };
  }, [cleanup]);

  // Auto-connect if we have a stored token
  useEffect(() => {
    if (token && !wsRef.current) {
      connect(token);
    }
    return cleanup;
  }, [token, connect, cleanup]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsConnecting(true);
    try {
      const res = await fetch(`${RELAY_URL}/api/church/app/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.error || `Login failed (${res.status})`);
        setIsConnecting(false);
        return false;
      }

      const data = await res.json();
      const jwt = data.token;

      try {
        localStorage.setItem(TOKEN_KEY, jwt);
      } catch {}

      setToken(jwt);
      setChurch(data.church || null);

      if (data.church) {
        try {
          localStorage.setItem(CHURCH_KEY, JSON.stringify(data.church));
        } catch {}
      }

      connect(jwt);
      return true;
    } catch (err: any) {
      setError(err.message || "Network error");
      setIsConnecting(false);
      return false;
    }
  }, [connect]);

  const logout = useCallback(() => {
    cleanup();
    setToken(null);
    setChurch(null);
    setRooms([]);
    setSelectedRoom(null);
    setStatus({});
    setError(null);
    setStreamStartedAt(null);
    setRecordingStartedAt(null);
    setAtemRecordingStartedAt(null);
    setLastCueAt(null);
    setAtemTimecode(null);
    prevStreamingRef.current = undefined;
    prevRecordingRef.current = undefined;
    prevAtemRecordingRef.current = undefined;
    prevSlideIndexRef.current = undefined;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CHURCH_KEY);
      localStorage.removeItem(ROOM_KEY);
    } catch {}
  }, [cleanup]);

  const selectRoom = useCallback((roomId: string | null) => {
    setSelectedRoom(roomId);
    try {
      if (roomId) {
        localStorage.setItem(ROOM_KEY, roomId);
      } else {
        localStorage.removeItem(ROOM_KEY);
      }
    } catch {}
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (roomId) {
        wsRef.current.send(JSON.stringify({ type: "subscribe_room", roomId }));
      } else {
        wsRef.current.send(JSON.stringify({ type: "unsubscribe_room" }));
      }
    }
  }, []);

  return {
    isAuthenticated: !!token,
    isConnecting,
    isConnected,
    church,
    rooms,
    selectedRoom,
    status,
    error,
    streamStartedAt,
    recordingStartedAt,
    atemRecordingStartedAt,
    lastCueAt,
    atemTimecode,
    login,
    logout,
    selectRoom,
  };
}
