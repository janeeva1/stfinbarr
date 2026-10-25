import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function getSessionId(req) {
  const h = req.headers.get('cookie') || '';
  const m = h.match(/chat_sid=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function GET(req) {
  const sid = getSessionId(req);
  if (!sid) return NextResponse.json({ messages: [] });
  const chat = await query('SELECT id FROM chats WHERE session_id=$1', [sid]);
  if (!chat[0]) return NextResponse.json({ messages: [], chatId: null });
  const msgs = await query('SELECT id, sender, message, created_at FROM chat_messages WHERE chat_id=$1 ORDER BY id ASC', [chat[0].id]);
  return NextResponse.json({ chatId: chat[0].id, messages: msgs });
}

export async function POST(req) {
  const b = await req.json();
  let sid = getSessionId(req);
  const res = NextResponse.json({ ok: true });
  if (!sid) {
    sid = 'c_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    res.cookies.set('chat_sid', sid, { httpOnly: false, sameSite: 'lax', path: '/' });
  }
  const name = b.name || 'Visitor';
  const email = b.email || null;
  const phone = b.phone || null;
  const message = String(b.message || '').trim().slice(0, 2000);
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });
  let chat = await query('SELECT id FROM chats WHERE session_id=$1', [sid]);
  if (!chat[0]) {
    const c = await query('INSERT INTO chats (session_id, name, email, phone) VALUES ($1,$2,$3,$4) RETURNING id', [sid, name, email, phone]);
    chat = c;
  } else {
    await query('UPDATE chats SET name=COALESCE($2,name), email=COALESCE($3,email), phone=COALESCE($4,phone), last_message_at=now() WHERE id=$1', [chat[0].id, name, email, phone]);
  }
  await query('INSERT INTO chat_messages (chat_id, sender, message) VALUES ($1,$2,$3)', [chat[0].id, 'user', message]);
  await query('UPDATE chats SET last_message_at=now() WHERE id=$1', [chat[0].id]);
  return res;
}
