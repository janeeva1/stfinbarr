'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    if (r.ok) window.location.href = '/admin';
    else { setErr((await r.json()).error || 'Login failed'); setBusy(false); }
  };
  return (
    <div className="login-wrap">
      <form className="login-card form" onSubmit={submit}>
        <div className="center"><span className="brand-mark" style={{ margin: '0 auto 14px', width: 60, height: 60, fontSize: 28 }}>✝</span>
          <h2 style={{ marginBottom: 4 }}>Parish Admin</h2><p className="muted" style={{ fontSize: 14 }}>Website CMS & Church Management</p></div>
        <label className="f">Email<input name="email" type="email" className="input" autoComplete="username" required /></label>
        <label className="f">Password<input name="password" type="password" className="input" autoComplete="current-password" required /></label>
        {err && <div className="alert err">{err}</div>}
        <button className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link href="/" className="center" style={{ fontSize: 14 }}>← Back to website</Link>
      </form>
    </div>
  );
}
