import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one } from '@/lib/db';
import { fmtDate, fmtTime } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';

export default async function Event({ params }) {
  const e = await one('SELECT * FROM events WHERE id=$1 AND published', [Number(params.id) || 0]);
  if (!e) notFound();
  return (
    <>
      <PageHero title={e.title} crumb={<><Link href="/events">Events</Link> / {e.category || 'Event'}</>} image={e.image || undefined} banner="banner_events" />
      <section className="section">
        <div className="narrow">
          {e.image && <Img src={e.image} className="article-img" alt="" />}
          <div className="panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
            <div><b className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>Date</b><div>{fmtDate(e.start_date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
            <div><b className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>Time</b><div>{fmtTime(e.start_date)}{e.end_date && ` – ${fmtTime(e.end_date)}`}</div></div>
            {e.location && <div><b className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em' }}>Venue</b><div>{e.location}</div></div>}
          </div>
          <div className="prose">{e.description}</div>
          <Link href="/events" className="btn btn-outline" style={{ marginTop: 30 }}>← Back to events</Link>
        </div>
      </section>
    </>
  );
}
