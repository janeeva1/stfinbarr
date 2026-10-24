'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';

const GENERAL = [
  ['parish_name', 'Parish name'], ['parish_short', 'Short name (header)'], ['tagline', 'Tagline'], ['diocese', 'Diocese'],
  ['address', 'Address'], ['phone', 'Phone'], ['email', 'Email'], ['office_hours', 'Office hours', 'textarea'],
  ['currency', 'Currency symbol'], ['map_embed', 'Google Maps embed URL'], ['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['youtube', 'YouTube URL'],
];
const CONTENT = [
  ['welcome_title', 'Homepage welcome title'], ['welcome_text', 'Homepage welcome text', 'textarea'],
  ['priest_name', 'Parish Priest name'], ['priest_message', 'Message from the Parish Priest', 'textarea'], ['priest_photo', 'Parish Priest photo', 'image'],
  ['about_text', 'About the parish', 'textarea'], ['mission_text', 'Mission statement', 'textarea'], ['history_text', 'Parish history', 'textarea', 8],
  ['donate_text', 'Giving page text', 'textarea'], ['bank_details', 'Bank account details', 'textarea'],
];
const IMAGES = [
  ['logo', 'Parish logo (header, footer & browser tab) — leave empty to use the cross icon', 'image'],
  ['hero_image', 'Default banner image (used when a page has none)', 'image'],
  ['about_image', 'About page photo', 'image'],
  ['banner_about', 'Banner — About page', 'image'], ['banner_mass', 'Banner — Mass Times page', 'image'],
  ['banner_events', 'Banner — Events page', 'image'], ['banner_news', 'Banner — News page', 'image'],
  ['banner_gallery', 'Banner — Gallery page', 'image'], ['banner_ministries', 'Banner — Ministries page', 'image'],
  ['banner_contact', 'Banner — Contact page', 'image'], ['banner_donate', 'Banner — Giving page', 'image'],
];
const COLORS = [['primary_color', 'Primary colour', 'Buttons, header accents, banners'], ['accent_color', 'Accent colour', 'Gold highlights, ornaments'], ['dark_color', 'Dark colour', 'Footer, headings, admin sidebar'], ['bg_color', 'Background colour', 'Page background']];

export default function SettingsForm({ initial, presets, fonts }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [tab, setTab] = useState('theme');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const applyLive = (next) => {
    const r = document.documentElement.style;
    r.setProperty('--primary', next.primary_color); r.setProperty('--accent', next.accent_color);
    r.setProperty('--dark', next.dark_color); r.setProperty('--bg', next.bg_color);
    r.setProperty('--heading', `'${next.heading_font}', Georgia, serif`);
  };
  const set = (k, v) => setS((cur) => { const n = { ...cur, [k]: v }; if (/_color$|heading_font/.test(k)) { if (/_color$/.test(k)) n.theme_preset = 'custom'; applyLive(n); } return n; });
  const preset = (key) => setS((cur) => { const n = { ...cur, ...presets[key], theme_preset: key }; delete n.name; applyLive(n); return n; });

  const save = async () => {
    setBusy(true); setMsg('');
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    setBusy(false);
    setMsg(r.ok ? 'Saved! Your website has been updated.' : 'Could not save settings.');
    router.refresh();
  };

  const field = ([k, label, type, rows]) => (
    <label key={k} className={`f ${type ? 'full' : ''}`}>{label}
      {type === 'textarea' ? <textarea className="input" rows={rows || 3} value={s[k] || ''} onChange={(e) => set(k, e.target.value)} />
        : type === 'image' ? <ImageField value={s[k]} onChange={(v) => set(k, v)} />
        : <input className="input" value={s[k] || ''} onChange={(e) => set(k, e.target.value)} />}
    </label>
  );

  return (
    <div>
      <div className="a-tabs">
        {[['theme', '🎨 Colours & Fonts'], ['images', '🖼️ Logo & Banners'], ['general', '⛪ Parish Details'], ['content', '📝 Page Content']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {tab === 'theme' && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="a-card">
            <h3>Choose a colour theme</h3>
            <p className="muted" style={{ fontSize: 14 }}>Pick a preset — for example purple for Advent and Lent, rose for Gaudete Sunday — or set your own colours below.</p>
            <div className="swatches">
              {Object.entries(presets).map(([k, p]) => (
                <button key={k} type="button" className={`swatch ${s.theme_preset === k ? 'on' : ''}`} onClick={() => preset(k)}>
                  <div className="chips"><span style={{ background: p.primary_color }} /><span style={{ background: p.accent_color }} /><span style={{ background: p.dark_color }} /><span style={{ background: p.bg_color }} /></div>{p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="a-card">
            <h3>Custom colours</h3>
            <div className="colors">
              {COLORS.map(([k, l, h]) => (
                <label key={k} className="f">{l}<span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>{h}</span>
                  <div className="color-input"><input type="color" value={s[k] || '#000000'} onChange={(e) => set(k, e.target.value)} /><input className="input" value={s[k] || ''} onChange={(e) => set(k, e.target.value)} /></div>
                </label>
              ))}
              <label className="f">Heading font<span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>Used for titles</span>
                <select className="input" value={s.heading_font} onChange={(e) => set('heading_font', e.target.value)}>{fonts.map((f) => <option key={f}>{f}</option>)}</select>
              </label>
            </div>
          </div>
          <div className="a-card">
            <h3>Live preview</h3>
            <div className="preview-box" style={{ background: 'var(--bg)' }}>
              <div style={{ background: 'var(--dark)', color: '#fff', padding: '8px 16px', fontSize: 12 }}>{s.address}</div>
              <div style={{ background: `linear-gradient(110deg, var(--dark), var(--primary))`, color: '#fff', padding: '36px 24px' }}>
                <span className="eyebrow">{s.parish_name}</span>
                <h2 style={{ color: '#fff', margin: '0 0 14px' }}>{s.welcome_title}</h2>
                <span className="btn btn-accent btn-sm">Mass Times →</span> <span className="btn btn-ghost-light btn-sm">Plan your visit</span>
              </div>
              <div style={{ padding: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="tag" style={{ margin: 0 }}>Celebration</span><h3 style={{ margin: 0 }}>Parish Harvest & Bazaar</h3><span className="btn btn-primary btn-sm">Give Online</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === 'images' && <div className="a-card a-form"><p className="muted full" style={{ margin: 0 }}>Upload new images any time. Homepage slides, events, news, gallery, clergy and ministries each have their own image upload in their sections.</p>{IMAGES.map(field)}</div>}
      {tab === 'general' && <div className="a-card a-form">{GENERAL.map(field)}</div>}
      {tab === 'content' && <div className="a-card a-form">{CONTENT.map(field)}</div>}

      <div style={{ position: 'sticky', bottom: 0, background: '#f4f5f8', padding: '16px 0', display: 'flex', gap: 14, alignItems: 'center', marginTop: 10 }}>
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
        {msg && <span className="alert ok">{msg}</span>}
      </div>
    </div>
  );
}
