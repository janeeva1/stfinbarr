import Link from 'next/link';
import { query } from '@/lib/db';
import { fmtDate } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';

export const metadata = { title: 'Gallery' };

export default async function Gallery() {
  const albums = await query(`SELECT a.*, COALESCE(a.cover_image, (SELECT image FROM gallery_photos p WHERE p.album_id=a.id ORDER BY sort_order, id LIMIT 1)) cover,
    (SELECT count(*)::int FROM gallery_photos p WHERE p.album_id=a.id) n FROM gallery_albums a WHERE published ORDER BY event_date DESC NULLS LAST, id DESC`);
  return (
    <>
      <PageHero title="Photo Gallery" text="Moments of worship, celebration and service from our parish life." banner="banner_gallery" />
      <section className="section">
        <div className="container">
          {albums.length ? (
            <div className="grid g3">
              {albums.map((a, k) => (
                <Link key={a.id} href={`/gallery/${a.id}`} className="card">
                  <div className="thumb" style={{ aspectRatio: '4/3' }}><Img src={a.cover} alt={a.title} seed={k} /></div>
                  <div className="body"><h3>{a.title}</h3><div className="meta"><span>📷 {a.n} photos</span>{a.event_date && <span>{fmtDate(a.event_date)}</span>}</div><p>{a.description}</p></div>
                </Link>
              ))}
            </div>
          ) : <div className="empty">No albums yet.</div>}
        </div>
      </section>
    </>
  );
}
