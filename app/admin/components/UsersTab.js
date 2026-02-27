'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, s, ROLE_COLORS, ROLE_LABELS } from './adminStyles';

export default function UsersTab({ relay }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [modal, setModal]     = useState(null); // null | 'add' | { user }
  const [pwModal, setPwModal] = useState(null); // null | { userId, name }
  const [form, setForm]       = useState({ email: '', password: '', name: '', role: 'admin' });
  const [formErr, setFormErr] = useState('');
  const [formOk, setFormOk]   = useState('');
  const [saving, setSaving]   = useState(false);
  const [newPw, setNewPw]     = useState('');
  const [pwErr, setPwErr]     = useState('');
  const [pwOk, setPwOk]       = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setErr('');
      const data = await relay('/api/admin/users');
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [relay]);

  useEffect(() => { load(); }, [load]);

  async function createUser(e) {
    e.preventDefault();
    setFormErr(''); setFormOk(''); setSaving(true);
    try {
      await relay('/api/admin/users', { method: 'POST', body: form });
      setFormOk('User created successfully');
      setForm({ email: '', password: '', name: '', role: 'admin' });
      load();
      setTimeout(() => setModal(null), 1200);
    } catch(e) { setFormErr(e.message); }
    finally { setSaving(false); }
  }

  async function updateUser(e) {
    e.preventDefault();
    if (!modal?.user) return;
    setFormErr(''); setFormOk(''); setSaving(true);
    try {
      await relay(`/api/admin/users/${modal.user.id}`, { method: 'PUT', body: { name: form.name, role: form.role, active: form.active } });
      setFormOk('Updated');
      load();
      setTimeout(() => setModal(null), 800);
    } catch(e) { setFormErr(e.message); }
    finally { setSaving(false); }
  }

  async function resetPassword(e) {
    e.preventDefault();
    if (!pwModal) return;
    setPwErr(''); setPwOk(''); setPwSaving(true);
    try {
      await relay(`/api/admin/users/${pwModal.userId}/password`, { method: 'PUT', body: { password: newPw } });
      setPwOk('Password reset');
      setNewPw('');
      setTimeout(() => setPwModal(null), 1000);
    } catch(e) { setPwErr(e.message); }
    finally { setPwSaving(false); }
  }

  async function toggleActive(user) {
    try {
      await relay(`/api/admin/users/${user.id}`, { method: 'PUT', body: { active: !user.active } });
      load();
    } catch(e) { alert(e.message); }
  }

  function openEdit(user) {
    setForm({ name: user.name, role: user.role, active: user.active });
    setFormErr(''); setFormOk('');
    setModal({ user });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Admin Users ({users.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn('secondary')} onClick={load}>{'\u21BB'} Refresh</button>
          <button style={s.btn('primary')} onClick={() => { setModal('add'); setForm({ email: '', password: '', name: '', role: 'admin' }); setFormErr(''); setFormOk(''); }}>+ Add User</button>
        </div>
      </div>

      {loading && <div style={s.empty}>Loading\u2026</div>}
      {err     && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{err}</div>}

      {!loading && !err && (
        users.length === 0
          ? <div style={s.empty}>No admin users found.</div>
          : <div style={s.card}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{u.name || '\u2014'}</td>
                      <td style={{ ...s.td, fontSize: 12, color: C.muted }}>{u.email}</td>
                      <td style={s.td}><span style={s.badge(ROLE_COLORS[u.role] || C.muted)}>{ROLE_LABELS[u.role] || u.role}</span></td>
                      <td style={s.td}><span style={s.badge(u.active ? C.green : C.muted)}>{u.active ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ ...s.td, fontSize: 12, color: C.muted }}>{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ ...s.btn('secondary'), padding: '4px 8px', fontSize: 11 }} onClick={() => openEdit(u)}>Edit</button>
                          <button style={{ ...s.btn('secondary'), padding: '4px 8px', fontSize: 11 }} onClick={() => { setPwModal({ userId: u.id, name: u.name || u.email }); setNewPw(''); setPwErr(''); setPwOk(''); }}>Reset PW</button>
                          <button style={{ ...s.btn(u.active ? 'danger' : 'primary'), padding: '4px 8px', fontSize: 11 }} onClick={() => toggleActive(u)}>{u.active ? 'Deactivate' : 'Activate'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {/* Add / Edit user modal */}
      {modal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={s.modalBox} role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div id="user-modal-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{modal === 'add' ? '+ Add Admin User' : `Edit: ${modal.user?.name || modal.user?.email}`}</div>
            <form onSubmit={modal === 'add' ? createUser : updateUser}>
              {modal === 'add' && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Email *</label>
                    <input style={s.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@atemschool.com" autoFocus required />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Password *</label>
                    <input style={s.input} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" minLength={8} required />
                  </div>
                </>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Name</label>
                <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" {...(modal === 'add' ? {} : { autoFocus: true })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Role</label>
                <select style={s.input} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {Object.entries(ROLE_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
              {modal !== 'add' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={!!form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    Active
                  </label>
                </div>
              )}
              {formErr && <div style={s.err}>{formErr}</div>}
              {formOk  && <div style={s.ok}>{formOk}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" style={s.btn('secondary')} onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" style={s.btn('primary')} disabled={saving}>{saving ? 'Saving\u2026' : modal === 'add' ? 'Create User' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password reset modal */}
      {pwModal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setPwModal(null); }}>
          <div style={s.modalBox} role="dialog" aria-modal="true" aria-labelledby="pw-reset-modal-title">
            <div id="pw-reset-modal-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Reset Password: {pwModal.name}</div>
            <form onSubmit={resetPassword}>
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>New Password *</label>
                <input style={s.input} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" minLength={8} required autoFocus />
              </div>
              {pwErr && <div style={s.err}>{pwErr}</div>}
              {pwOk  && <div style={s.ok}>{pwOk}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" style={s.btn('secondary')} onClick={() => setPwModal(null)}>Cancel</button>
                <button type="submit" style={s.btn('danger')} disabled={pwSaving}>{pwSaving ? 'Resetting\u2026' : 'Reset Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
