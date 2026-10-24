import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createRow, listRows } from '@/lib/crud';

export async function GET(req, { params }) {
  if (!(await getUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  try { return NextResponse.json(await listRows(params.resource, { q: sp.get('q') || '', page: Number(sp.get('page') || 1) })); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

export async function POST(req, { params }) {
  if (!(await getUser())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (Array.isArray(body)) { for (const b of body) await createRow(params.resource, b); return NextResponse.json({ ok: true }); }
    return NextResponse.json(await createRow(params.resource, body));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
