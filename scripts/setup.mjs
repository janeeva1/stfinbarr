// Called by scripts/run.mjs: creates the database if missing,
// creates tables, and seeds sample parish content on first run.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { pgConfig, withDatabase } from '../lib/pgconfig.mjs';

let url;

// Make sure the target database exists and is UTF-8 (Windows defaults to WIN1252).
// Hosted databases like Neon already exist, so we connect to them directly.
async function ensureDatabase({ builtIn = false } = {}) {
  const dbName = decodeURIComponent(new URL(url).pathname.replace(/^\//, '')).replace(/"/g, '') || 'postgres';
  const c = new pg.Client(pgConfig(url));
  c.on('error', () => {});
  let enc = null;
  try {
    await c.connect();
    enc = (await c.query('SELECT pg_encoding_to_char(encoding) AS enc FROM pg_database WHERE datname = current_database()')).rows[0].enc;
    await c.end();
  } catch (e) {
    try { await c.end(); } catch {}
    if (e.code !== '3D000') throw e; // 3D000 = database does not exist yet
  }
  if (enc === 'UTF8') return;
  if (enc && !builtIn) {
    throw new Error(`Database "${dbName}" uses ${enc} encoding. Use a UTF-8 database (create a new one or change the name in DATABASE_URL).`);
  }
  const admin = new pg.Client(pgConfig(withDatabase(url, 'postgres')));
  admin.on('error', () => {});
  await admin.connect();
  try {
    if (enc) { await admin.query(`DROP DATABASE "${dbName}"`); console.log(`✔ Rebuilding built-in database "${dbName}" as UTF-8`); }
    await admin.query(`CREATE DATABASE "${dbName}" WITH TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C'`);
    console.log(`✔ Created database "${dbName}"`);
  } finally { await admin.end(); }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, role TEXT DEFAULT 'admin', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS slides (
  id SERIAL PRIMARY KEY, title TEXT, subtitle TEXT, image TEXT, button_text TEXT, button_link TEXT,
  sort_order INT DEFAULT 0, active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS mass_times (
  id SERIAL PRIMARY KEY, day TEXT NOT NULL, time TEXT NOT NULL, title TEXT, language TEXT, notes TEXT,
  category TEXT DEFAULT 'Mass', sort_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, start_date TIMESTAMPTZ, end_date TIMESTAMPTZ,
  location TEXT, image TEXT, category TEXT, featured BOOLEAN DEFAULT false, published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY, title TEXT NOT NULL, summary TEXT, body TEXT, image TEXT, category TEXT DEFAULT 'Announcement',
  author TEXT, published_at DATE DEFAULT CURRENT_DATE, published BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS gallery_albums (
  id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, cover_image TEXT, event_date DATE,
  published BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS gallery_photos (
  id SERIAL PRIMARY KEY, album_id INT REFERENCES gallery_albums(id) ON DELETE CASCADE, image TEXT NOT NULL,
  caption TEXT, sort_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS clergy (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, role TEXT, bio TEXT, photo TEXT, email TEXT, phone TEXT,
  sort_order INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS ministries (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, leader TEXT, meeting_time TEXT, image TEXT,
  category TEXT DEFAULT 'Society', created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS parishioners (
  id SERIAL PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, gender TEXT, date_of_birth DATE,
  phone TEXT, email TEXT, address TEXT, family_name TEXT, marital_status TEXT, occupation TEXT,
  ministry_id INT REFERENCES ministries(id) ON DELETE SET NULL, zone TEXT,
  baptized BOOLEAN DEFAULT false, confirmed BOOLEAN DEFAULT false, first_communion BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active', notes TEXT, joined_on DATE DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS sacraments (
  id SERIAL PRIMARY KEY, sacrament TEXT NOT NULL, person_name TEXT NOT NULL,
  parishioner_id INT REFERENCES parishioners(id) ON DELETE SET NULL, date DATE, minister TEXT,
  sponsors TEXT, parents TEXT, register_no TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY, donor_name TEXT, parishioner_id INT REFERENCES parishioners(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'Offertory', amount NUMERIC(14,2) NOT NULL DEFAULT 0, method TEXT DEFAULT 'Cash',
  date DATE DEFAULT CURRENT_DATE, reference TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS mass_intentions (
  id SERIAL PRIMARY KEY, requested_by TEXT NOT NULL, phone TEXT, email TEXT, intention_type TEXT,
  intention TEXT NOT NULL, mass_date DATE, mass_time TEXT, stipend NUMERIC(12,2), status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, mime TEXT NOT NULL, size INT, data BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY, type TEXT DEFAULT 'Contact', name TEXT, email TEXT, phone TEXT, subject TEXT,
  message TEXT, status TEXT DEFAULT 'New', created_at TIMESTAMPTZ DEFAULT now());
`;

const img = (n) => `/images/gallery-${n}.jpg`;

const DEFAULT_SETTINGS = {
  parish_name: "St. Finbarr's Catholic Church",
  parish_short: "St. Finbarr's",
  tagline: 'A family of faith, worship and service',
  diocese: 'Catholic Archdiocese of Jos',
  address: 'St. Finbarr’s Catholic Church, Rayfield, Jos, Plateau State',
  phone: '+234 800 000 0000',
  email: 'info@stfinbarrparish.org',
  office_hours: 'Mon – Fri: 9:00am – 4:00pm\nSat: 10:00am – 1:00pm',
  welcome_title: 'Welcome home to St. Finbarr’s',
  welcome_text: 'Whether you are a lifelong Catholic, returning to the faith, or simply curious, there is a place for you here. Come and pray with us, grow with us, and serve with us as one family in Christ.',
  priest_message: 'Dear brothers and sisters in Christ, it is a joy to welcome you to our parish. Our doors and our hearts are open. May the peace of the Lord be with you always, and may you find in this community a true home for your faith.',
  priest_name: 'Rev. Fr. Parish Priest',
  priest_photo: img('community'),
  about_text: 'St. Finbarr’s Catholic Church is a vibrant parish community under the patronage of St. Finbarr, Bishop of Cork. We gather each week to celebrate the Holy Eucharist, receive the sacraments, and go out to love and serve the Lord in our neighbourhood.',
  history_text: 'Founded by faithful families who first gathered for Mass in a simple hall, the parish grew steadily through the dedication of its priests and people. Today our church is home to thousands of parishioners, dozens of societies and ministries, and outreach that touches the wider community.\n\nEdit this history from the CMS under Settings → Content.',
  mission_text: 'To proclaim the Gospel, celebrate the sacraments with reverence, and serve the poor and the needy with the love of Christ.',
  bank_details: 'Bank: Your Bank Name\nAccount Name: St. Finbarr’s Catholic Church\nAccount No: 0000000000',
  donate_text: 'Your generosity sustains the life and mission of our parish — from the liturgy and the upkeep of our church to our care for the poor. Thank you for giving.',
  map_embed: 'https://www.google.com/maps?q=St+Finbarr%27s+Catholic+Church+Rayfield+Jos&output=embed',
  facebook: '#', instagram: '#', youtube: '#',
  hero_image: img('service'),
  logo: '',
  about_image: img('choir'),
  banner_about: img('community'), banner_mass: img('service'), banner_events: img('community'),
  banner_news: img('choir'), banner_gallery: img('choir'), banner_ministries: img('prayer'),
  banner_contact: img('community'), banner_donate: img('prayer'),
  theme_preset: 'marian',
  primary_color: '#1d3a8a',
  accent_color: '#c9a227',
  dark_color: '#0f1b3d',
  bg_color: '#faf8f3',
  heading_font: 'Cormorant Garamond',
  currency: '₦',
};

async function seed(c) {
  const ins = async (table, rows) => {
    for (const r of rows) {
      const k = Object.keys(r);
      await c.query(`INSERT INTO ${table} (${k.join(',')}) VALUES (${k.map((_, i) => '$' + (i + 1)).join(',')})`, Object.values(r));
    }
  };
  const d = (days, h = 10) => { const t = new Date(); t.setDate(t.getDate() + days); t.setHours(h, 0, 0, 0); return t.toISOString(); };
  const day = (days) => d(days).slice(0, 10);

  await ins('slides', [
    { title: 'Come, Let Us Worship the Lord', subtitle: 'Join us for Holy Mass this Sunday and every day of the week.', image: img('service'), button_text: 'Mass Times', button_link: '/mass-times', sort_order: 1 },
    { title: 'Lift Up Your Voice', subtitle: 'Our choirs lead the parish in joyful, prayerful song.', image: img('choir'), button_text: 'Our Ministries', button_link: '/ministries', sort_order: 2 },
    { title: 'Faith in Action', subtitle: 'Feeding the hungry and caring for our neighbours in need.', image: img('prayer'), button_text: 'Upcoming Events', button_link: '/events', sort_order: 3 },
  ]);
  await ins('mass_times', [
    { day: 'Sunday', time: '6:30 AM', title: 'First Mass', language: 'English', sort_order: 1 },
    { day: 'Sunday', time: '8:30 AM', title: 'Second Mass', language: 'English', sort_order: 2 },
    { day: 'Sunday', time: '10:30 AM', title: 'Third Mass (Children)', language: 'English', sort_order: 3 },
    { day: 'Sunday', time: '5:00 PM', title: 'Evening Mass', language: 'Hausa', sort_order: 4 },
    { day: 'Monday – Friday', time: '6:30 AM', title: 'Morning Mass', language: 'English', sort_order: 5 },
    { day: 'Wednesday', time: '6:00 PM', title: 'Novena & Evening Mass', language: 'English', sort_order: 6 },
    { day: 'Saturday', time: '7:00 AM', title: 'Morning Mass', language: 'English', sort_order: 7 },
    { day: 'Saturday', time: '4:00 PM', title: 'Confessions', category: 'Confession', notes: 'Or by appointment', sort_order: 8 },
    { day: 'First Friday', time: '6:00 PM', title: 'Eucharistic Adoration', category: 'Adoration', sort_order: 9 },
  ]);
  await ins('events', [
    { title: 'Parish Harvest & Bazaar', description: 'Our annual thanksgiving harvest with a bazaar, cultural displays, food and fellowship for all families. Bring your friends and neighbours!', start_date: d(14, 10), end_date: d(14, 16), location: 'Parish Grounds', image: img('community'), category: 'Celebration', featured: true },
    { title: 'Choir Festival of Praise', description: 'An evening of hymns and sacred music by all our parish choirs. Admission is free.', start_date: d(7, 17), location: 'Main Church', image: img('choir'), category: 'Music', featured: true },
    { title: 'Charity Outreach: Food Drive', description: 'The CWO and SVDP will distribute food items to families in need. Donations of rice, beans and oil are welcome at the parish office.', start_date: d(4, 9), location: 'Parish Hall', image: img('prayer'), category: 'Outreach', featured: true },
    { title: 'Advent Recollection', description: 'A morning of prayer, reflection and confession to prepare our hearts for Christmas.', start_date: d(30, 8), location: 'Main Church', image: img('service'), category: 'Spiritual' },
    { title: 'Youth Rally & Talent Show', description: 'The Catholic Youth Organisation invites all young people for games, talks and talents.', start_date: d(21, 12), location: 'Parish Hall', category: 'Youth' },
  ]);
  await ins('news', [
    { title: 'Registration for Catechism Classes Now Open', summary: 'Classes for First Holy Communion and Confirmation begin next month.', body: 'Parents are invited to register their children for catechism classes at the parish office. Please bring a copy of the baptismal certificate.\n\nClasses hold every Saturday after the morning Mass.', image: img('service'), category: 'Announcement', author: 'Parish Office', published_at: day(-2) },
    { title: 'Thank You for a Successful Food Drive', summary: 'Over 300 families received food items through your generosity.', body: 'The parish thanks everyone who donated to our recent outreach. Your kindness made a real difference in our community.', image: img('prayer'), category: 'Parish News', author: 'SVDP', published_at: day(-6) },
    { title: 'New Choir Robes Dedicated', summary: 'The parish choir received new robes, blessed at the Sunday Mass.', body: 'With thanks to all donors, the choir robes were blessed and dedicated during the 8:30 Mass.', image: img('choir'), category: 'Parish News', author: 'Choir', published_at: day(-10) },
  ]);
  const a = await c.query(`INSERT INTO gallery_albums (title, description, cover_image, event_date) VALUES
    ('Sunday Worship', 'Moments from our Sunday celebrations.', '${img('service')}', '${day(-7)}'),
    ('Choir & Music', 'Our choirs in praise.', '${img('choir')}', '${day(-20)}'),
    ('Charity & Outreach', 'Serving our neighbours with love.', '${img('prayer')}', '${day(-14)}') RETURNING id`);
  const [w, ch, o] = a.rows.map((r) => r.id);
  await ins('gallery_photos', [
    { album_id: w, image: img('community'), caption: 'Greeting after Mass' },
    { album_id: w, image: img('service'), caption: 'Candles at the altar' },
    { album_id: ch, image: img('choir'), caption: 'Parish choir' },
    { album_id: o, image: img('prayer'), caption: 'Packing food for families' },
    { album_id: o, image: img('community'), caption: 'Families together' },
  ]);
  await ins('clergy', [
    { name: 'Rev. Fr. Parish Priest', role: 'Parish Priest', bio: 'Shepherd of the parish community. Edit this profile in the CMS.', photo: img('community'), sort_order: 1 },
    { name: 'Rev. Fr. Assistant Priest', role: 'Assistant Parish Priest', bio: 'Assists in the pastoral care of the parish.', sort_order: 2 },
    { name: 'Rev. Sr. Catechist', role: 'Director of Catechesis', bio: 'Coordinates catechism and faith formation.', sort_order: 3 },
  ]);
  const m = await c.query(`INSERT INTO ministries (name, description, leader, meeting_time, image, category) VALUES
    ('Catholic Women Organisation (CWO)', 'Women of the parish united in prayer, charity and service.', 'CWO President', 'Every 1st Sunday after 2nd Mass', '${img('prayer')}', 'Society'),
    ('Catholic Men Organisation (CMO)', 'Men committed to faith, family and the parish.', 'CMO President', 'Every 2nd Sunday after 2nd Mass', '${img('community')}', 'Society'),
    ('Catholic Youth Organisation (CYON)', 'Young Catholics growing in faith and friendship.', 'Youth President', 'Sundays at 4:00 PM', NULL, 'Youth'),
    ('Parish Choir', 'Leading the faithful in sacred music at every Mass.', 'Choir Master', 'Tue & Thu at 6:00 PM', '${img('choir')}', 'Liturgy'),
    ('Legion of Mary', 'Serving God through Mary in prayer and apostolic work.', 'President', 'Wednesdays at 5:00 PM', NULL, 'Pious Society'),
    ('Society of St. Vincent de Paul', 'Caring for the poor and the sick in our community.', 'Coordinator', 'Saturdays at 10:00 AM', '${img('prayer')}', 'Charity'),
    ('Altar Servers (Knights of the Altar)', 'Young people serving at the altar of God.', 'Coordinator', 'Saturdays at 9:00 AM', '${img('service')}', 'Liturgy') RETURNING id`);
  const mi = m.rows.map((r) => r.id);
  const people = [
    ['Chinedu', 'Okafor', 'Male', 'Married', 'Engineer', 1, 'Zone A'], ['Ngozi', 'Okafor', 'Female', 'Married', 'Teacher', 0, 'Zone A'],
    ['Gyang', 'Pam', 'Male', 'Single', 'Student', 2, 'Zone B'], ['Naomi', 'Dung', 'Female', 'Married', 'Nurse', 0, 'Zone C'],
    ['Emeka', 'Nwosu', 'Male', 'Married', 'Accountant', 5, 'Zone B'], ['Blessing', 'Eze', 'Female', 'Single', 'Banker', 3, 'Zone D'],
    ['Joseph', 'Okon', 'Male', 'Widowed', 'Retired', 4, 'Zone C'], ['Grace', 'Ibe', 'Female', 'Single', 'Student', 6, 'Zone A'],
  ];
  const pIds = [];
  for (const [fn, ln, g, ms, oc, min, z] of people) {
    const r = await c.query(`INSERT INTO parishioners (first_name,last_name,gender,marital_status,occupation,ministry_id,zone,family_name,phone,baptized,confirmed,first_communion,joined_on)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,true,true,$10) RETURNING id`, [fn, ln, g, ms, oc, mi[min], z, ln + ' Family', '+234 80' + Math.floor(10000000 + Math.random() * 89999999), day(-Math.floor(Math.random() * 900))]);
    pIds.push(r.rows[0].id);
  }
  await ins('sacraments', [
    { sacrament: 'Baptism', person_name: 'Chiamaka Okafor', parishioner_id: null, date: day(-40), minister: 'Rev. Fr. Parish Priest', parents: 'Chinedu & Ngozi Okafor', sponsors: 'Blessing Eze', register_no: 'BAP/2026/041' },
    { sacrament: 'Marriage', person_name: 'Emeka Nwosu & Ada Nwosu', parishioner_id: pIds[4], date: day(-120), minister: 'Rev. Fr. Assistant Priest', register_no: 'MAR/2026/012' },
    { sacrament: 'Confirmation', person_name: 'Grace Ibe', parishioner_id: pIds[7], date: day(-200), minister: 'Most Rev. Archbishop', sponsors: 'Naomi Dung', register_no: 'CON/2026/088' },
  ]);
  const cats = ['Offertory', 'Tithe', 'Building Fund', 'Thanksgiving', 'Harvest', 'Charity'];
  for (let i = 0; i < 24; i++) {
    const pi = i % 3 === 0 ? null : pIds[i % pIds.length];
    await c.query(`INSERT INTO donations (donor_name, parishioner_id, category, amount, method, date) VALUES ($1,$2,$3,$4,$5,$6)`,
      [pi ? null : 'Sunday Collection', pi, cats[i % cats.length], (Math.floor(Math.random() * 40) + 5) * 1000, ['Cash', 'Bank Transfer', 'POS'][i % 3], day(-i * 5)]);
  }
  await ins('mass_intentions', [
    { requested_by: 'Okafor Family', intention_type: 'Thanksgiving', intention: 'Thanksgiving for 10 years of marriage', mass_date: day(3), mass_time: '6:30 AM', stipend: 2000, status: 'Scheduled' },
    { requested_by: 'Joseph Okon', intention_type: 'Repose of Soul', intention: 'For the repose of the soul of Mary Okon', mass_date: day(5), mass_time: '6:30 AM', stipend: 2000, status: 'Pending' },
  ]);
  await ins('messages', [
    { type: 'Prayer Request', name: 'Anonymous', message: 'Please pray for my mother’s quick recovery.', status: 'New' },
    { type: 'Contact', name: 'Tolu Adebayo', email: 'tolu@example.com', subject: 'Wedding enquiry', message: 'I would like to know the requirements for a church wedding.', status: 'New' },
  ]);
}

export async function runSetup(databaseUrl, { reset = false, builtIn = false } = {}) {
  url = databaseUrl;
  await ensureDatabase({ builtIn });
  const c = new pg.Client(pgConfig(url));
  c.on('error', () => {});
  await c.connect();
  await c.query("SET client_encoding TO 'UTF8'");
  if (reset) {
    await c.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('✔ Database reset');
  }
  await c.query(SCHEMA);
  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    await c.query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  // Correct the old (Lagos) sample defaults if the admin hasn't changed them
  for (const [k, oldV] of [
    ['diocese', 'Archdiocese of Lagos'],
    ['address', 'St. Finbarr\u2019s Road, Akoka, Yaba, Lagos'],
    ['map_embed', 'https://www.google.com/maps?q=St+Finbarr%27s+Catholic+Church+Akoka+Lagos&output=embed'],
  ]) await c.query('UPDATE settings SET value=$1 WHERE key=$2 AND value=$3', [DEFAULT_SETTINGS[k], k, oldV]);
  await c.query("UPDATE mass_times SET language='Hausa' WHERE language='Yoruba' AND title='Evening Mass'");

  const users = await c.query('SELECT count(*)::int AS n FROM users');
  if (users.rows[0].n === 0) {
    await c.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)',
      ['Parish Administrator', 'admin@stfinbarr.org', await bcrypt.hash('admin123', 10), 'admin']);
    console.log('✔ Admin user created: admin@stfinbarr.org / admin123');
  }
  const s = await c.query('SELECT count(*)::int AS n FROM events');
  const flag = await c.query("SELECT value FROM settings WHERE key='_seeded'");
  if (s.rows[0].n === 0 && !flag.rows.length) {
    await seed(c);
    await c.query("INSERT INTO settings (key, value) VALUES ('_seeded','1') ON CONFLICT DO NOTHING");
    console.log('✔ Sample parish content added');
  }
  await c.end();
  console.log('✔ Database ready\n');
}

