'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';

const GENERAL = [
  ['parish_name', 'Parish name'], ['parish_short', 'Short name (header)'], ['motto', 'Parish motto'], ['tagline', 'Tagline'], ['diocese', 'Diocese'],
  ['address', 'Address'], ['phone', 'Phone'], ['whatsapp_number', 'WhatsApp number (for WhatsApp widget)'], ['email', 'Email'], ['office_hours', 'Office hours', 'textarea'],
  ['currency', 'Currency symbol'], ['map_embed', 'Google Maps embed URL'], ['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['youtube', 'YouTube URL'],
];
const LIVE = [
  ['live_url', 'Live video link — paste the YouTube or Facebook link of today’s livestream'],
  ['live_title', 'Title shown while live'],
  ['youtube_channel_id', 'YouTube channel ID (optional, starts with UC…) — used if no live link is pasted'],
  ['youtube', 'YouTube channel URL'], ['facebook', 'Facebook page URL'],
  ['live_schedule_text', 'Broadcast schedule text', 'textarea'],
  ['live_offline_text', 'Message shown when not live', 'textarea'],
];
const PRIVACY = [['privacy_text', 'Privacy notice (shown at /privacy). Separate sections with a blank line; a short first line becomes a heading.', 'textarea', 24]];
const CONTENT = [
  ['patron_title', 'Patron saint — heading'], ['patron_feast', 'Patron saint — feast day'],
  ['patron_text', 'Patron saint — story', 'textarea', 6], ['patron_image', 'Patron saint — image', 'image'],
  ['sacraments_intro', 'Sacraments page introduction', 'textarea'],
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

export default function SettingsForm({ initial, presets, fonts, initialTab }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [tab, setTab] = useState(initialTab || 'theme');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Remove unsaved preview colours when leaving this page (saved colours come from the server)
  useEffect(() => () => { const r = document.documentElement.style; ['--primary', '--accent', '--dark', '--bg', '--heading'].forEach((v) => r.removeProperty(v)); }, []);

  const applyLive = (next) => {
    const r = document.documentElement.style;
    r.setProperty('--primary', next.primary_color); r.setProperty('--accent', next.accent_color);
    r.setProperty('--dark', next.dark_color); r.setProperty('--bg', next.bg_color);
    r.setProperty('--heading', `'${next.heading_font}', Georgia, serif`);
  };
  const set = (k, v) => setS((cur) => { const n = { ...cur, [k]: v }; if (/_color$|heading_font/.test(k)) { if (/_color$/.test(k)) n.theme_preset = 'custom'; applyLive(n); } return n; });
  const preset = (key) => setS((cur) => { const n = { ...cur, ...presets[key], theme_preset: key }; delete n.name; applyLive(n); return n; });

  const save = async (override) => {
    setBusy(true); setMsg('');
    const body = override || s;
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setBusy(false);
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? 'Saved! Your website has been updated.' : (j.error || 'Could not save settings.'));
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
        {[['theme', '🎨 Colours & Fonts'], ['live', '📺 Livestream'], ['images', '🖼️ Logo & Banners'], ['general', '⛪ Parish Details'], ['content', '📝 Page Content'], ['privacy', '🔒 Privacy']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
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
      {tab === 'privacy' && <div className="a-card a-form">{PRIVACY.map(field)}</div>}
      {tab === 'live' && (
        <div className="a-card a-form">
          <div className={`full live-switch ${s.live_now === 'true' ? 'on' : ''}`}>
            <div>
              <b style={{ fontSize: 17 }}>{s.live_now === 'true' ? '🔴 The website shows: LIVE NOW' : '⚪ The website shows: not live'}</b>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>Paste the live video link below, then press <b>Go LIVE</b> when Mass starts — the website updates immediately. Press <b>Switch OFF live</b> when Mass ends.</p>
            </div>
            <button type="button" className={`btn ${s.live_now === 'true' ? 'btn-danger' : 'btn-primary'}`} onClick={() => { const n = { ...s, live_now: s.live_now === 'true' ? 'false' : 'true' }; if (n.live_now === 'true' && !n.live_url && !n.youtube_channel_id) { setMsg('Paste the live video link first.'); return; } if (n.live_now === 'true' && n.live_url && !/youtu\.?be|facebook\.com|fb\.watch/i.test(n.live_url)) { setMsg('The live link must be a YouTube or Facebook video link.'); return; } setS(n); save(n); }}>
              {s.live_now === 'true' ? 'Switch OFF live' : 'Go LIVE'}
            </button>
          </div>
          {LIVE.map(field)}
          <p className="muted full" style={{ fontSize: 13, margin: 0 }}>Upcoming broadcast times and recorded Masses/homilies are managed under <b>Livestream & Recordings</b> in the menu.</p>
        </div>
      )}

      <div style={{ position: 'sticky', bottom: 0, background: '#f4f5f8', padding: '16px 0', display: 'flex', gap: 14, alignItems: 'center', marginTop: 10 }}>
        <button className="btn btn-primary" onClick={() => save()} disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
        {msg && <span className="alert ok">{msg}</span>}
      </div>
    </div>
  );
}
