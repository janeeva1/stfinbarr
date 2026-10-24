import { query } from '@/lib/db';
import PageHero from '@/components/PageHero';
import { IntentionForm } from '@/components/Forms';

export const metadata = { title: 'Mass Times' };

export default async function MassTimes() {
  const rows = await query('SELECT * FROM mass_times ORDER BY sort_order, id');
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
      <section className="section soft" id="intention">
        <div className="container welcome">
          <div>
            <span className="eyebrow">Mass Intentions</span>
            <h2>Have a Mass offered for your intention</h2>
            <p className="muted">You may request a Mass for thanksgiving, for the sick, for a special intention, or for the repose of the soul of a loved one. The parish office will confirm the date and time with you.</p>
            <div className="panel" style={{ marginTop: 20 }}>
              <h3>Sacraments</h3>
              <p className="muted" style={{ margin: 0 }}>For Baptism, Marriage, Confirmation or Anointing of the Sick, please contact the parish office during office hours to make arrangements.</p>
            </div>
          </div>
          <div className="panel"><IntentionForm /></div>
        </div>
      </section>
    </>
  );
}
