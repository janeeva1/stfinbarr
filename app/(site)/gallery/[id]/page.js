import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one, query } from '@/lib/db';
import PageHero from '@/components/PageHero';
import Lightbox from '@/components/Lightbox';
import ItemPager from '@/components/ItemPager';

export default async function Album({ params }) {
  const a = await one('SELECT * FROM gallery_albums WHERE id=$1 AND published', [Number(params.id) || 0]);
  if (!a) notFound();
  const [photos, all] = await Promise.all([
    query('SELECT * FROM gallery_photos WHERE album_id=$1 ORDER BY sort_order, id', [a.id]),
    query('SELECT id, title FROM gallery_albums WHERE published ORDER BY event_date DESC NULLS LAST, id DESC'),
  ]);
  const i = all.findIndex((x) => x.id === a.id);
  const newer = all[i - 1], older = all[i + 1];
  return (
    <>
      <PageHero title={a.title} text={a.description} image={a.cover_image || photos[0]?.image} banner="banner_gallery" />
      <section className="section">
        <div className="container">
          <Lightbox photos={photos} />
          <ItemPager prev={newer && { href: `/gallery/${newer.id}`, title: newer.title }} next={older && { href: `/gallery/${older.id}`, title: older.title }}
            all={{ href: '/gallery', label: 'All albums' }} prevLabel="Newer album" nextLabel="Older album" />
        </div>
      </section>
    </>
  );
}
