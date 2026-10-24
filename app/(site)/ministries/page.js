import { query } from '@/lib/db';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';
import Link from 'next/link';

export const metadata = { title: 'Societies & Ministries' };

export default async function Ministries() {
  const list = await query('SELECT * FROM ministries ORDER BY name');
  return (
    <>
      <PageHero title="Societies & Ministries" text="Every gift has a place. Find a community to pray, grow and serve with." banner="banner_ministries" />
      <section className="section">
        <div className="container grid g3">
          {list.map((m, k) => (
            <div key={m.id} className="card">
              <div className="thumb"><Img src={m.image} alt={m.name} seed={k} /></div>
              <div className="body">
                <span className="tag">{m.category}</span><h3>{m.name}</h3><p>{m.description}</p>
                <div className="meta" style={{ marginTop: 'auto' }}>{m.leader && <span>👤 {m.leader}</span>}{m.meeting_time && <span>🕘 {m.meeting_time}</span>}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="container center" style={{ marginTop: 40 }}>
          <Link href="/contact?type=Volunteer" className="btn btn-primary">I would like to join a ministry</Link>
        </div>
      </section>
    </>
  );
}
