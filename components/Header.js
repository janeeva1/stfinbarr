'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const MENU = [
  ['/', 'Home'],
  ['About', [['/about', 'About the Parish'], ['/about#patron', 'Our Patron, St. Finbarr'], ['/ministries', 'Societies & Ministries']]],
  ['Worship', [['/mass-times', 'Mass & Confession Times'], ['/mass-times#holy-days', 'Holy Days & Feasts'], ['/readings', 'Daily Mass Readings'], ['/readings?day=sunday', 'Sunday Readings'], ['/sacraments', 'Sacraments'], ['/live', 'Livestream Mass']]],
  ['Parish Life', [['/events', 'Events'], ['/news', 'News & Announcements'], ['/gallery', 'Photo Gallery']]],
  ['/live', 'Live'],
  ['/contact', 'Contact'],
];

export default function Header({ s }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(null);
  const live = s.live_now === 'true';
  useEffect(() => { setOpen(false); setDrop(null); }, [path]);
  const active = (href) => (href === '/' ? path === '/' : path.startsWith(href.split(/[?#]/)[0]));

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
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container">
          <Link href="/" className="brand">
            {s.logo ? <img src={s.logo} className="brand-logo" alt="" /> : <span className="brand-mark">✝</span>}
            <span className="brand-text"><strong>{s.parish_short || s.parish_name}</strong><small>{s.motto || s.diocese}</small></span>
          </Link>
          <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
          <nav className={`nav ${open ? 'open' : ''}`}>
            {MENU.map(([a, b]) => Array.isArray(b) ? (
              <div key={a} className={`dd ${drop === a ? 'show' : ''}`} onMouseEnter={() => setDrop(a)} onMouseLeave={() => setDrop(null)}>
                <button type="button" className={`dd-btn ${b.some(([h]) => active(h)) ? 'active' : ''}`} aria-expanded={drop === a} onClick={() => setDrop(drop === a ? null : a)}>{a} <span className="caret">▾</span></button>
                <div className="dd-menu">{b.map(([h, l]) => <Link key={h} href={h}>{l}{h === '/live' && live && <span className="live-dot" />}</Link>)}</div>
              </div>
            ) : (
              <Link key={a} href={a} className={`${active(a) ? 'active' : ''} ${a === '/live' ? 'nav-live' : ''}`}>
                {a === '/live' ? <>{live ? <span className="live-dot" /> : '📺'} {live ? 'Live now' : b}</> : b}
              </Link>
            ))}
            <Link href="/donate" className="btn btn-primary">Give Online</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
