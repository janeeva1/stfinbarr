import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RESOURCES, canAccess } from '@/lib/resources';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { fmtDate, fmtDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function List({ params, searchParams }) {
  const res = RESOURCES[params.resource];
  if (!res) notFound();
  const user = await getUser();
  if (!canAccess(user.role, params.resource)) return <div className="a-card"><h2>No access</h2><p className="muted">Your role ({user.role}) cannot access this section.</p></div>;
  const sp = searchParams || {};
  const page = Number(sp.page || 1);
  const q = sp.q || '';
  const limit = 30;
  const off = (page - 1) * limit;
  let where = '';
  const vals = [];
  if (q && res.search) {
    const conds = res.search.map((f, i) => { vals.push(`%${q}%`); return `${f}::text ILIKE $${vals.length}`; });
    if (conds.length) { where = 'WHERE ' + conds.join(' OR '); }
  }
  const from = `FROM ${params.resource} ${where}`;
  const total = (await query(`SELECT count(*)::int n ${from}`, vals))[0].n;
  vals.push(limit, off);
  const order = res.order || 'id DESC';
  const rows = await query(`SELECT * ${from} ORDER BY ${order} LIMIT $${vals.length - 1} OFFSET $${vals.length}`, vals);

  if (params.resource === 'chats') {
    return (
      <>
        <div className="topline">
          <div><h1>💬 {res.label}</h1><p className="muted" style={{ margin: 0 }}>View and reply to customer chats from the website.</p></div>
        </div>
        <div className="a-card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Last message</th><th></th></tr></thead>
              <tbody>
                {(rows || []).length ? rows.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.name || 'Visitor'}</td>
                    <td>{r.phone || '-'}</td>
                    <td>{r.email || '-'}</td>
                    <td>{r.status || 'Open'}</td>
                    <td>{r.last_message_at ? fmtDateTime(r.last_message_at) : '-'}</td>
                    <td style={{ textAlign: 'right' }}><Link href={`/admin/chats/${r.id}`} className="btn btn-light btn-sm">Open chat</Link></td>
                  </tr>
                )) : <tr><td colSpan={7} className="muted" style={{ textAlign: 'center' }}>No chats yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topline">
        <div><h1>{res.icon} {res.label}</h1></div>
        {!res.noCreate && <Link href={`/admin/${params.resource}/new`} className="btn btn-primary">+ Add {res.singular}</Link>}
      </div>
      <div className="a-card">
        {res.search && (
          <form method="get" className="searchbar">
            <input name="q" defaultValue={q} placeholder={`Search ${res.label.toLowerCase()}...`} className="input" />
            <button className="btn btn-light">Search</button>
          </form>
        )}
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{(res.list || ['id']).map((c) => <th key={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase())}</th>)}<th></th></tr></thead>
            <tbody>
              {rows.length ? rows.map((r) => (
                <tr key={r.id}>
                  {(res.list || ['id']).map((c) => <td key={c}>{c === 'image' || c === 'cover_image' || c === 'photo' || c === 'logo' ? (r[c] ? <img src={r[c]} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : '-') : c.includes('date') || c === 'published_at' || c === 'created_at' || c === 'last_message_at' ? fmtDate(r[c]) || fmtDateTime(r[c]) || '-' : String(r[c] ?? '-')}</td>)}
                  <td style={{ textAlign: 'right' }}><Link href={`/admin/${params.resource}/${r.id}`} className="btn btn-light btn-sm">Edit</Link></td>
                </tr>
              )) : <tr><td colSpan={(res.list || ['id']).length + 1} className="muted" style={{ textAlign: 'center' }}>Nothing found</td></tr>}
            </tbody>
          </table>
        </div>
        {total > limit && <div style={{ display: 'flex', gap: 10, justifyContent: 'center', paddingTop: 14 }}>
          {page > 1 && <Link href={`?page=${page - 1}${q ? '&q=' + encodeURIComponent(q) : ''}`} className="btn btn-light btn-sm">Previous</Link>}
          <span className="muted">Page {page} of {Math.ceil(total / limit)}</span>
          {page < Math.ceil(total / limit) && <Link href={`?page=${page + 1}${q ? '&q=' + encodeURIComponent(q) : ''}`} className="btn btn-light btn-sm">Next</Link>}
        </div>}
      </div>
    </>
  );
}
