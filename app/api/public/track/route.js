import { query } from '@/lib/db';
import { todayLocal } from '@/lib/readings';

const BOT = /bot|crawl|spider|slurp|preview|monitor|uptime|headless|lighthouse/i;

export async function POST(req) {
  try {
    if (BOT.test(req.headers.get('user-agent') || '')) return new Response(null, { status: 204 });
    const { path } = await req.json();
    const p = String(path || '/').split('?')[0].slice(0, 120);
    if (!p.startsWith('/') || p.startsWith('/admin') || p.startsWith('/api')) return new Response(null, { status: 204 });
    // group detail pages (e.g. /events/12 -> /events/…)
    const key = p.replace(/^\/(events|news|gallery)\/\d+$/, '/$1/…');
    await query('INSERT INTO page_views (day, path, views) VALUES ($1,$2,1) ON CONFLICT (day, path) DO UPDATE SET views = page_views.views + 1', [todayLocal(), key]);
  } catch {}
  return new Response(null, { status: 204 });
}
