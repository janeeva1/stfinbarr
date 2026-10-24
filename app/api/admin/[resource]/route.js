import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createRow, listRows } from '@/lib/crud';
import { canAccess } from '@/lib/resources';

async function guard(resource) {
  const user = await getUser();
  if (!user) return [null, NextResponse.json({ error: 'Please sign in again' }, { status: 401 })];
  if (!canAccess(user.role, resource)) return [null, NextResponse.json({ error: 'Your role does not have access to this section' }, { status: 403 })];
  return [user, null];
}

export async function GET(req, { params }) {
  const [, err] = await guard(params.resource); if (err) return err;
  const sp = new URL(req.url).searchParams;
  try { return NextResponse.json(await listRows(params.resource, { q: sp.get('q') || '', page: Number(sp.get('page') || 1) })); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

export async function POST(req, { params }) {
  const [user, err] = await guard(params.resource); if (err) return err;
  try {
    const body = await req.json();
    if (Array.isArray(body)) { for (const b of body) await createRow(params.resource, b, user); return NextResponse.json({ ok: true }); }
    return NextResponse.json(await createRow(params.resource, body, user));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
