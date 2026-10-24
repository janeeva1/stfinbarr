import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { canManageSettings } from '@/lib/resources';
import { isHex } from '@/lib/settings';

export async function PUT(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in again' }, { status: 401 });
  if (!canManageSettings(user.role)) return NextResponse.json({ error: 'Only the administrator or Parish Priest can change settings' }, { status: 403 });
  const body = await req.json();
  for (const k of ['primary_color', 'accent_color', 'dark_color', 'bg_color']) {
    if (k in body && !isHex(body[k])) return NextResponse.json({ error: `"${body[k]}" is not a valid colour code — use the colour picker or a code like #6d1a36` }, { status: 400 });
  }
  for (const [k, v] of Object.entries(body)) {
    if (!/^[a-z_]+$/.test(k) || k.startsWith('_')) continue;
    await query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value', [k, v ?? '']);
  }
  return NextResponse.json({ ok: true });
}
