import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { one } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  const u = await one('SELECT * FROM users WHERE lower(email)=lower($1)', [email || '']);
  if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, u.id);
  return res;
}
