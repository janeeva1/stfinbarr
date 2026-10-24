import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings } from '@/lib/settings';
import { query } from '@/lib/db';

export default async function SiteLayout({ children }) {
  const s = await getSettings();
  const mass = await query("SELECT * FROM mass_times WHERE category='Mass' OR category IS NULL ORDER BY sort_order, id");
  return (
    <>
      <Header s={s} />
      <main>{children}</main>
      <Footer s={s} mass={mass} />
    </>
  );
}
