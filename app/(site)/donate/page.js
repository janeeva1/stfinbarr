import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import PageHero from '@/components/PageHero';

export const metadata = { title: 'Give' };

export default async function Donate() {
  const s = await getSettings();
  const ways = [['⛪', 'Sunday Offertory', 'Support the daily life and liturgy of the parish.'], ['🏗️', 'Building Fund', 'Help us maintain and beautify the house of God.'], ['🍞', 'Charity & Outreach', 'Feed the hungry and care for the sick and poor.'], ['🙌', 'Tithe & Thanksgiving', 'Return a portion of your blessings to the Lord.']];
  return (
    <>
      <PageHero title="Give to the Parish" text={s.donate_text} banner="banner_donate" />
      <section className="section">
        <div className="container">
          <div className="tiles" style={{ marginBottom: 48 }}>
            {ways.map(([i, t, d]) => <div key={t} className="tile"><div className="ic">{i}</div><h3>{t}</h3><p>{d}</p></div>)}
          </div>
          <div className="cta-band">
            <div style={{ minWidth: 0 }}><span className="eyebrow">Bank Transfer</span><h2>Parish account details</h2><p style={{ whiteSpace: 'pre-line', fontSize: 18, wordBreak: 'break-word' }}>{s.bank_details}</p></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p>After giving, you may send us a note so we can acknowledge your gift and pray for your intentions.</p>
              <Link href="/contact" className="btn btn-accent">Notify the Parish Office</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
