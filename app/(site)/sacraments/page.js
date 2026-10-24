import { query } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';
import { SacramentForm } from '@/components/Forms';

export const metadata = { title: 'Sacraments' };

const lines = (t) => (t || '').split('\n').map((l) => l.replace(/^\s*[•\-*]\s*/, '').trim()).filter(Boolean);

export default async function Sacraments({ searchParams }) {
  const s = await getSettings();
  const list = await query('SELECT * FROM sacrament_info ORDER BY sort_order, id');
  const open = list.filter((x) => x.registration_open).map((x) => x.name);
  return (
    <>
      <PageHero title="Sacraments" text={s.sacraments_intro} banner="banner_mass" />
      <section className="section">
        <div className="container">
          <nav className="reading-jump" style={{ marginBottom: 32 }}>{list.map((x) => <a key={x.id} href={`#s${x.id}`}>{x.name}</a>)}<a href="#register">Register</a></nav>
          <div className="sacraments">
            {list.map((x, k) => (
              <article key={x.id} id={`s${x.id}`} className="sacrament">
                {x.image && <div className="sac-img"><Img src={x.image} alt="" seed={k} /></div>}
                <div>
                  <h2>{x.name}</h2>
                  <p className="muted" style={{ fontSize: 17 }}>{x.summary}</p>
                  <div className="sac-cols">
                    {lines(x.requirements).length > 0 && <div><h4>What you need</h4><ul className="ticks">{lines(x.requirements).map((l) => <li key={l}>{l}</li>)}</ul></div>}
                    {x.preparation && <div><h4>Preparation</h4><p>{x.preparation}</p></div>}
                    {x.how_to_register && <div><h4>How to register</h4><p>{x.how_to_register}</p></div>}
                  </div>
                  {x.registration_open && <a href={`/sacraments?s=${encodeURIComponent(x.name)}#register`} className="btn btn-outline btn-sm">Register for {x.name}</a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {open.length > 0 && (
        <section className="section soft" id="register">
          <div className="container welcome" style={{ alignItems: 'start' }}>
            <div>
              <span className="eyebrow">Sacramental registration</span>
              <h2>Register with the parish office</h2>
              <p className="muted">Send your details and the parish office will contact you about the next preparation class and the documents to bring. You can also visit the office during office hours.</p>
              <p className="muted" style={{ whiteSpace: 'pre-line' }}>🕘 {s.office_hours}<br />📞 {s.phone}</p>
            </div>
            <div className="panel"><SacramentForm options={open} initial={searchParams?.s} /></div>
          </div>
        </section>
      )}
    </>
  );
}
