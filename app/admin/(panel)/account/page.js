import { getUser } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/resources';
import PasswordForm from '@/components/admin/PasswordForm';

export default async function Account() {
  const user = await getUser();
  return (
    <>
      <div className="topline"><div><h1>🔑 My account</h1><p className="muted" style={{ margin: 0 }}>{user.name} · {user.email} · {ROLE_LABELS[user.role] || user.role}</p></div></div>
      <PasswordForm />
    </>
  );
}
