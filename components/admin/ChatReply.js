'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatReply({ chatId }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  async function send(e) {
    e.preventDefault();
    const message = value.trim();
    if (!message || sending) return;
    setSending(true);
    try {
      const r = await fetch(`/api/admin/chats/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (r.ok) {
        setValue('');
        router.refresh();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={send} style={{ display: 'flex', gap: 10, marginTop: 12 }}>
      <input
        name="message"
        className="input"
        placeholder="Type your reply..."
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send Reply'}</button>
    </form>
  );
}
