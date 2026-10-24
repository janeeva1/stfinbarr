import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { deleteRow, getRow, updateRow } from '@/lib/crud';
import { canAccess } from '@/lib/resources';

async function guard(resource) {
  const user = await getUser();
  if (!user) return [null, NextResponse.json({ error: 'Please sign in again' }, { status: 401 })];
  if (!canAccess(user.role, resource)) return [null, NextResponse.json({ error: 'Your role does not have access to this section' }, { status: 403 })];
  return [user, null];
}

export async function GET(_req, { params }) {
  const [, err] = await guard(params.resource); if (err) return err;
  return NextResponse.json(await getRow(params.resource, params.id));
}
export async function PUT(req, { params }) {
  const [user, err] = await guard(params.resource); if (err) return err;
  try { return NextResponse.json(await updateRow(params.resource, params.id, await req.json(), user)); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
export async function DELETE(_req, { params }) {
  const [, err] = await guard(params.resource); if (err) return err;
  try { await deleteRow(params.resource, params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
