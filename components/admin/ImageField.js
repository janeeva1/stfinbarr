'use client';
import { useRef, useState } from 'react';

// Shrink large photos in the browser before upload (max 1920px, JPEG ~85%),
// which keeps the database small and pages fast.
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 400 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const keepPng = file.type === 'image/png' && file.size < 1024 * 1024; // logos etc.
    const blob = await new Promise((r) => canvas.toBlob(r, keepPng ? 'image/png' : 'image/jpeg', 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, keepPng ? '.png' : '.jpg'), { type: blob.type });
  } catch { return file; }
}

export async function uploadFiles(files) {
  const fd = new FormData();
  for (const f of files) fd.append('file', await shrink(f));
  const r = await fetch('/api/upload', { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Upload failed');
  return j.urls;
}

export default function ImageField({ name, value, onChange }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    if (!e.target.files.length) return;
    setBusy(true);
    try { onChange((await uploadFiles(e.target.files))[0]); } catch (err) { alert(err.message); }
    setBusy(false);
  };
  return (
    <div className="img-field">
      {value ? <img src={value} alt="" /> : <div style={{ width: 120, height: 80, borderRadius: 8, background: '#eef0f5', display: 'grid', placeItems: 'center', color: '#9ca3af' }}>No image</div>}
      <div style={{ display: 'grid', gap: 6, flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn btn-light btn-sm" onClick={() => ref.current.click()} disabled={busy}>{busy ? 'Uploading…' : '⬆ Upload image'}</button>
          {value && <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange('')}>Remove</button>}
        </div>
        <input className="input" name={name} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" style={{ padding: '8px 10px', fontSize: 13 }} />
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  );
}
