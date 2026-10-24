'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadFiles } from './ImageField';

export default function BulkUpload({ albums, initial }) {
  const ref = useRef();
  const router = useRouter();
  const [album, setAlbum] = useState(initial || albums[0]?.value || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const go = async (e) => {
    if (!e.target.files.length || !album) return;
    setBusy(true);
    try {
      const urls = await uploadFiles(e.target.files);
      await fetch('/api/admin/gallery_photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(urls.map((u) => ({ album_id: album, image: u }))) });
      setMsg(`${urls.length} photo(s) added ✓`); router.refresh();
    } catch (err) { alert(err.message); }
    setBusy(false); e.target.value = '';
  };
  if (!albums.length) return null;
  return (
    <div className="a-card" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
      <b>Upload many photos at once to</b>
      <select className="input" style={{ width: 'auto' }} value={album} onChange={(e) => setAlbum(e.target.value)}>{albums.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select>
      <button className="btn btn-primary btn-sm" onClick={() => ref.current.click()} disabled={busy}>{busy ? 'Uploading…' : '⬆ Choose photos'}</button>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={go} />
      {msg && <span className="alert ok">{msg}</span>}
    </div>
  );
}
