import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one } from '@/lib/db';
import { fmtDate, fmtTime } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';
import ItemPager from '@/components/ItemPager';

export default async function Event({ params }) {
  const e = await one('SELECT * FROM events WHERE id=$1 AND published', [Number(params.id) || 0]);
  if (!e) notFound();
  // neighbouring events by date
  const [prev, next] = await Promise.all([
    one('SELECT id, title FROM events WHERE published AND (start_date, id) < ($1, $2) ORDER BY start_date DESC, id DESC LIMIT 1', [e.start_date, e.id]),
    one('SELECT id, title FROM events WHERE published AND (start_date, id) > ($1, $2) ORDER BY start_date, id LIMIT 1', [e.start_date, e.id]),
  ]);
  return (
    <>
      <PageHero title={e.title} image={e.image || undefined} banner="banner_events" />
      <section className="section">
        <div className="narrow">
          {e.image && <Img src={e.image} className="article-img" alt="" />}
          <div className="panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
            <div><b className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>Date</b><div>{fmtDate(e.start_date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
            <div><b className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>Time</b><div>{fmtTime(e.start_date)}{e.end_date && ` – ${fmtTime(e.end_date)}`}</div></div>
            {e.location && <div><b className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>Venue</b><div>{e.location}</div></div>}
          </div>
          <div className="prose">{e.description}</div>
          <ItemPager prev={prev && { href: `/events/${prev.id}`, title: prev.title }} next={next && { href: `/events/${next.id}`, title: next.title }}
            all={{ href: '/events', label: 'All events' }} prevLabel="Earlier event" nextLabel="Later event" />
        </div>
      </section>
    </>
  );
}
