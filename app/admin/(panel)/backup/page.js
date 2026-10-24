import { getUser } from '@/lib/auth';
import { canBackup } from '@/lib/resources';
import { one } from '@/lib/db';
import BackupTools from '@/components/admin/BackupTools';

export default async function Backup() {
  const user = await getUser();
  if (!canBackup(user.role)) return <div className="a-card"><h2>No access</h2><p className="muted">Only the administrator can make or restore backups.</p></div>;
  const size = await one("SELECT pg_size_pretty(pg_database_size(current_database())) AS db, (SELECT count(*)::int FROM uploads) AS images, (SELECT pg_size_pretty(COALESCE(sum(size),0)) FROM uploads) AS img_size");
  return (
    <>
      <div className="topline"><div><h1>💾 Backup & Export</h1><p className="muted" style={{ margin: 0 }}>Database size {size.db} · {size.images} uploaded images ({size.img_size})</p></div></div>
      <BackupTools />
    </>
  );
}
