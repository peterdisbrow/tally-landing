'use client';
import { useState, useEffect } from 'react';
import { C, s, ROLE_COLORS, ROLE_LABELS, canWrite, tabsForRole } from './components/adminStyles';
import useRelay from './components/useRelay';
import LoginScreen from './components/LoginScreen';
import ChurchesTab from './components/ChurchesTab';
import ResellersTab from './components/ResellersTab';
import UsersTab from './components/UsersTab';
import AIUsageTab from './components/AIUsageTab';
import AlertsTab from './components/AlertsTab';
import TicketsTab from './components/TicketsTab';
import MonitorTab from './components/MonitorTab';
import AIChatDrawer from './components/AIChatDrawer';

export default function AdminPage() {
  const [token, setToken]   = useState(null);
  const [user, setUser]     = useState(null);
  const [tab, setTab]       = useState('churches');
  const [relayOk, setRelayOk] = useState(null);
  const [relayErr, setRelayErr] = useState('');
  const [relayMeta, setRelayMeta] = useState('');
  const [showDiag, setShowDiag] = useState(false);
  const relay = useRelay(token);

  const role = user?.role || 'admin';

  // Restore session from sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedToken = sessionStorage.getItem('tally_admin_token');
    const savedUser  = sessionStorage.getItem('tally_admin_user');
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
  }, []);

  function handleLogin(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
  }

  async function signOut() {
    try {
      await fetch('/api/admin/signout', { method: 'POST' });
    } catch {}
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('tally_admin_token');
      sessionStorage.removeItem('tally_admin_user');
    }
    setToken(null);    setUser(null);
    setRelayOk(null);
    setRelayErr('');
    setRelayMeta('');
    setShowDiag(false);
  }

  // Validate session and fetch latest user profile on mount
  useEffect(() => {
    if (!token) return;

    async function check() {
      try {
        // Fetch user profile to validate JWT + get latest role
        const profileRes = await fetch('/api/admin/relay?path=%2Fapi%2Fadmin%2Fme', { method: 'GET' });
        if (profileRes.ok) {
          const txt = await profileRes.text();
          let profile = {};
          try {
            profile = txt ? JSON.parse(txt) : {};
          } catch {
            profile = { error: txt || 'Invalid profile response' };
          }
          if (profile?.user) {
            setUser(profile.user);
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('tally_admin_user', JSON.stringify(profile.user));
            }
          }
        } else if (profileRes.status === 401) {
          signOut();
          return;
        }

        // Also check relay health
        const res = await fetch('/api/admin/relay?path=%2Fapi%2Fhealth', { method: 'GET' });

        let bodyText = '';
        try { bodyText = await res.text(); } catch {}

        let body;
        try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = bodyText; }

        if (!res.ok) {
          const msg = (body && body.error) || bodyText || `HTTP ${res.status}`;
          setRelayOk(false);
          setRelayErr(String(msg));
          setRelayMeta(`HTTP ${res.status}`);
          return;
        }

        setRelayOk(true);
        setRelayErr('');
        setRelayMeta(`${body?.service || 'tally-relay'} \u2022 ${body?.registeredChurches != null ? `${body.registeredChurches} churches` : ''}`);
      } catch (err) {
        setRelayOk(false);
        setRelayErr(String(err.message || err));
        setRelayMeta('');
      }
    }

    check();
  }, [token]);

  // If current tab becomes unavailable for the user's role, reset to churches
  const availTabs = tabsForRole(role);
  useEffect(() => {
    if (!availTabs.find(([id]) => id === tab)) {
      setTab('churches');
    }
  }, [role, tab, availTabs]);

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>{'\u26EA'} <span style={s.logoGreen}>Tally</span> <span style={{ color: C.muted, fontWeight: 400 }}>Admin</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: relayOk === null ? C.muted : relayOk ? C.green : C.red }} />
            {relayOk === null ? 'Connecting\u2026' : relayOk ? `Relay Live${relayMeta ? ` \u2022 ${relayMeta}` : ''}` : `Relay Offline${relayErr ? ' \u2014 ' + relayErr : ''}`}
          </div>
          {(!relayOk && relayErr) || showDiag ? (
            <button
              style={{ ...s.btn('secondary'), fontSize: 11, padding: '6px 10px' }}
              onClick={() => setShowDiag((v) => !v)}
            >
              {showDiag ? 'Hide' : 'Show'} details
            </button>
          ) : null}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: C.white }}>{user.name || user.email}</span>
              <span style={s.badge(ROLE_COLORS[role] || C.muted)}>{ROLE_LABELS[role] || role}</span>
            </div>
          )}
          <button
            style={{ ...s.btn('secondary'), fontSize: 12, padding: '6px 12px' }}
            onClick={signOut}
          >Sign Out</button>
        </div>
      </header>

      <main style={s.main}>
        <div style={{ ...s.card, marginBottom: 16, background: '#0d1017', borderColor: '#1d2e24' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Tally operations dashboard</div>
          <div style={{ color: C.muted, fontSize: 12 }}>
            {canWrite(role)
              ? 'Manage churches, control relay registration, and onboard TDs.'
              : role === 'engineer'
                ? 'Monitor church connections, status, and system health.'
                : 'View churches and reseller accounts.'}
          </div>
        </div>
        <nav style={s.tabBar}>
          {availTabs.map(([id, label]) => (
            <button key={id} style={s.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>

        {showDiag && (
          <div style={{ ...s.card, marginBottom: 16, background: '#0d1017' }}>
            <div style={{ fontSize: 12, color: C.muted }}>Diagnostics</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, margin: 0, color: C.yellow }}>{relayErr || 'No issues detected.'}</pre>
          </div>
        )}

        {tab === 'churches'  && <ChurchesTab  relay={relay} role={role} />}
        {tab === 'resellers' && <ResellersTab relay={relay} role={role} />}
        {tab === 'users'     && <UsersTab relay={relay} />}
        {tab === 'aiusage'   && <AIUsageTab relay={relay} />}
        {tab === 'alerts'    && <AlertsTab relay={relay} role={role} />}
        {tab === 'tickets'   && <TicketsTab relay={relay} role={role} />}
        {tab === 'monitor'   && <MonitorTab token={token} />}
      </main>
      <AIChatDrawer relay={relay} />
    </div>
  );
}
