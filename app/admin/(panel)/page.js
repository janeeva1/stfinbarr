import Link from 'next/link';
import bcrypt from 'bcryptjs';
import { query, one } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { getUser } from '@/lib/auth';
import { canAccess, canApprove, canManageSettings } from '@/lib/resources';
import { fmtDate, fmtMoney, fmtTime } from '@/lib/format';
import { todayLocal, addDays } from '@/lib/readings';

export default async function Dashboard() {
  const [s, user] = await Promise.all([getSettings(), getUser()]);
  const cur = s.currency || '₦';
  const church = canAccess(user.role, 'parishioners');
  const site = canAccess(user.role, 'events');
  const today = todayLocal();
  const from = addDays(today, -29);

  const [c, byCat, events, msgs, ints, pending, visits, top, me] = await Promise.all([
    one(`SELECT
      (SELECT count(*)::int FROM parishioners WHERE status='Active') members,
      (SELECT count(DISTINCT family_name)::int FROM parishioners) families,
      (SELECT count(*)::int FROM events WHERE start_date >= now()) upcoming,
      (SELECT count(*)::int FROM messages WHERE status='New') new_msgs,
      (SELECT count(*)::int FROM mass_intentions WHERE status='Pending') pending_int,
      (SELECT COALESCE(sum(amount),0) FROM donations WHERE date >= date_trunc('month', CURRENT_DATE)) month_total,
      (SELECT COALESCE(sum(amount),0) FROM donations WHERE date >= date_trunc('year', CURRENT_DATE)) year_total,
      (SELECT count(*)::int FROM gallery_photos) photos`),
    query(`SELECT category, sum(amount) total FROM donations WHERE date >= CURRENT_DATE - interval '90 days' GROUP BY 1 ORDER BY 2 DESC`),
    query('SELECT id, title, start_date FROM events WHERE start_date >= now() ORDER BY start_date LIMIT 5'),
    query('SELECT id, type, name, subject, message, created_at FROM messages ORDER BY created_at DESC LIMIT 5'),
    query("SELECT id, requested_by, intention_type, mass_date FROM mass_intentions WHERE status IN ('Pending','Scheduled') ORDER BY mass_date NULLS LAST LIMIT 5"),
    query(`(SELECT 'news' AS t, id, title, created_at FROM news WHERE status='Awaiting approval') UNION ALL
           (SELECT 'events', id, title, created_at FROM events WHERE status='Awaiting approval') ORDER BY created_at DESC LIMIT 10`),
    query('SELECT day::text AS day, sum(views)::int AS v FROM page_views WHERE day >= $1 GROUP BY day ORDER BY day', [from]),
    query('SELECT path, sum(views)::int AS v FROM page_views WHERE day >= $1 GROUP BY path ORDER BY v DESC LIMIT 6', [from]),
    one('SELECT password_hash FROM users WHERE id=$1', [user.id]),
  ]);
  const weakPw = await bcrypt.compare('admin123', me.password_hash);
  const dayMap = Object.fromEntries(visits.map((v) => [v.day, v.v]));
  const days = Array.from({ length: 30 }, (_, i) => addDays(from, i)).map((d) => ({ d, v: dayMap[d] || 0 }));
  const total30 = days.reduce((a, b) => a + b.v, 0);
  const maxV = Math.max(1, ...days.map((d) => d.v));
  const max = Math.max(1, ...byCat.map((r) => r.total));
  const live = s.live_now === 'true';

  const stats = [
    ...(church ? [['Active parishioners', c.members, '/admin/parishioners'], ['Families', c.families, '/admin/parishioners'],
      ['Giving this month', fmtMoney(c.month_total, cur), '/admin/donations', 'gold'], ['Giving this year', fmtMoney(c.year_total, cur), '/admin/donations', 'gold'],
      ['New messages', c.new_msgs, '/admin/messages'], ['Pending Mass intentions', c.pending_int, '/admin/mass_intentions']] : []),
    ...(site ? [['Upcoming events', c.upcoming, '/admin/events'], ['Gallery photos', c.photos, '/admin/gallery_photos']] : []),
    ['Website visits (30 days)', total30.toLocaleString(), '#visits'],
  ];

  return (
    <>
      <div className="topline"><div><h1>Peace be with you 🙏</h1><p className="muted" style={{ margin: 0 }}>Welcome, {user.name}. Here is what is happening at {s.parish_name}.</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {site && <Link href="/admin/events/new" className="btn btn-primary btn-sm">+ New event</Link>}
          {site && <Link href="/admin/news/new" className="btn btn-light btn-sm">+ New announcement</Link>}
          {church && <Link href="/admin/parishioners/new" className="btn btn-light btn-sm">+ Register parishioner</Link>}
          {church && <Link href="/admin/donations/new" className="btn btn-light btn-sm">+ Record giving</Link>}
        </div>
      </div>

      {weakPw && <div className="alert err" style={{ marginBottom: 16 }}>⚠️ You are still using the default password. <Link href="/admin/account">Change it now</Link> to keep the website safe.</div>}

      {canManageSettings(user.role) && (
        <div className={`live-switch ${live ? 'on' : ''}`} style={{ marginBottom: 18, background: live ? '#fff3f4' : '#fff' }}>
          <div><b>{live ? '🔴 The website is showing a LIVE Mass' : '📺 Livestream is off'}</b><p className="muted" style={{ margin: '2px 0 0', fontSize: 14 }}>{live ? s.live_title : 'Paste the live link and press Go LIVE when Mass starts streaming.'}</p></div>
          <Link href="/admin/settings?tab=live" className={`btn btn-sm ${live ? 'btn-danger' : 'btn-primary'}`}>{live ? 'Manage / switch off' : 'Go live'}</Link>
        </div>
      )}

      {canApprove(user.role) && pending.length > 0 && (
        <div className="a-card" style={{ marginBottom: 18, borderLeft: '4px solid #e0a100' }}>
          <h3>✋ Waiting for your approval ({pending.length})</h3>
          <table className="t"><tbody>{pending.map((p) => (
            <tr key={p.t + p.id}><td><span className="pill">{p.t === 'news' ? 'Announcement' : 'Event'}</span></td><td><Link href={`/admin/${p.t}/${p.id}`}>{p.title}</Link></td><td className="muted">Open it, tick “Published” and save to approve</td></tr>
          ))}</tbody></table>
        </div>
      )}

      <div className="stats">{stats.map(([l, v, h, cls]) => <Link key={l} href={h} className={`stat ${cls || ''}`} style={{ textDecoration: 'none' }}><small>{l}</small><b>{v}</b></Link>)}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18 }}>
        <div className="a-card" id="visits"><h3>Website visits · last 30 days</h3>
          <div className="spark">{days.map((d) => <span key={d.d} title={`${fmtDate(d.d, { day: 'numeric', month: 'short' })}: ${d.v}`} style={{ height: `${Math.max(3, (d.v / maxV) * 100)}%` }} />)}</div>
          <p className="muted" style={{ fontSize: 13, margin: '6px 0 14px' }}>{total30} page views · today {dayMap[today] || 0}</p>
          <h4 style={{ fontFamily: 'var(--body)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6b7280' }}>Most visited pages</h4>
          <table className="t"><tbody>{top.map((t) => <tr key={t.path}><td>{t.path}</td><td style={{ textAlign: 'right' }}><b>{t.v}</b></td></tr>)}</tbody></table>
          {!top.length && <p className="muted">Visits will appear here as people use the website.</p>}
        </div>
        {church && (
          <div className="a-card"><h3>Giving by category · last 90 days</h3>
            <div className="bars">{byCat.length ? byCat.map((r) => (
              <div className="bar-row" key={r.category}><span>{r.category}</span><div className="track"><div className="bar" style={{ width: `${(r.total / max) * 100}%` }} /></div><b style={{ textAlign: 'right' }}>{fmtMoney(r.total, cur)}</b></div>
            )) : <p className="muted">No donations recorded yet.</p>}</div>
          </div>
        )}
        {site && (
          <div className="a-card"><h3>Upcoming events</h3>
            <table className="t"><tbody>{events.map((e) => <tr key={e.id}><td><Link href={`/admin/events/${e.id}`}>{e.title}</Link></td><td className="muted">{fmtDate(e.start_date, { day: 'numeric', month: 'short' })} · {fmtTime(e.start_date)}</td></tr>)}</tbody></table>
            {!events.length && <p className="muted">No upcoming events.</p>}
          </div>
        )}
        {church && (
          <div className="a-card"><h3>Latest messages & requests</h3>
            <table className="t"><tbody>{msgs.map((m) => <tr key={m.id}><td><span className="pill">{m.type}</span></td><td><Link href={`/admin/messages/${m.id}`}>{m.name}</Link><div className="muted" style={{ fontSize: 12.5 }}>{(m.subject || m.message || '').slice(0, 60)}</div></td></tr>)}</tbody></table>
          </div>
        )}
        {church && (
          <div className="a-card"><h3>Mass intentions to schedule</h3>
            <table className="t"><tbody>{ints.map((m) => <tr key={m.id}><td><Link href={`/admin/mass_intentions/${m.id}`}>{m.requested_by}</Link></td><td>{m.intention_type}</td><td className="muted">{m.mass_date ? fmtDate(m.mass_date, { day: 'numeric', month: 'short' }) : '—'}</td></tr>)}</tbody></table>
            {!ints.length && <p className="muted">Nothing pending.</p>}
          </div>
        )}
      </div>
    </>
  );
}
