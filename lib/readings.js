// Daily Mass readings.
// 1) A parish-entered reading for the date (Admin → Mass Readings) always wins.
// 2) Otherwise readings are fetched automatically from the Evangelizo.org reader feed
//    (Roman calendar, English) and cached in the database, so each day is fetched only once.
import { one, query } from './db';

const FEEDS = process.env.READINGS_FEED_URL ? [process.env.READINGS_FEED_URL] : ['https://feed.evangelizo.org/v2/reader.php', 'http://feed.evangelizo.org/v2/reader.php'];
const PARTS = [['FR', 'first'], ['PS', 'psalm'], ['SR', 'second'], ['GSP', 'gospel']];
const failures = new Map(); // date -> time of last failure (avoid hammering the feed)

// Today's date in Nigeria (servers usually run on UTC)
export function todayLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date());
}
export function addDays(date, n) {
  const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function nextSunday(date = todayLocal()) {
  const dow = new Date(date + 'T12:00:00Z').getUTCDay();
  return addDays(date, dow === 0 ? 0 : 7 - dow);
}
export function usccbLink(date) {
  const [y, m, d] = date.split('-');
  return `https://bible.usccb.org/bible/readings/${m}${d}${y.slice(2)}.cfm`;
}

// Keep only harmless formatting from the feed
function clean(html = '') {
  return String(html)
    .replace(/<\s*(script|style|iframe)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<(?!\/?(br|p|i|b|em|strong)\b)[^>]*>/gi, '')
    .replace(/<(br|p|i|b|em|strong)\b[^>]*>/gi, '<$1>')
    .replace(/(<br>\s*){3,}/g, '<br><br>')
    .trim();
}
const toText = (html = '') => clean(html).replace(/<br>/g, '\n').replace(/<\/?[^>]+>/g, '').trim();

let feedIndex = 0; // remembers which address (https/http) worked
async function get(params) {
  let lastErr;
  for (let i = 0; i < FEEDS.length; i++) {
    const feed = FEEDS[(feedIndex + i) % FEEDS.length];
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(`${feed}?${new URLSearchParams({ lang: 'AM', ...params })}`, { signal: ctl.signal, cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      feedIndex = (feedIndex + i) % FEEDS.length;
      return (await r.text()).trim();
    } catch (e) { lastErr = e; } finally { clearTimeout(t); }
  }
  throw lastErr;
}

async function fetchFeed(date) {
  const ymd = date.replace(/-/g, '');
  const tasks = [get({ date: ymd, type: 'liturgic_t' }), get({ date: ymd, type: 'saint' })];
  for (const [code] of PARTS) {
    tasks.push(get({ date: ymd, type: 'reading_st', content: code }), get({ date: ymd, type: 'reading_lt', content: code }), get({ date: ymd, type: 'reading', content: code }));
  }
  const res = await Promise.all(tasks);
  const data = { date, liturgical_day: toText(res[0]), saint: toText(res[1]), source: 'evangelizo' };
  PARTS.forEach(([, key], i) => {
    const [ref, title, text] = res.slice(2 + i * 3, 5 + i * 3);
    data[key] = text ? { ref: toText(ref), title: toText(title), html: clean(text) } : null;
  });
  if (!data.gospel) throw new Error('No readings returned');
  return data;
}

export async function getReadings(date) {
  const manual = await one('SELECT * FROM readings WHERE date=$1', [date]);
  if (manual) {
    const part = (ref, text) => (ref || text ? { ref: ref || '', title: '', html: (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>') } : null);
    return {
      date, source: 'parish', liturgical_day: manual.liturgical_day || '', notes: manual.notes || '',
      first: part(manual.first_ref, manual.first_text), psalm: part(manual.psalm_ref, manual.psalm_text),
      second: part(manual.second_ref, manual.second_text), gospel: part(manual.gospel_ref, manual.gospel_text),
    };
  }
  const cached = await one('SELECT data FROM readings_cache WHERE date=$1', [date]);
  if (cached) return cached.data;

  const diff = Math.abs((new Date(date) - new Date(todayLocal())) / 86400000);
  if (diff > 29) return { date, error: 'Automatic readings are available for 30 days before and after today.' };
  if (Date.now() - (failures.get(date) || 0) < 10 * 60 * 1000) return { date, error: 'The readings service is not responding right now.' };
  try {
    const data = await fetchFeed(date);
    await query('INSERT INTO readings_cache (date, data) VALUES ($1,$2) ON CONFLICT (date) DO UPDATE SET data=EXCLUDED.data, fetched_at=now()', [date, data]);
    return data;
  } catch (e) {
    failures.set(date, Date.now());
    console.warn('Readings fetch failed for', date, e.message);
    return { date, error: 'The readings service is not responding right now.' };
  }
}
