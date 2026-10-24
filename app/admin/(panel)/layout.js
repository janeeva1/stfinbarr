import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { RESOURCES } from '@/lib/resources';
import Sidebar from '@/components/admin/Sidebar';

export const metadata = { title: 'Admin' };

export default async function PanelLayout({ children }) {
  const user = await getUser();
  if (!user) redirect('/admin/login');
  const s = await getSettings();
  const groups = {};
  for (const [k, r] of Object.entries(RESOURCES)) (groups[r.group] ||= []).push([k, { label: r.label, icon: r.icon }]);
  return (
    <div className="admin">
      <Sidebar groups={groups} s={s} user={user} />
      <div className="main">{children}</div>
    </div>
  );
}
