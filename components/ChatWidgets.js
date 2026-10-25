'use client';
import { useEffect, useRef, useState } from 'react';

export default function ChatWidgets({ s }) {
  const whatsapp = s.whatsapp_number || s.phone || '';
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9+]/g, '').replace(/^\+/, '')}?text=${encodeURIComponent('Hello, I need assistance from St. Finbarr Parish.')}` : 'https://wa.me/';

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetch('/api/chat').then((r) => r.json()).then((j) => {
        setMsgs(j.messages || []);
        if ((j.messages || []).length) setStep('chat');
      });
    }
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const start = async (e) => {
    e.preventDefault();
    setSending(true);
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, message: 'Hi, I need help.' }) });
    setSending(false);
    if (r.ok) { setStep('chat'); fetch('/api/chat').then((r) => r.json()).then((j) => setMsgs(j.messages || [])); }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, message: text }) });
    setText('');
    setSending(false);
    const j = await fetch('/api/chat').then((r) => r.json());
    setMsgs(j.messages || []);
  };

  return (
    <>
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="chat-widget chat-wa" aria-label="Chat on WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.334.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.334 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>
      <button className="chat-widget chat-care" onClick={() => setOpen(!open)} aria-label="Customer Care Chat">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      </button>
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <strong>Customer Care</strong>
              <div style={{ fontSize: 12, opacity: 0.9 }}>St. Finbarr Parish</div>
            </div>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          {step === 'form' ? (
            <form className="chat-panel-body" onSubmit={start}>
              <p style={{ fontSize: 13, color: '#555' }}>Please tell us your name to start chatting with our admin.</p>
              <input className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Phone number (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <button className="btn btn-primary" disabled={sending}>{sending ? 'Starting...' : 'Start Chat'}</button>
            </form>
          ) : (
            <>
              <div className="chat-panel-messages">
                {msgs.map((m) => (
                  <div key={m.id} className={`chat-msg ${m.sender === 'user' ? 'user' : 'admin'}`}>
                    <div className="chat-bubble">{m.message}</div>
                    <div className="chat-time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form className="chat-panel-input" onSubmit={send}>
                <input className="input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
                <button className="btn btn-primary btn-sm" disabled={sending}>Send</button>
              </form>
            </>
          )}
        </div>
      )}
      <style jsx global>{`
        .chat-widget{position:fixed;bottom:20px;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:1000;border:none;cursor:pointer;text-decoration:none}
        .chat-wa{left:16px;background:#25D366}
        .chat-care{right:16px;background:var(--primary,#6d1a36)}
        .chat-panel{position:fixed;bottom:90px;right:16px;width:320px;max-width:calc(100vw - 32px);height:420px;max-height:calc(100vh - 140px);background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:1001;display:flex;flex-direction:column;overflow:hidden}
        @media (max-width: 420px){.chat-widget{width:50px;height:50px;bottom:14px}.chat-wa{left:10px}.chat-care{right:10px}.chat-panel{right:10px;bottom:76px;width:calc(100vw - 20px);height:60vh}}
        .chat-panel-header{background:var(--primary,#6d1a36);color:#fff;padding:12px 16px;display:flex;align-items:center;justify-content:space-between}
        .chat-panel-header button{background:none;border:none;color:#fff;font-size:18px;cursor:pointer}
        .chat-panel-body{padding:16px;display:flex;flex-direction:column;gap:10px;flex:1}
        .chat-panel-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;background:#f7f7f7}
        .chat-msg{display:flex;flex-direction:column;max-width:80%}
        .chat-msg.user{align-self:flex-end;align-items:flex-end}
        .chat-msg.admin{align-self:flex-start;align-items:flex-start}
        .chat-bubble{padding:8px 12px;border-radius:12px;background:#e9e9e9;font-size:14px;white-space:pre-wrap}
        .chat-msg.user .chat-bubble{background:var(--primary,#6d1a36);color:#fff;border-radius:12px 12px 0 12px}
        .chat-msg.admin .chat-bubble{border-radius:12px 12px 12px 0}
        .chat-time{font-size:11px;color:#888;margin-top:2px}
        .chat-panel-input{display:flex;gap:8px;padding:10px;border-top:1px solid #eee}
        .chat-panel-input .input{flex:1}
      `}</style>
    </>
  );
}
