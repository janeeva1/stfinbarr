import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUser } from '@/lib/auth';
import { one, query } from '@/lib/db';
import { checkPassword } from '@/lib/crud';

export async function POST(req) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in again' }, { status: 401 });
  const { current, next } = await req.json();
  const u = await one('SELECT password_hash FROM users WHERE id=$1', [user.id]);
  if (!(await bcrypt.compare(current || '', u.password_hash))) return NextResponse.json({ error: 'Your current password is not correct' }, { status: 400 });
  try { checkPassword(next); } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
  await query('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(next, 10), user.id]);
  return NextResponse.json({ ok: true });
}
