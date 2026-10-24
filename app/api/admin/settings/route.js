import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { canManageSettings } from '@/lib/resources';

export async function PUT(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in again' }, { status: 401 });
  if (!canManageSettings(user.role)) return NextResponse.json({ error: 'Only the administrator or Parish Priest can change settings' }, { status: 403 });
  const body = await req.json();
  for (const [k, v] of Object.entries(body)) {
    if (!/^[a-z_]+$/.test(k) || k.startsWith('_')) continue;
    await query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value', [k, v ?? '']);
  }
  return NextResponse.json({ ok: true });
}
