import fs from 'node:fs/promises';
import path from 'node:path';
import { one } from '@/lib/db';

const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif' };
const CACHE = { 'Cache-Control': 'public, max-age=31536000, immutable' };

export async function GET(_req, { params }) {
  const name = path.basename(params.name);
  const row = await one('SELECT mime, data FROM uploads WHERE name=$1', [name]);
  if (row) return new Response(row.data, { headers: { 'Content-Type': row.mime, ...CACHE } });
  try { // older uploads saved on disk
    const buf = await fs.readFile(path.join(process.cwd(), 'uploads', name));
    return new Response(buf, { headers: { 'Content-Type': TYPES[path.extname(name).toLowerCase()] || 'application/octet-stream', ...CACHE } });
  } catch { return new Response('Not found', { status: 404 }); }
}
