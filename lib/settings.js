import { query } from './db';

export async function getSettings() {
  const rows = await query('SELECT key, value FROM settings');
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  return s;
}

export const THEME_PRESETS = {
  marian: { name: 'Marian Blue & Gold', primary_color: '#1d3a8a', accent_color: '#c9a227', dark_color: '#0f1b3d', bg_color: '#faf8f3' },
  purple: { name: 'Royal Purple (Advent / Lent)', primary_color: '#5b2a86', accent_color: '#d4a72c', dark_color: '#2a1440', bg_color: '#faf7fb' },
  cardinal: { name: 'Cardinal Red', primary_color: '#9b1c23', accent_color: '#d4af37', dark_color: '#3b0d10', bg_color: '#fbf7f2' },
  burgundy: { name: 'Burgundy & Cream', primary_color: '#6d1a36', accent_color: '#c99a3b', dark_color: '#2e0b17', bg_color: '#fbf6f0' },
  navy: { name: 'Midnight Navy', primary_color: '#14365d', accent_color: '#e0a83c', dark_color: '#0a1a2e', bg_color: '#f6f7f9' },
  rose: { name: 'Gaudete Rose', primary_color: '#a63d6b', accent_color: '#c9a227', dark_color: '#3a1226', bg_color: '#fdf7f9' },
  teal: { name: 'Baptismal Teal', primary_color: '#0e6377', accent_color: '#e2a93b', dark_color: '#06303a', bg_color: '#f5f9fa' },
  black: { name: 'Classic Black & Gold', primary_color: '#1f1f1f', accent_color: '#c9a227', dark_color: '#0d0d0d', bg_color: '#faf8f4' },
};

export const FONTS = ['Cormorant Garamond', 'Playfair Display', 'Cinzel', 'Lora', 'EB Garamond', 'Merriweather'];

export function themeCss(s) {
  const p = s.primary_color || '#1d3a8a';
  const a = s.accent_color || '#c9a227';
  const d = s.dark_color || '#0f1b3d';
  const bg = s.bg_color || '#faf8f3';
  const f = s.heading_font || 'Cormorant Garamond';
  return `:root{--primary:${p};--accent:${a};--dark:${d};--bg:${bg};--heading:'${f}',Georgia,serif;}`;
}
