import { query } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';

export const metadata = { title: 'About Us' };

export default async function About() {
  const s = await getSettings();
  const clergy = await query('SELECT * FROM clergy ORDER BY sort_order, id');
  return (
    <>
      <PageHero title="About Our Parish" text={s.tagline} banner="banner_about" />
      <section className="section">
        <div className="container welcome">
          <div>
            <span className="eyebrow">Who we are</span>
            <h2>{s.parish_name}</h2>
            <p className="prose">{s.about_text}</p>
            <div className="panel" style={{ marginTop: 24, borderLeft: '4px solid var(--accent)' }}>
              <h3>Our Mission</h3><p style={{ margin: 0 }}>{s.mission_text}</p>
            </div>
          </div>
          <div className="photo"><Img src={s.about_image || "/images/gallery-choir.jpg"} alt="" /></div>
        </div>
      </section>
      <section className="section soft">
        <div className="narrow center">
          <span className="eyebrow">Our Story</span><h2>Parish History</h2><div className="ornament" />
          <p className="prose" style={{ marginTop: 32, textAlign: 'left' }}>{s.history_text}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head center"><span className="eyebrow">Shepherds of the flock</span><h2>Our Clergy & Pastoral Team</h2><div className="ornament" /></div>
          <div className="grid g3">
            {clergy.map((c, k) => (
              <div key={c.id} className="card">
                <div className="thumb" style={{ aspectRatio: '1/1' }}><Img src={c.photo} alt={c.name} seed={k} /></div>
                <div className="body center">
                  <h3>{c.name}</h3><span className="tag" style={{ alignSelf: 'center' }}>{c.role}</span>
                  <p>{c.bio}</p>
                  {c.email && <a href={`mailto:${c.email}`} style={{ fontSize: 14 }}>{c.email}</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
