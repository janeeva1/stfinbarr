'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nav } from '@/lib/navState';

// Which menu section each page belongs to (for the breadcrumb trail)
const SECTION = {
  '/about': 'About', '/ministries': 'About',
  '/mass-times': 'Worship', '/readings': 'Worship', '/sacraments': 'Worship', '/live': 'Worship',
  '/events': 'Parish Life', '/news': 'Parish Life', '/gallery': 'Parish Life',
};
const LIST = { events: ['/events', 'Events'], news: ['/news', 'News'], gallery: ['/gallery', 'Gallery'] };

export default function PageNav({ title }) {
  const path = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    // Only use the browser's back if the visitor came from another page on this website
    const t = setTimeout(() => {
      let fromSite = false;
      try { fromSite = document.referrer.startsWith(window.location.origin); } catch {}
      setCanGoBack(nav.count > 1 || fromSite);
    }, 0);
    return () => clearTimeout(t);
  }, [path]);

  const parts = path.split('/').filter(Boolean);
  const top = '/' + (parts[0] || '');
  const parent = parts.length > 1 && LIST[parts[0]] ? LIST[parts[0]] : null;
  const section = SECTION[top];
  const trail = [['/', 'Home'], ...(section ? [[null, section]] : []), ...(parent ? [parent] : []), [null, title]];
  const fallback = parent ? parent[0] : '/';

  const back = () => (canGoBack ? router.back() : router.push(fallback));

  return (
    <div className="page-nav">
      <div className="container">
        <nav aria-label="Breadcrumb" className="trail">
          {trail.map(([href, label], i) => (
            <span key={i}>
              {i > 0 && <span className="sep">›</span>}
              {href ? <Link href={href}>{label}</Link> : <span className={i === trail.length - 1 ? 'here' : ''}>{label}</span>}
            </span>
          ))}
        </nav>
        <div className="page-nav-btns">
          <button type="button" onClick={back} className="nav-pill">← {canGoBack ? 'Back' : parent ? `All ${parent[1].toLowerCase()}` : 'Back'}</button>
          {path !== '/' && <Link href="/" className="nav-pill">⌂ Home</Link>}
        </div>
      </div>
    </div>
  );
}
