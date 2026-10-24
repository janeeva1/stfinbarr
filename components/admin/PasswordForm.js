'use client';
import { useState } from 'react';

export default function PasswordForm() {
  const [msg, setMsg] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (f.next !== f.confirm) return setMsg({ ok: false, text: 'The new passwords do not match' });
    const r = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json();
    setMsg(r.ok ? { ok: true, text: 'Password changed.' } : { ok: false, text: j.error });
    if (r.ok) e.currentTarget.reset();
  };
  return (
    <form className="a-card form" onSubmit={submit} style={{ maxWidth: 480 }}>
      <h3>Change password</h3>
      <label className="f">Current password<input name="current" type="password" className="input" required /></label>
      <label className="f">New password<input name="next" type="password" className="input" required minLength={8} autoComplete="new-password" /></label>
      <label className="f">Repeat new password<input name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" /></label>
      <p className="muted" style={{ fontSize: 13, margin: 0 }}>At least 8 characters, with letters and numbers.</p>
      {msg && <div className={`alert ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <button className="btn btn-primary">Save new password</button>
    </form>
  );
}
