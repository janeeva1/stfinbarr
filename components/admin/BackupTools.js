'use client';
import { useState } from 'react';

export default function BackupTools() {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const restore = async (e) => {
    e.preventDefault();
    const file = e.currentTarget.file.files[0];
    if (!file) return;
    if (!confirm('Restoring REPLACES everything currently on the website and in the parish records with the contents of this backup. Continue?')) return;
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/admin/backup', { method: 'POST', body: fd });
    const j = await r.json();
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: `Restored ${Object.values(j.counts).reduce((a, b) => a + b, 0)} records. Please sign in again if asked.` } : { ok: false, text: j.error });
  };
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="a-card">
        <h3>Download a backup</h3>
        <p className="muted">Saves everything — website content, settings, parish records, users and (optionally) uploaded images — into one file. Keep it somewhere safe, e.g. Google Drive. Recommended: once a month and before big changes.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/api/admin/backup" className="btn btn-primary">⬇ Full backup (with images)</a>
          <a href="/api/admin/backup?images=0" className="btn btn-light">⬇ Records only (smaller)</a>
        </div>
      </div>
      <div className="a-card">
        <h3>Restore from a backup</h3>
        <p className="muted">Replaces all current data with the backup file. Use this only to recover from a problem.</p>
        <form onSubmit={restore} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="file" name="file" accept=".json,application/json" className="input" style={{ width: 'auto' }} required />
          <button className="btn btn-danger" disabled={busy}>{busy ? 'Restoring…' : 'Restore backup'}</button>
        </form>
        {msg && <div className={`alert ${msg.ok ? 'ok' : 'err'}`} style={{ marginTop: 12 }}>{msg.text}</div>}
      </div>
      <div className="a-card">
        <h3>Export lists to Excel</h3>
        <p className="muted" style={{ margin: 0 }}>Every list in the admin (parishioners, donations, sacramental register, etc.) has an <b>⬇ Export CSV</b> button that opens in Excel or Google Sheets.</p>
      </div>
    </div>
  );
}
