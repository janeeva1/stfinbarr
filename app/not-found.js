import Link from 'next/link';
import GoBack from '@/components/GoBack';

export default function NotFound() {
  return (
    <div className="login-wrap">
      <div className="login-card center">
        <div style={{ fontSize: 46, color: 'var(--primary)' }}>✝</div>
        <h1 style={{ fontSize: '2.2rem' }}>Page not found</h1>
        <p className="muted">The page you are looking for has moved or no longer exists.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <GoBack />
          <Link href="/" className="btn btn-primary">⌂ Home</Link>
        </div>
        <p style={{ marginTop: 20, fontSize: 14 }}><Link href="/mass-times">Mass times</Link> · <Link href="/readings">Readings</Link> · <Link href="/live">Livestream</Link> · <Link href="/contact">Contact</Link></p>
      </div>
    </div>
  );
}
