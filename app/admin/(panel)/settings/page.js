import { getSettings, THEME_PRESETS, FONTS } from '@/lib/settings';
import SettingsForm from '@/components/admin/SettingsForm';
import { getUser } from '@/lib/auth';
import { canManageSettings } from '@/lib/resources';

export default async function Settings({ searchParams }) {
  const user = await getUser();
  if (!canManageSettings(user.role)) return <div className="a-card"><h2>No access</h2><p className="muted">Only the administrator or Parish Priest can change settings.</p></div>;
  const s = await getSettings();
  return (
    <>
      <div className="topline"><div><h1>🎨 Settings & Theme</h1><p className="muted" style={{ margin: 0 }}>Change the website colours, fonts, parish details and page content.</p></div></div>
      <SettingsForm initial={s} presets={THEME_PRESETS} fonts={FONTS} initialTab={searchParams?.tab} />
    </>
  );
}
