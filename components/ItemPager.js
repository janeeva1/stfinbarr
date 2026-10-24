import Link from 'next/link';

// "Previous / All items / Next" links at the bottom of an event, post or album
export default function ItemPager({ prev, next, all, prevLabel = 'Previous', nextLabel = 'Next' }) {
  return (
    <nav className="pager" aria-label="More">
      {prev ? <Link href={prev.href} className="pager-item"><small>← {prevLabel}</small><b>{prev.title}</b></Link> : <span />}
      <Link href={all.href} className="pager-all">☰ {all.label}</Link>
      {next ? <Link href={next.href} className="pager-item right"><small>{nextLabel} →</small><b>{next.title}</b></Link> : <span />}
    </nav>
  );
}
