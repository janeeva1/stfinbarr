import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { deleteRow, getRow, updateRow } from '@/lib/crud';

const guard = async () => (await getUser()) ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(_req, { params }) {
  const g = await guard(); if (g) return g;
  return NextResponse.json(await getRow(params.resource, params.id));
}
export async function PUT(req, { params }) {
  const g = await guard(); if (g) return g;
  try { return NextResponse.json(await updateRow(params.resource, params.id, await req.json())); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
export async function DELETE(_req, { params }) {
  const g = await guard(); if (g) return g;
  try { await deleteRow(params.resource, params.id); return NextResponse.json({ ok: true }); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
