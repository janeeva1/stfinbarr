import Link from 'next/link';
import { getReadings, todayLocal, nextSunday, addDays, usccbLink } from '@/lib/readings';
import PageHero from '@/components/PageHero';

export const metadata = { title: 'Daily Mass Readings' };

const LABELS = { first: 'First Reading', psalm: 'Responsorial Psalm', second: 'Second Reading', gospel: 'Gospel' };
const fmt = (d, o) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { timeZone: 'UTC', ...o });

export default async function Readings({ searchParams }) {
  const today = todayLocal();
  const sunday = nextSunday(today);
  let date = searchParams?.day === 'sunday' ? sunday : (/^\d{4}-\d{2}-\d{2}$/.test(searchParams?.date || '') ? searchParams.date : today);
  const r = await getReadings(date);
  const isSunday = new Date(date + 'T12:00:00Z').getUTCDay() === 0;
  const parts = ['first', 'psalm', 'second', 'gospel'].filter((k) => r[k]);

  return (
    <>
      <PageHero title={isSunday ? 'Sunday Mass Readings' : 'Daily Mass Readings'} text="Prepare for Mass and pray with the Word of God each day." banner="banner_mass" crumbTitle="Mass Readings" />
      <section className="section">
        <div className="narrow">
          <div className="tabs" style={{ justifyContent: 'center' }}>
            <Link href="/readings" className={date === today ? 'on' : ''}>Today</Link>
            <Link href="/readings?day=sunday" className={date === sunday && date !== today ? 'on' : ''}>This Sunday</Link>
          </div>
          <div className="date-nav">
            <Link href={`/readings?date=${addDays(date, -1)}`} className="btn btn-light btn-sm">‹ Previous day</Link>
            <form className="date-pick"><input type="date" name="date" defaultValue={date} className="input" /><button className="btn btn-primary btn-sm">Go</button></form>
            <Link href={`/readings?date=${addDays(date, 1)}`} className="btn btn-light btn-sm">Next day ›</Link>
          </div>

          <div className="readings-head">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>{fmt(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {r.liturgical_day && <h2>{r.liturgical_day}</h2>}
            {r.saint && <p className="muted">{r.saint}</p>}
            {r.notes && <div className="alert info" style={{ textAlign: 'left' }}>{r.notes}</div>}
          </div>

          {r.error ? (
            <div className="empty">
              <p>{r.error}</p>
              <a href={usccbLink(date)} target="_blank" rel="noreferrer" className="btn btn-primary">Read today’s readings on USCCB ↗</a>
            </div>
          ) : (
            <>
              <nav className="reading-jump">{parts.map((k) => <a key={k} href={`#${k}`}>{LABELS[k]}</a>)}</nav>
              {parts.map((k) => (
                <article key={k} id={k} className={`reading ${k === 'gospel' ? 'gospel' : ''}`}>
                  <header><span>{LABELS[k]}</span>{r[k].ref && <b>{r[k].ref}</b>}</header>
                  {r[k].title && <p className="reading-title">{r[k].title}</p>}
                  <div className="reading-text" dangerouslySetInnerHTML={{ __html: r[k].html }} />
                  {k !== 'psalm' && <p className="reading-end">{k === 'gospel' ? 'The Gospel of the Lord. — Praise to you, Lord Jesus Christ.' : 'The word of the Lord. — Thanks be to God.'}</p>}
                </article>
              ))}
              <p className="muted center" style={{ fontSize: 13, marginTop: 30 }}>
                {r.source === 'parish' ? 'Readings provided by the parish.' : <>Readings from the Lectionary for Mass, courtesy of <a href="https://evangelizo.org" target="_blank" rel="noreferrer">Evangelizo.org</a>.</>}{' '}
                Also available on <a href={usccbLink(date)} target="_blank" rel="noreferrer">USCCB</a>.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
