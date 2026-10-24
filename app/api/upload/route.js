import { NextResponse } from 'next/server';
import path from 'node:path';
import crypto from 'node:crypto';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';

// Images are stored in the database, so they survive redeploys on hosts
// without a permanent disk (e.g. Render free plan).
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif' };
const MAX = 10 * 1024 * 1024;

export async function POST(req) {
  if (!(await getUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const urls = [];
  for (const file of form.getAll('file')) {
    if (!file || typeof file === 'string') continue;
    const ext = path.extname(file.name || '').toLowerCase() || '.jpg';
    const mime = TYPES[ext];
    if (!mime) return NextResponse.json({ error: 'Only image files are allowed (jpg, png, webp, gif, svg)' }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: `${file.name} is larger than 10 MB` }, { status: 400 });
    const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await query('INSERT INTO uploads (name, mime, size, data) VALUES ($1,$2,$3,$4)', [name, mime, buf.length, buf]);
    urls.push(`/uploads/${name}`);
  }
  return NextResponse.json({ urls, url: urls[0] });
}
