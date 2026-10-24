import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(req) {
  if (!(await getUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  for (const [k, v] of Object.entries(body)) {
    if (!/^[a-z_]+$/.test(k) || k.startsWith('_')) continue;
    await query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value', [k, v ?? '']);
  }
  return NextResponse.json({ ok: true });
}
