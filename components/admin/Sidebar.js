'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar({ groups, s, user, perms = {} }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/admin/login'; };
  const A = ({ href, children }) => <Link href={href} className={(href === '/admin' ? path === href : path.startsWith(href)) ? 'on' : ''} onClick={() => setOpen(false)}>{children}</Link>;
  return (
    <>
      <button className="btn btn-light btn-sm admin-toggle" style={{ position: 'fixed', top: 14, right: 14, zIndex: 70 }} onClick={() => setOpen(!open)}>{open ? '✕' : '☰ Menu'}</button>
      <aside className={`side ${open ? 'open' : ''}`}>
        <Link href="/admin" className="brand">{s.logo ? <img src={s.logo} className="brand-logo" alt="" /> : <span className="brand-mark">✝</span>}<span className="brand-text"><strong>{s.parish_short}</strong><small>Admin Panel</small></span></Link>
        <A href="/admin">📊 Dashboard</A>
        {perms.settings && <A href="/admin/settings">🎨 Settings & Theme</A>}
        {Object.entries(groups).map(([g, items]) => (
          <div key={g}>
            <h6>{g}</h6>
            {items.map(([key, r]) => <A key={key} href={`/admin/${key}`}>{r.icon} {r.label}</A>)}
          </div>
        ))}
        {perms.backup && <><h6>Data</h6><A href="/admin/backup">💾 Backup & Export</A></>}
        <h6>Account · {user.roleLabel}</h6>
        <A href="/admin/account">🔑 My account</A>
        <a href="/" target="_blank">🌐 View website</a>
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 Sign out ({user.name.split(' ')[0]})</a>
      </aside>
    </>
  );
}
