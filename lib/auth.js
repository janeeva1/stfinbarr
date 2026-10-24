import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { one } from './db';

const COOKIE = 'parish_session';
const secret = () => process.env.SESSION_SECRET || 'dev-secret-change-me';

export function signSession(userId) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verify(token) {
  if (!token) return null;
  const [id, exp, sig] = token.split('.');
  if (!id || !exp || !sig) return null;
  const good = crypto.createHmac('sha256', secret()).update(`${id}.${exp}`).digest('hex');
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  if (Number(exp) < Date.now()) return null;
  return Number(id);
}

export async function getUser() {
  const id = verify(cookies().get(COOKIE)?.value);
  if (!id) return null;
  return one('SELECT id, name, email, role FROM users WHERE id=$1', [id]);
}

export function setSessionCookie(res, userId) {
  res.cookies.set(COOKIE, signSession(userId), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
}
export function clearSessionCookie(res) {
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 });
}
