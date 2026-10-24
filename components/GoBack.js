'use client';
import { useRouter } from 'next/navigation';

export default function GoBack({ label = '← Go back', className = 'btn btn-light' }) {
  const router = useRouter();
  return <button type="button" className={className} onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}>{label}</button>;
}
