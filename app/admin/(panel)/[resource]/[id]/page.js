import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RESOURCES, canAccess, canApprove } from '@/lib/resources';
import { getUser } from '@/lib/auth';
import { getRow, relationOptions } from '@/lib/crud';
import { query } from '@/lib/db';
import ResourceForm from '@/components/admin/ResourceForm';

export default async function Edit({ params }) {
  const res = RESOURCES[params.resource];
  if (!res) notFound();
  const user = await getUser();
  if (!canAccess(user.role, params.resource)) return <div className="a-card"><h2>No access</h2><p className="muted">Your role ({user.role}) cannot open this section. Ask the parish administrator if you need access.</p></div>;
  const isNew = params.id === 'new';
  let row = null;
  if (!isNew) {
    row = await getRow(params.resource, Number(params.id) || 0);
    if (!row) notFound();
    if (params.resource === 'messages' && row.status === 'New') await query("UPDATE messages SET status='Read' WHERE id=$1", [row.id]);
  }
  const options = await relationOptions(res);
  // Serialize dates for the client component
  const plain = row ? JSON.parse(JSON.stringify(row)) : null;
  return (
    <>
      <div className="topline">
        <div><Link href={`/admin/${params.resource}`} className="muted" style={{ fontSize: 14 }}>← {res.label}</Link><h1>{isNew ? `New ${res.singular}` : `Edit ${res.singular}`}</h1></div>
        {!isNew && params.resource === 'gallery_albums' && <Link href={`/admin/gallery_photos?album=${row.id}`} className="btn btn-primary btn-sm">📸 Upload photos to this album</Link>}
      </div>
      <ResourceForm name={params.resource} res={{ singular: res.singular, fields: res.fields }} row={plain} options={options} canApprove={canApprove(user.role)} />
    </>
  );
}
