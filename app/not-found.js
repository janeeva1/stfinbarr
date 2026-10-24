import Link from 'next/link';
export default function NotFound() {
  return (<div className="login-wrap"><div className="login-card center"><h1>Page not found</h1><p className="muted">The page you are looking for does not exist.</p><Link href="/" className="btn btn-primary">Go home</Link></div></div>);
}
