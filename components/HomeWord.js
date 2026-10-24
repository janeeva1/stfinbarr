import Link from 'next/link';
import { getReadings, todayLocal } from '@/lib/readings';

// Today's Gospel on the homepage (streamed in, so a slow readings service never delays the page)
export default async function HomeWord() {
  const r = await getReadings(todayLocal());
  const g = r.gospel;
  const text = g ? g.html.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  return (
    <div className="word-card">
      <span className="eyebrow">Today’s Gospel</span>
      {r.liturgical_day && <p className="lit-day">{r.liturgical_day}</p>}
      {g ? (
        <>
          <h3>{g.ref}</h3>
          <p className="gospel-snippet">“{text.slice(0, 260)}{text.length > 260 ? '…' : ''}”</p>
        </>
      ) : <p className="muted">Read and pray with today’s Mass readings.</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
        <Link href="/readings" className="btn btn-primary btn-sm">All readings</Link>
        <Link href="/readings?day=sunday" className="btn btn-light btn-sm">This Sunday</Link>
      </div>
    </div>
  );
}

export function HomeWordFallback() {
  return <div className="word-card"><span className="eyebrow">Today’s Gospel</span><p className="muted">Loading today’s readings…</p></div>;
}
