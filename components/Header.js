'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  ['/', 'Home'], ['/about', 'About'], ['/mass-times', 'Mass Times'], ['/events', 'Events'],
  ['/news', 'News'], ['/gallery', 'Gallery'], ['/ministries', 'Ministries'], ['/contact', 'Contact'],
];

export default function Header({ s }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="topbar">
        <div className="container">
          <div>
            <span>📍 {s.address}</span>
            <span className="hide-sm">📞 {s.phone}</span>
          </div>
          <div>
            <span className="hide-sm">✉️ <a href={`mailto:${s.email}`}>{s.email}</a></span>
            <Link href="/admin" style={{ color: 'var(--accent)' }}>Admin login →</Link>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container">
          <Link href="/" className="brand">
            {s.logo ? <img src={s.logo} className="brand-logo" alt="" /> : <span className="brand-mark">✝</span>}
            <span className="brand-text"><strong>{s.parish_short || s.parish_name}</strong><small>{s.diocese}</small></span>
          </Link>
          <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
          <nav className={`nav ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={(href === '/' ? path === '/' : path.startsWith(href)) ? 'active' : ''}>{label}</Link>
            ))}
            <Link href="/donate" className="btn btn-primary">Give Online</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
