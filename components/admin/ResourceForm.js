'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';

const toLocal = (v) => { if (!v) return ''; const d = new Date(v); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export default function ResourceForm({ name, res, row, options, canApprove = true }) {
  const router = useRouter();
  const isNew = !row;
  const init = {};
  for (const [k, f] of Object.entries(res.fields)) {
    let v = row?.[k];
    if (v === undefined || v === null) v = isNew && f.default !== undefined ? f.default : (f.type === 'checkbox' ? false : '');
    if (f.type === 'datetime') v = toLocal(v);
    if (f.type === 'date' && v) v = String(v).slice(0, 10);
    init[k] = v;
  }
  const [data, setData] = useState(init);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const body = { ...data };
    for (const [k, f] of Object.entries(res.fields)) if (f.type === 'datetime' && body[k]) body[k] = new Date(body[k]).toISOString();
    const r = await fetch(isNew ? `/api/admin/${name}` : `/api/admin/${name}/${row.id}`, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); setBusy(false); return; }
    router.push(`/admin/${name}`); router.refresh();
  };
  const del = async () => {
    if (!confirm(`Delete this ${res.singular.toLowerCase()}? This cannot be undone.`)) return;
    const r = await fetch(`/api/admin/${name}/${row.id}`, { method: 'DELETE' });
    if (!r.ok) return alert((await r.json()).error);
    router.push(`/admin/${name}`); router.refresh();
  };

  return (
    <form className="a-card" onSubmit={save}>
      <div className="a-form">
        {Object.entries(res.fields).filter(([, f]) => !f.hidden).map(([k, f]) => {
          const label = <>{f.label || k.replace(/_id$/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}{f.required && ' *'}{f.help && <span className="help"> — {f.help}</span>}</>;
          const full = ['textarea', 'image'].includes(f.type);
          if (f.type === 'checkbox') return <label key={k} className="check"><input type="checkbox" checked={!!data[k]} onChange={(e) => set(k, e.target.checked)} />{f.approval && !canApprove ? 'Submit for approval (the Parish Priest or administrator will publish it)' : label}</label>;
          let input;
          if (f.type === 'textarea') input = <textarea className="input" rows={f.rows || 4} value={data[k]} onChange={(e) => set(k, e.target.value)} readOnly={f.readonly} />;
          else if (f.type === 'image') input = <ImageField name={k} value={data[k]} onChange={(v) => set(k, v)} />;
          else if (f.type === 'select') input = <select className="input" value={data[k]} onChange={(e) => set(k, e.target.value)}><option value="">— Select —</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>;
          else if (f.type === 'relation') input = <select className="input" value={data[k]} onChange={(e) => set(k, e.target.value)}><option value="">— None —</option>{(options[k] || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
          else {
            const type = { date: 'date', datetime: 'datetime-local', number: 'number', money: 'number', email: 'email', password: 'password' }[f.type] || 'text';
            input = <input className="input" type={type} step={f.type === 'money' ? '0.01' : undefined} value={data[k]} onChange={(e) => set(k, e.target.value)} readOnly={f.readonly} autoComplete={f.type === 'password' ? 'new-password' : undefined} />;
          }
          return <label key={k} className={`f ${full ? 'full' : ''}`}>{label}{input}</label>;
        })}
      </div>
      {row?.status && <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>Approval status: <b>{row.status}</b></p>}
      {err && <div className="alert err" style={{ marginTop: 16 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : isNew ? `Create ${res.singular}` : 'Save changes'}</button>
          <button type="button" className="btn btn-light" onClick={() => router.back()}>Cancel</button>
        </div>
        {!isNew && <button type="button" className="btn btn-danger" onClick={del}>Delete</button>}
      </div>
    </form>
  );
}
