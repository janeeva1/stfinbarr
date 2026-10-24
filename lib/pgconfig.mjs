// Turns a DATABASE_URL (local PostgreSQL, Neon, Render, Supabase…) into pg client options.
// Handles sslmode / channel_binding ourselves so pg doesn't warn, and gives remote
// databases (e.g. a sleeping Neon compute) enough time to wake up.
export function pgConfig(url, extra = {}) {
  const u = new URL(url);
  const sslmode = u.searchParams.get('sslmode');
  const channel = u.searchParams.get('channel_binding');
  for (const k of ['sslmode', 'channel_binding', 'uselibpqcompat', 'sslrootcert', 'sslcert', 'sslkey']) u.searchParams.delete(k);
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(u.hostname);
  const wantSsl = sslmode ? sslmode !== 'disable' : !local;
  return {
    connectionString: u.toString(),
    ssl: wantSsl ? { rejectUnauthorized: sslmode === 'verify-full' || sslmode === 'verify-ca' ? true : false } : false,
    enableChannelBinding: channel === 'require',
    connectionTimeoutMillis: local ? 5000 : 30000,
    ...extra,
  };
}

export function withDatabase(url, db) {
  const u = new URL(url);
  u.pathname = '/' + db;
  return u.toString();
}
