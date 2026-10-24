import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { one } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

// Block an address/email for 15 minutes after 5 wrong passwords
const attempts = new Map();
const WINDOW = 15 * 60 * 1000;

export async function POST(req) {
  const { email, password } = await req.json();
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  const key = `${ip}|${String(email || '').toLowerCase()}`;
  const a = attempts.get(key);
  if (a && a.count >= 5 && Date.now() - a.first < WINDOW) {
    const mins = Math.ceil((WINDOW - (Date.now() - a.first)) / 60000);
    return NextResponse.json({ error: `Too many failed attempts. Please wait ${mins} minute(s) and try again.` }, { status: 429 });
  }
  const u = await one('SELECT * FROM users WHERE lower(email)=lower($1)', [email || '']);
  if (!u || !(await bcrypt.compare(password || '', u.password_hash))) {
    const cur = a && Date.now() - a.first < WINDOW ? a : { count: 0, first: Date.now() };
    cur.count += 1; attempts.set(key, cur);
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
  }
  attempts.delete(key);
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, u.id);
  return res;
}
