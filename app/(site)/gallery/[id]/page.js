import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one, query } from '@/lib/db';
import PageHero from '@/components/PageHero';
import Lightbox from '@/components/Lightbox';

export default async function Album({ params }) {
  const a = await one('SELECT * FROM gallery_albums WHERE id=$1 AND published', [Number(params.id) || 0]);
  if (!a) notFound();
  const photos = await query('SELECT * FROM gallery_photos WHERE album_id=$1 ORDER BY sort_order, id', [a.id]);
  return (
    <>
      <PageHero title={a.title} text={a.description} crumb={<Link href="/gallery">Gallery</Link>} image={a.cover_image || photos[0]?.image} banner="banner_gallery" />
      <section className="section"><div className="container"><Lightbox photos={photos} /></div></section>
    </>
  );
}
