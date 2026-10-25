import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  const msgs = await query('SELECT id, sender, message, created_at FROM chat_messages WHERE chat_id=$1 ORDER BY id ASC', [id]);
  return NextResponse.json(msgs);
}

export async function POST(req, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  const b = await req.json();
  const message = String(b.message || '').trim().slice(0, 2000);
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });
  await query('INSERT INTO chat_messages (chat_id, sender, message) VALUES ($1,$2,$3)', [id, 'admin', message]);
  await query('UPDATE chats SET last_message_at=now(), status=COALESCE(status,\'Open\') WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
