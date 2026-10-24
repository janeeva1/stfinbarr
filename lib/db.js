import pg from 'pg';
import { pgConfig } from './pgconfig.mjs';

// Parse NUMERIC as float and DATE as plain string
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
pg.types.setTypeParser(1082, (v) => v);

// Created on first use, so building the app (e.g. on Render) needs no database.
export function getPool() {
  const g = globalThis;
  if (!g.__pgPool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    g.__pgPool = new pg.Pool(pgConfig(process.env.DATABASE_URL, { max: 8, idleTimeoutMillis: 30000 }));
    // Hosted databases (Neon etc.) close idle connections; don't crash the server when they do.
    g.__pgPool.on('error', (e) => console.warn('PostgreSQL connection closed:', e.message));
  }
  return g.__pgPool;
}

export async function query(text, params = []) {
  const r = await getPool().query(text, params);
  return r.rows;
}
export async function one(text, params = []) {
  const r = await getPool().query(text, params);
  return r.rows[0] || null;
}
