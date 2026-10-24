import { query } from '@/lib/db';
import PageHero from '@/components/PageHero';
import { IntentionForm } from '@/components/Forms';
import Link from 'next/link';
import { fmtDate } from '@/lib/format';

export const metadata = { title: 'Mass Times' };

export default async function MassTimes() {
  const [rows, feasts] = await Promise.all([
    query('SELECT * FROM mass_times ORDER BY sort_order, id'),
    query("SELECT * FROM celebrations WHERE published AND COALESCE(end_date, date) >= CURRENT_DATE ORDER BY date LIMIT 12"),
  ]);
  const groups = {};
  for (const r of rows) (groups[r.category || 'Mass'] ||= []).push(r);
  return (
    <>
      <PageHero title="Mass & Sacraments" text="The Eucharist is the source and summit of the Christian life. Come and worship with us." banner="banner_mass" />
      <section className="section">
        <div className="container" style={{ display: 'grid', gap: 28 }}>
          {Object.entries(groups).map(([cat, list]) => (
            <div key={cat} className="schedule">
              <div className="schedule-head">✠ {cat === 'Mass' ? 'Holy Mass' : cat}</div>
              {list.map((m) => (
                <div className="schedule-row" key={m.id}>
                  <span className="d">{m.day}</span><span className="t">{m.time}</span>
                  <span>{m.title}{m.language && <span className="muted"> · {m.language}</span>}{m.notes && <span className="muted"> · {m.notes}</span>}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="section soft" id="holy-days">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Liturgical calendar</span><h2>Holy Days, Feasts & Novenas</h2></div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link href="/readings" className="btn btn-light btn-sm">📜 Today’s readings</Link><Link href="/live" className="btn btn-light btn-sm">📺 Watch live</Link></div>
          </div>
          {feasts.length ? (
            <div className="feast-list">
              {feasts.map((f) => (
                <div key={f.id} className={`feast ${f.kind === 'Holy Day of Obligation' ? 'obligation' : ''}`}>
                  <div className="when"><b>{fmtDate(f.date, { day: 'numeric' })}</b><small>{fmtDate(f.date, { month: 'short' })}</small></div>
                  <div style={{ flex: 1 }}>
                    <span className="tag">{f.kind}</span>
                    <h3 style={{ fontSize: '1.35rem', margin: '0 0 4px' }}>{f.title}</h3>
                    <div className="muted" style={{ fontSize: 14 }}>
                      {fmtDate(f.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}{f.end_date && ` – ${fmtDate(f.end_date, { weekday: 'long', day: 'numeric', month: 'long' })}`}
                    </div>
                    {f.mass_times && <div style={{ fontWeight: 600, color: 'var(--primary)', marginTop: 4 }}>⛪ {f.mass_times}</div>}
                    {f.description && <p style={{ margin: '6px 0 0', fontSize: 15 }} className="muted">{f.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty">Upcoming holy days and feasts will be listed here.</div>}
        </div>
      </section>
      <section className="section" id="intention">
        <div className="container welcome">
          <div>
            <span className="eyebrow">Mass Intentions</span>
            <h2>Have a Mass offered for your intention</h2>
            <p className="muted">You may request a Mass for thanksgiving, for the sick, for a special intention, or for the repose of the soul of a loved one. The parish office will confirm the date and time with you.</p>
            <div className="panel" style={{ marginTop: 20 }}>
              <h3>Sacraments</h3>
              <p className="muted">Preparing for Baptism, First Holy Communion, Confirmation or Marriage? See the requirements and register online.</p>
              <Link href="/sacraments" className="btn btn-outline btn-sm">Sacraments & registration →</Link>
            </div>
          </div>
          <div className="panel"><IntentionForm /></div>
        </div>
      </section>
    </>
  );
}
