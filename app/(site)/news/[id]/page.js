import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one } from '@/lib/db';
import { fmtDate } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';
import ItemPager from '@/components/ItemPager';

export default async function Post({ params }) {
  const n = await one('SELECT * FROM news WHERE id=$1 AND published', [Number(params.id) || 0]);
  if (!n) notFound();
  const [newer, older] = await Promise.all([
    one('SELECT id, title FROM news WHERE published AND (published_at, id) > ($1, $2) ORDER BY published_at, id LIMIT 1', [n.published_at, n.id]),
    one('SELECT id, title FROM news WHERE published AND (published_at, id) < ($1, $2) ORDER BY published_at DESC, id DESC LIMIT 1', [n.published_at, n.id]),
  ]);
  return (
    <>
      <PageHero title={n.title} text={n.summary} image={n.image || undefined} banner="banner_news" />
      <section className="section">
        <div className="narrow">
          <div className="meta" style={{ marginBottom: 24 }}><span className="tag" style={{ margin: 0 }}>{n.category}</span><span>{fmtDate(n.published_at)}</span>{n.author && <span>by {n.author}</span>}</div>
          {n.image && <Img src={n.image} className="article-img" alt="" />}
          <div className="prose">{n.body}</div>
          <ItemPager prev={newer && { href: `/news/${newer.id}`, title: newer.title }} next={older && { href: `/news/${older.id}`, title: older.title }}
            all={{ href: '/news', label: 'All news' }} prevLabel="Newer post" nextLabel="Older post" />
        </div>
      </section>
    </>
  );
}
