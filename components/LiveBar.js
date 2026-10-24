import Link from 'next/link';

export default function LiveBar({ s }) {
  if (s.live_now !== 'true') return null;
  return (
    <Link href="/live" className="live-bar">
      <span className="live-badge"><i /> LIVE</span>
      <span>{s.live_title || 'Holy Mass is being streamed live now'}</span>
      <b>Watch now →</b>
    </Link>
  );
}
