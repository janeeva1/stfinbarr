import Link from 'next/link';
import { query, one } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { fmtDate, fmtMoney, fmtTime } from '@/lib/format';

export default async function Dashboard() {
  const s = await getSettings();
  const cur = s.currency || '₦';
  const c = await one(`SELECT
    (SELECT count(*)::int FROM parishioners WHERE status='Active') members,
    (SELECT count(DISTINCT family_name)::int FROM parishioners) families,
    (SELECT count(*)::int FROM events WHERE start_date >= now()) upcoming,
    (SELECT count(*)::int FROM messages WHERE status='New') new_msgs,
    (SELECT count(*)::int FROM mass_intentions WHERE status='Pending') pending_int,
    (SELECT COALESCE(sum(amount),0) FROM donations WHERE date >= date_trunc('month', CURRENT_DATE)) month_total,
    (SELECT COALESCE(sum(amount),0) FROM donations WHERE date >= date_trunc('year', CURRENT_DATE)) year_total,
    (SELECT count(*)::int FROM gallery_photos) photos`);
  const byCat = await query(`SELECT category, sum(amount) total FROM donations WHERE date >= CURRENT_DATE - interval '90 days' GROUP BY 1 ORDER BY 2 DESC`);
  const max = Math.max(1, ...byCat.map((r) => r.total));
  const events = await query('SELECT id, title, start_date FROM events WHERE start_date >= now() ORDER BY start_date LIMIT 5');
  const msgs = await query('SELECT id, type, name, subject, message, created_at FROM messages ORDER BY created_at DESC LIMIT 5');
  const ints = await query("SELECT id, requested_by, intention_type, mass_date FROM mass_intentions WHERE status IN ('Pending','Scheduled') ORDER BY mass_date NULLS LAST LIMIT 5");
  const stats = [
    ['Active parishioners', c.members, '/admin/parishioners'], ['Families', c.families, '/admin/parishioners'],
    ['Giving this month', fmtMoney(c.month_total, cur), '/admin/donations', 'gold'], ['Giving this year', fmtMoney(c.year_total, cur), '/admin/donations', 'gold'],
    ['Upcoming events', c.upcoming, '/admin/events'], ['New messages', c.new_msgs, '/admin/messages'],
    ['Pending Mass intentions', c.pending_int, '/admin/mass_intentions'], ['Gallery photos', c.photos, '/admin/gallery_photos'],
  ];
  return (
    <>
      <div className="topline"><div><h1>Peace be with you 🙏</h1><p className="muted" style={{ margin: 0 }}>Here is what is happening at {s.parish_name}.</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Link href="/admin/events/new" className="btn btn-primary btn-sm">+ New event</Link><Link href="/admin/parishioners/new" className="btn btn-light btn-sm">+ Register parishioner</Link><Link href="/admin/donations/new" className="btn btn-light btn-sm">+ Record giving</Link></div>
      </div>
      <div className="stats">{stats.map(([l, v, h, cls]) => <Link key={l} href={h} className={`stat ${cls || ''}`} style={{ textDecoration: 'none' }}><small>{l}</small><b>{v}</b></Link>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18 }}>
        <div className="a-card"><h3>Giving by category · last 90 days</h3>
          <div className="bars">{byCat.length ? byCat.map((r) => (
            <div className="bar-row" key={r.category}><span>{r.category}</span><div className="track"><div className="bar" style={{ width: `${(r.total / max) * 100}%` }} /></div><b style={{ textAlign: 'right' }}>{fmtMoney(r.total, cur)}</b></div>
          )) : <p className="muted">No donations recorded yet.</p>}</div>
        </div>
        <div className="a-card"><h3>Upcoming events</h3>
          <table className="t"><tbody>{events.map((e) => <tr key={e.id}><td><Link href={`/admin/events/${e.id}`}>{e.title}</Link></td><td className="muted">{fmtDate(e.start_date, { day: 'numeric', month: 'short' })} · {fmtTime(e.start_date)}</td></tr>)}</tbody></table>
          {!events.length && <p className="muted">No upcoming events.</p>}
        </div>
        <div className="a-card"><h3>Latest messages & prayer requests</h3>
          <table className="t"><tbody>{msgs.map((m) => <tr key={m.id}><td><span className="pill">{m.type}</span></td><td><Link href={`/admin/messages/${m.id}`}>{m.name}</Link><div className="muted" style={{ fontSize: 12.5 }}>{(m.subject || m.message || '').slice(0, 60)}</div></td></tr>)}</tbody></table>
        </div>
        <div className="a-card"><h3>Mass intentions to schedule</h3>
          <table className="t"><tbody>{ints.map((m) => <tr key={m.id}><td><Link href={`/admin/mass_intentions/${m.id}`}>{m.requested_by}</Link></td><td>{m.intention_type}</td><td className="muted">{m.mass_date ? fmtDate(m.mass_date, { day: 'numeric', month: 'short' }) : '—'}</td></tr>)}</tbody></table>
          {!ints.length && <p className="muted">Nothing pending.</p>}
        </div>
      </div>
    </>
  );
}
