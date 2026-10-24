import { getSettings } from '@/lib/settings';
import PageHero from '@/components/PageHero';
import { ContactForm } from '@/components/Forms';

export const metadata = { title: 'Contact' };

export default async function Contact({ searchParams }) {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Contact & Prayer Requests" text="We would love to hear from you. Send a message, a prayer intention, or come and visit." banner="banner_contact" />
      <section className="section">
        <div className="container welcome" style={{ alignItems: 'start' }}>
          <div>
            <span className="eyebrow">Parish Office</span><h2>Get in touch</h2>
            <ul className="info-list" style={{ margin: '24px 0 32px' }}>
              <li><span className="ic">📍</span><div><b>Address</b>{s.address}</div></li>
              <li><span className="ic">📞</span><div><b>Phone</b>{s.phone}</div></li>
              <li><span className="ic">✉️</span><div><b>Email</b>{s.email}</div></li>
              <li><span className="ic">🕘</span><div><b>Office hours</b><span style={{ whiteSpace: 'pre-line' }}>{s.office_hours}</span></div></li>
            </ul>
            {s.map_embed && <iframe src={s.map_embed} title="Map" style={{ width: '100%', height: 300, border: 0, borderRadius: 14 }} loading="lazy" />}
          </div>
          <div className="panel"><h3>Send us a message</h3><ContactForm defaultType={searchParams?.type || 'Contact'} /></div>
        </div>
      </section>
    </>
  );
}
