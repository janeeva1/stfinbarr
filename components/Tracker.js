'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Counts page visits for the dashboard. No cookies, no personal data.
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    try {
      const body = JSON.stringify({ path });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/public/track', new Blob([body], { type: 'application/json' }));
      else fetch('/api/public/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    } catch {}
  }, [path]);
  return null;
}
