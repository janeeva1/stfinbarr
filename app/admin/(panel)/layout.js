import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { RESOURCES, canAccess, canManageSettings, canBackup, ROLE_LABELS } from '@/lib/resources';
import Sidebar from '@/components/admin/Sidebar';

export const metadata = { title: 'Admin' };

export default async function PanelLayout({ children }) {
  const user = await getUser();
  if (!user) redirect('/admin/login');
  const s = await getSettings();
  const groups = {};
  for (const [k, r] of Object.entries(RESOURCES)) if (canAccess(user.role, k)) (groups[r.group] ||= []).push([k, { label: r.label, icon: r.icon }]);
  return (
    <div className="admin">
      <Sidebar groups={groups} s={s} user={{ ...user, roleLabel: ROLE_LABELS[user.role] || user.role }} perms={{ settings: canManageSettings(user.role), backup: canBackup(user.role) }} />
      <div className="main">{children}</div>
    </div>
  );
}
