import bcrypt from 'bcryptjs';
import { query, one } from './db';
import { RESOURCES, canApprove } from './resources';

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

export function checkPassword(pw) {
  const p = String(pw || '');
  if (p.length < 8 || !/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) throw new Error('Password must be at least 8 characters and include letters and numbers');
  if (['admin123', 'password1', 'password123', '12345678a'].includes(p.toLowerCase())) throw new Error('That password is too common — please choose another');
}

async function clean(name, body, user) {
  const res = getResource(name);
  const data = {};
  for (const [k, f] of Object.entries(res.fields)) {
    if (f.readonly) continue;
    let v = body[k];
    if (f.type === 'checkbox') v = v === true || v === 'true' || v === 'on';
    else if (v === '' || v === undefined) v = null;
    else if (['number', 'money', 'relation'].includes(f.type)) v = Number(v);
    if (f.type === 'password') {
      if (v) { checkPassword(v); data.password_hash = await bcrypt.hash(String(v), 10); }
      continue;
    }
    if (f.required && (v === null || v === undefined)) throw new Error(`${f.label || k} is required`);
    data[k] = v;
  }
  // Posts by editors wait for the Parish Priest / admin to approve them
  const approvalField = Object.keys(res.fields).find((k) => res.fields[k].approval);
  if (approvalField && user) {
    if (canApprove(user.role)) data.status = data[approvalField] ? 'Approved' : 'Draft';
    else if (data[approvalField]) { data[approvalField] = false; data.status = 'Awaiting approval'; }
    else data.status = 'Draft';
  }
  return data;
}

export async function createRow(name, body, user) {
  const data = await clean(name, body, user);
  if (name === 'users' && !data.password_hash) throw new Error('Password is required for a new user');
  const keys = Object.keys(data);
  return one(`INSERT INTO ${name} (${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING id`, Object.values(data));
}

export async function updateRow(name, id, body, user) {
  const data = await clean(name, body, user);
  const keys = Object.keys(data);
  await query(`UPDATE ${name} SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(',')} WHERE id=$${keys.length + 1}`, [...Object.values(data), id]);
  return { id };
}

export async function deleteRow(name, id) {
  if (name === 'users') {
    const target = await one('SELECT role FROM users WHERE id=$1', [id]);
    const n = (await one("SELECT count(*)::int AS n FROM users WHERE role='admin'")).n;
    if (target?.role === 'admin' && n <= 1) throw new Error('You cannot delete the last administrator');
  }
  await query(`DELETE FROM ${name} WHERE id=$1`, [id]);
}
