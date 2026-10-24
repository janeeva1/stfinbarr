import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  const b = await req.json();
  if (!b.message || String(b.message).trim().length < 2) return NextResponse.json({ error: 'Please write a message' }, { status: 400 });
  const type = ['Contact', 'Prayer Request', 'Volunteer'].includes(b.type) ? b.type : 'Contact';
  await query('INSERT INTO messages (type, name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5,$6)',
    [type, b.name || 'Anonymous', b.email || null, b.phone || null, b.subject || null, String(b.message).slice(0, 5000)]);
  return NextResponse.json({ ok: true });
}
