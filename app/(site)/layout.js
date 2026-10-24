import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveBar from '@/components/LiveBar';
import Tracker from '@/components/Tracker';
import { getSettings } from '@/lib/settings';
import { query } from '@/lib/db';

export default async function SiteLayout({ children }) {
  const [s, mass] = await Promise.all([
    getSettings(),
    query("SELECT * FROM mass_times WHERE category='Mass' OR category IS NULL ORDER BY sort_order, id"),
  ]);
  return (
    <>
      <LiveBar s={s} />
      <Header s={s} />
      <Tracker />
      <main>{children}</main>
      <Footer s={s} mass={mass} />
    </>
  );
}
