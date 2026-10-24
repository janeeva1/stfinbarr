import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RESOURCES, labelFor } from '@/lib/resources';
import { listRows, relationOptions } from '@/lib/crud';
import { getSettings } from '@/lib/settings';
import { fmtDate, fmtMoney, fmtTime } from '@/lib/format';
import { query } from '@/lib/db';
import BulkUpload from '@/components/admin/BulkUpload';

export default async function List({ params, searchParams }) {
  const res = RESOURCES[params.resource];
  if (!res) notFound();
  const q = searchParams?.q || '';
  const page = Number(searchParams?.page || 1);
  const { rows, total, pages } = await listRows(params.resource, { q, page });
  const opts = await relationOptions(res);
  const s = await getSettings();
  const totals = params.resource === 'donations' ? (await query('SELECT COALESCE(sum(amount),0) t FROM donations'))[0].t : null;

  const cell = (k, v) => {
    const f = res.fields[k] || {};
    if (v === null || v === undefined || v === '') return <span className="muted">—</span>;
    switch (f.type) {
      case 'image': return <img src={v} alt="" />;
      case 'checkbox': return <span className={`pill ${v ? 'yes' : 'no'}`}>{v ? 'Yes' : 'No'}</span>;
      case 'date': return fmtDate(v, { day: 'numeric', month: 'short', year: 'numeric' });
      case 'datetime': return `${fmtDate(v, { day: 'numeric', month: 'short', year: 'numeric' })} ${fmtTime(v)}`;
      case 'money': return fmtMoney(v, s.currency);
      case 'relation': return opts[k]?.find((o) => o.value === v)?.label || v;
      case 'select': return <span className="pill">{v}</span>;
      default: return String(v).slice(0, 70);
    }
  };
  const base = `/admin/${params.resource}`;
  return (
    <>
      <div className="topline">
        <div><h1>{res.icon} {res.label}</h1><p className="muted" style={{ margin: 0 }}>{total} record{total === 1 ? '' : 's'}{totals !== null && ` · Total ${fmtMoney(totals, s.currency)}`}</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {res.search && <form><input name="q" defaultValue={q} className="input" placeholder="Search…" style={{ padding: '9px 12px', width: 220 }} /></form>}
          {!res.noCreate && <Link href={`${base}/new`} className="btn btn-primary btn-sm">+ Add {res.singular}</Link>}
        </div>
      </div>
      {res.bulkUpload && <BulkUpload albums={opts.album_id || []} initial={searchParams?.album} />}
      <div className="t-wrap">
        <table className="t">
          <thead><tr>{res.list.map((k) => <th key={k}>{labelFor(k, res.fields[k])}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {res.list.map((k, i) => <td key={k}>{i === 0 || (i === 1 && res.fields[res.list[0]]?.type === 'image') ? <Link href={`${base}/${r.id}`} style={{ fontWeight: 600 }}>{cell(k, r[k])}</Link> : cell(k, r[k])}</td>)}
                <td style={{ textAlign: 'right' }}><Link href={`${base}/${r.id}`} className="btn btn-light btn-sm">Edit</Link></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={res.list.length + 1} className="muted" style={{ padding: 30, textAlign: 'center' }}>Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <Link key={p} href={`${base}?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ''}`} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-light'}`}>{p}</Link>)}
        </div>
      )}
    </>
  );
}
