import './globals.css';
import { getSettings, themeCss, FONTS } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings().catch(() => ({}));
  return { title: { default: s.parish_name || 'Catholic Parish', template: `%s · ${s.parish_short || 'Parish'}` }, description: s.tagline };
}

export default async function RootLayout({ children }) {
  const s = await getSettings().catch(() => ({}));
  const fams = FONTS.map((f) => `family=${f.replace(/ /g, '+')}:wght@500;600;700`).join('&');
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${fams}&family=Inter:wght@400;500;600;700&display=swap`} />
        <style id="theme" dangerouslySetInnerHTML={{ __html: themeCss(s) }} />
        <link rel="icon" href={s.logo || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✝️</text></svg>"} />
      </head>
      <body>{children}</body>
    </html>
  );
}
