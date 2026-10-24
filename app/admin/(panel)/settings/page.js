import { getSettings, THEME_PRESETS, FONTS } from '@/lib/settings';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function Settings() {
  const s = await getSettings();
  return (
    <>
      <div className="topline"><div><h1>🎨 Settings & Theme</h1><p className="muted" style={{ margin: 0 }}>Change the website colours, fonts, parish details and page content.</p></div></div>
      <SettingsForm initial={s} presets={THEME_PRESETS} fonts={FONTS} />
    </>
  );
}
