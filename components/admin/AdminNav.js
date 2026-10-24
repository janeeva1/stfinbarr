'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Slim bar at the top of every admin page: back, dashboard, website
export default function AdminNav({ labels }) {
  const path = usePathname();
  const router = useRouter();
  const parts = path.split('/').filter(Boolean); // ['admin', resource?, id?]
  const trail = [['/admin', 'Dashboard']];
  if (parts[1]) trail.push([`/admin/${parts[1]}`, labels[parts[1]] || parts[1].replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())]);
  if (parts[2]) trail.push([null, parts[2] === 'new' ? 'New' : 'Edit']);
  const parentHref = trail.length > 1 ? trail[trail.length - 2][0] : '/admin';
  return (
    <div className="admin-nav">
      <div className="admin-nav-left">
        {path !== '/admin' && <button type="button" className="btn btn-light btn-sm" onClick={() => (window.history.length > 1 ? router.back() : router.push(parentHref))}>← Back</button>}
        <nav className="trail" aria-label="Breadcrumb">
          {trail.map(([href, label], i) => (
            <span key={i}>{i > 0 && <span className="sep">›</span>}{href && i < trail.length - 1 ? <Link href={href}>{label}</Link> : <span className="here">{label}</span>}</span>
          ))}
        </nav>
      </div>
      <div className="admin-nav-right">
        {path !== '/admin' && <Link href="/admin" className="btn btn-light btn-sm">📊 Dashboard</Link>}
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-light btn-sm">🌐 View website</a>
      </div>
    </div>
  );
}
