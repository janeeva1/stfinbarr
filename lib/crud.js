import bcrypt from 'bcryptjs';
import { query, one } from './db';
import { RESOURCES } from './resources';

export function getResource(name) {
  const r = RESOURCES[name];
  if (!r) throw new Error('Unknown resource');
  return r;
}

export async function relationOptions(res) {
  const out = {};
  for (const [k, f] of Object.entries(res.fields)) {
    if (f.type !== 'relation') continue;
    const rows = await query(`SELECT id, (${f.display}) AS label FROM ${f.table} ORDER BY 2`);
    out[k] = rows.map((r) => ({ value: r.id, label: r.label }));
  }
  return out;
}

export async function listRows(name, { q = '', page = 1, per = 25 } = {}) {
  const res = getResource(name);
  const params = [];
  let where = '';
  if (q && res.search) {
    params.push(`%${q}%`);
    where = 'WHERE ' + res.search.map((c) => `${c}::text ILIKE $1`).join(' OR ');
  }
  const total = (await one(`SELECT count(*)::int AS n FROM ${name} ${where}`, params)).n;
  const cols = name === 'users' ? 'id, name, email, role' : '*';
  const rows = await query(`SELECT ${cols} FROM ${name} ${where} ORDER BY ${res.order} LIMIT ${per} OFFSET ${(page - 1) * per}`, params);
  return { rows, total, pages: Math.max(1, Math.ceil(total / per)) };
}

export async function getRow(name, id) {
  const row = await one(`SELECT * FROM ${name} WHERE id=$1`, [id]);
  if (row && name === 'users') delete row.password_hash;
  return row;
}

async function clean(name, body) {
  const res = getResource(name);
  const data = {};
  for (const [k, f] of Object.entries(res.fields)) {
    if (f.readonly) continue;
    let v = body[k];
    if (f.type === 'checkbox') v = v === true || v === 'true' || v === 'on';
    else if (v === '' || v === undefined) v = null;
    else if (['number', 'money', 'relation'].includes(f.type)) v = Number(v);
    if (f.type === 'password') {
      if (v) data.password_hash = await bcrypt.hash(String(v), 10);
      continue;
    }
    if (f.required && (v === null || v === undefined)) throw new Error(`${f.label || k} is required`);
    data[k] = v;
  }
  return data;
}

export async function createRow(name, body) {
  const data = await clean(name, body);
  if (name === 'users' && !data.password_hash) throw new Error('Password is required for a new user');
  const keys = Object.keys(data);
  return one(`INSERT INTO ${name} (${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING id`, Object.values(data));
}

export async function updateRow(name, id, body) {
  const data = await clean(name, body);
  const keys = Object.keys(data);
  await query(`UPDATE ${name} SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(',')} WHERE id=$${keys.length + 1}`, [...Object.values(data), id]);
  return { id };
}

export async function deleteRow(name, id) {
  if (name === 'users') {
    const n = (await one('SELECT count(*)::int AS n FROM users')).n;
    if (n <= 1) throw new Error('You cannot delete the last admin user');
  }
  await query(`DELETE FROM ${name} WHERE id=$1`, [id]);
}
