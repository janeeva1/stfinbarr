import Link from 'next/link';
import { query } from '@/lib/db';
import { fmtDate, fmtTime, excerpt } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';

export const metadata = { title: 'Events' };

export default async function Events({ searchParams }) {
  const past = searchParams?.when === 'past';
  const events = await query(`SELECT * FROM events WHERE published AND start_date ${past ? '<' : '>='} now() - interval '1 day' ORDER BY start_date ${past ? 'DESC' : 'ASC'}`);
  return (
    <>
      <PageHero title="Parish Events" text="Celebrations, retreats, outreach and fellowship — there is always something happening at the parish." banner="banner_events" />
      <section className="section">
        <div className="container">
          <div className="tabs"><Link href="/events" className={!past ? 'on' : ''}>Upcoming</Link><Link href="/events?when=past" className={past ? 'on' : ''}>Past events</Link></div>
          {events.length ? (
            <div className="grid g3">
              {events.map((e, k) => (
                <Link key={e.id} href={`/events/${e.id}`} className="card">
                  <div className="thumb"><Img src={e.image} alt={e.title} seed={k} />
                    <div className="date-badge"><b>{new Date(e.start_date).getDate()}</b><small>{fmtDate(e.start_date, { month: 'short', year: 'numeric' })}</small></div>
                  </div>
                  <div className="body">
                    {e.category && <span className="tag">{e.category}</span>}
                    <h3>{e.title}</h3>
                    <div className="meta"><span>🕘 {fmtTime(e.start_date)}</span>{e.location && <span>📍 {e.location}</span>}</div>
                    <p>{excerpt(e.description, 130)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : <div className="empty">No {past ? 'past' : 'upcoming'} events to show.</div>}
        </div>
      </section>
    </>
  );
}
