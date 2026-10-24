import { getSettings } from '@/lib/settings';
import PageHero from '@/components/PageHero';

export const metadata = { title: 'Privacy Notice' };

export default async function Privacy() {
  const s = await getSettings();
  const blocks = (s.privacy_text || '').split(/\n\s*\n/);
  return (
    <>
      <PageHero title="Privacy Notice" text="How we look after your personal information." banner="banner_contact" />
      <section className="section">
        <div className="narrow privacy">
          {blocks.map((b, i) => {
            const [first, ...rest] = b.split('\n');
            const isHeading = rest.length > 0 && first.length < 60 && !first.endsWith('.');
            return isHeading
              ? <div key={i}><h3>{first}</h3><p className="prose">{rest.join('\n')}</p></div>
              : <p key={i} className="prose">{b}</p>;
          })}
          <p className="muted" style={{ fontSize: 14, marginTop: 30 }}>Contact: {s.email} · {s.phone} · {s.address}</p>
        </div>
      </section>
    </>
  );
}
