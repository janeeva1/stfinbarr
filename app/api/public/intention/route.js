import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  const b = await req.json();
  if (!b.requested_by || !b.intention) return NextResponse.json({ error: 'Name and intention are required' }, { status: 400 });
  await query('INSERT INTO mass_intentions (requested_by, phone, email, intention_type, intention, mass_date, mass_time) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [b.requested_by, b.phone || null, b.email || null, b.intention_type || null, String(b.intention).slice(0, 2000), b.mass_date || null, b.mass_time || null]);
  return NextResponse.json({ ok: true });
}
