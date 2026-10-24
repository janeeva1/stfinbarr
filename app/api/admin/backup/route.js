import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { canBackup } from '@/lib/resources';
import { makeBackup, restoreBackup } from '@/lib/backup';
import { todayLocal } from '@/lib/readings';

async function guard() {
  const user = await getUser();
  if (!user || !canBackup(user.role)) return NextResponse.json({ error: 'Only the administrator can do backups' }, { status: 403 });
  return null;
}

export async function GET(req) {
  const g = await guard(); if (g) return g;
  const images = new URL(req.url).searchParams.get('images') !== '0';
  const data = await makeBackup({ images });
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="stfinbarr-backup-${todayLocal()}${images ? '' : '-no-images'}.json"` },
  });
}

export async function POST(req) {
  const g = await guard(); if (g) return g;
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') throw new Error('Choose a backup file');
    const counts = await restoreBackup(JSON.parse(await file.text()));
    return NextResponse.json({ ok: true, counts });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
