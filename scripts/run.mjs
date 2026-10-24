// Single entry point for npm scripts:
//   npm run dev      -> database + Next.js dev server
//   npm start        -> database + Next.js production server
//   npm run setup    -> database only
//   npm run db:reset -> wipe and re-seed
// If DATABASE_URL is empty, or points to this computer but nothing is running there,
// a built-in PostgreSQL is started automatically (data kept in ./.data/postgres).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import pg from 'pg';
import { runSetup } from './setup.mjs';
import { pgConfig } from '../lib/pgconfig.mjs';

const root = process.cwd();
const mode = process.argv[2] || 'dev';

// ---- load .env ----
if (!fs.existsSync(path.join(root, '.env')) && fs.existsSync(path.join(root, '.env.example'))) {
  fs.copyFileSync(path.join(root, '.env.example'), path.join(root, '.env'));
}
for (const f of ['.env', '.env.local']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = 'dev-secret-change-me';

const NET_ERRORS = ['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'EHOSTUNREACH'];

async function canConnect(url) {
  const c = new pg.Client(pgConfig(url));
  c.on('error', () => {});
  try { await c.connect(); await c.end(); return { ok: true }; }
  catch (e) {
    try { await c.end(); } catch {}
    if (e.code === '3D000') return { ok: true }; // server reachable, database will be created
    return { ok: false, error: e };
  }
}

let embedded = null;
async function startEmbedded() {
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const dir = path.join(root, '.data', 'postgres');
  const port = Number(process.env.EMBEDDED_PG_PORT || 5433);
  embedded = new EmbeddedPostgres({ databaseDir: dir, user: 'postgres', password: 'postgres', port, persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'], onLog: () => {}, onError: () => {} });
  if (!fs.existsSync(path.join(dir, 'PG_VERSION'))) {
    console.log('… Setting up the built-in database (first run only, takes a moment)');
    await embedded.initialise();
  }
  await embedded.start();
  console.log(`✔ Built-in PostgreSQL running (port ${port}, data in .data/postgres)`);
  return `postgresql://postgres:postgres@127.0.0.1:${port}/st_finbarr`;
}

async function stopEmbedded() {
  if (embedded) { try { await embedded.stop(); } catch {} embedded = null; }
}

async function resolveDatabase() {
  let url = (process.env.DATABASE_URL || '').trim();
  if (url) {
    const r = await canConnect(url);
    if (r.ok) { console.log(`✔ Connected to PostgreSQL at ${new URL(url).hostname}`); return url; }
    const host = new URL(url).hostname;
    const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host);
    if (r.error.code === '28P01') {
      console.error('\n✖ PostgreSQL refused the password in .env (DATABASE_URL).');
      console.error('  Put the password you chose when installing PostgreSQL into .env, or delete the');
      console.error('  DATABASE_URL line to use the built-in database instead.\n');
      process.exit(1);
    }
    if (!(local && NET_ERRORS.includes(r.error.code))) {
      console.error('\n✖ Could not connect to PostgreSQL at', host + ':', r.error.message);
      console.error('  Check DATABASE_URL in .env (copy it again from your Neon/host dashboard) and your internet connection.\n');
      process.exit(1);
    }
    // Try 127.0.0.1 in case "localhost" resolved to IPv6
    if (host === 'localhost') {
      const alt = url.replace('@localhost', '@127.0.0.1');
      if ((await canConnect(alt)).ok) { console.log('✔ Connected to PostgreSQL on 127.0.0.1'); return alt; }
    }
    console.log('ℹ No PostgreSQL found at DATABASE_URL — using the built-in database instead.');
  }
  return startEmbedded();
}

process.on('SIGINT', async () => { await stopEmbedded(); process.exit(0); });
process.on('SIGTERM', async () => { await stopEmbedded(); process.exit(0); });

try {
  const url = await resolveDatabase();
  process.env.DATABASE_URL = url;
  await runSetup(url, { reset: mode === 'reset', builtIn: !!embedded });
  if (mode === 'setup' || mode === 'reset') { await stopEmbedded(); process.exit(0); }
  const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, mode === 'start' ? 'start' : 'dev'], { stdio: 'inherit', env: process.env });
  child.on('exit', async (code) => { await stopEmbedded(); process.exit(code ?? 0); });
} catch (e) {
  console.error('\n✖', e.message || e, '\n');
  await stopEmbedded();
  process.exit(1);
}
