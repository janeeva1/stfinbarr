import { getPool } from './db';

// Order matters for restoring (parents before children)
export const BACKUP_TABLES = ['settings', 'users', 'slides', 'mass_times', 'events', 'news', 'gallery_albums', 'gallery_photos', 'clergy',
  'ministries', 'parishioners', 'sacraments', 'donations', 'mass_intentions', 'messages', 'livestreams', 'celebrations',
  'sacrament_info', 'readings', 'page_views', 'uploads'];

export async function makeBackup({ images = true } = {}) {
  const pool = getPool();
  const out = { app: 'st-finbarr-cms', version: 2, created_at: new Date().toISOString(), tables: {} };
  for (const t of BACKUP_TABLES) {
    if (t === 'uploads' && !images) continue;
    const r = await pool.query(`SELECT * FROM ${t}`);
    out.tables[t] = t === 'uploads' ? r.rows.map((x) => ({ ...x, data: x.data.toString('base64') })) : r.rows;
  }
  return out;
}

export async function restoreBackup(backup) {
  if (backup?.app !== 'st-finbarr-cms' || !backup.tables) throw new Error('This is not a St. Finbarr website backup file');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const tables = BACKUP_TABLES.filter((t) => backup.tables[t]);
    await client.query(`TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`);
    for (const t of tables) {
      const cols = (await client.query('SELECT column_name FROM information_schema.columns WHERE table_name=$1', [t])).rows.map((r) => r.column_name);
      for (const row of backup.tables[t]) {
        const keys = Object.keys(row).filter((k) => cols.includes(k));
        const vals = keys.map((k) => (t === 'uploads' && k === 'data' ? Buffer.from(row[k], 'base64') : row[k]));
        await client.query(`INSERT INTO ${t} (${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')})`, vals);
      }
      if (cols.includes('id')) await client.query(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${t}), 1))`);
    }
    if (!(await client.query("SELECT 1 FROM users WHERE role='admin' LIMIT 1")).rows.length) throw new Error('The backup has no administrator account — restore cancelled');
    await client.query('COMMIT');
    return Object.fromEntries(tables.map((t) => [t, backup.tables[t].length]));
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}
