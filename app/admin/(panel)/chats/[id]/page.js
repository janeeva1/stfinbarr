import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { canAccess } from '@/lib/resources';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ChatThread({ params }) {
  const user = await getUser();
  if (!user) return null;
  if (!canAccess(user.role, 'chats')) return <div className="a-card"><h2>No access</h2></div>;
  const id = Number(params.id);
  const chat = (await query('SELECT * FROM chats WHERE id=$1', [id]))[0];
  if (!chat) notFound();
  const msgs = await query('SELECT * FROM chat_messages WHERE chat_id=$1 ORDER BY id ASC', [id]);

  return (
    <>
      <div className="topline">
        <div>
          <h1>💬 Chat with {chat.name || 'Visitor'}</h1>
          <p className="muted" style={{ margin: 0 }}>{chat.phone ? `📞 ${chat.phone}` : ''} {chat.email ? ` • ✉️ ${chat.email}` : ''}</p>
        </div>
        <Link href="/admin/chats" className="btn btn-light">← Back to chats</Link>
      </div>
      <div className="a-card" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto', padding: 10, background: '#f7f7f7', borderRadius: 8 }}>
          {(msgs || []).map((m) => (
            <div key={m.id} style={{ alignSelf: m.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ padding: '8px 12px', borderRadius: 12, background: m.sender === 'admin' ? 'var(--primary)' : '#e9e9e9', color: m.sender === 'admin' ? '#fff' : '#000', whiteSpace: 'pre-wrap', fontSize: 14 }}>{m.message}</div>
              <div style={{ fontSize: 11, color: '#888', textAlign: m.sender === 'admin' ? 'right' : 'left', marginTop: 2 }}>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
            </div>
          ))}
        </div>
        <form action={`/api/admin/chats/${id}`} method="post" style={{ display: 'flex', gap: 10, marginTop: 12 }} onSubmit={async (e) => { e.preventDefault(); const f = e.target; const input = f.message; const val = input.value.trim(); if (!val) return; await fetch(f.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: val }) }); input.value = ''; window.location.reload(); }}>
          <input name="message" className="input" placeholder="Type your reply..." autoComplete="off" />
          <button className="btn btn-primary">Send Reply</button>
        </form>
      </div>
    </>
  );
}
