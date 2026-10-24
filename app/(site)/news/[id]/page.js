import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one } from '@/lib/db';
import { fmtDate } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';

export default async function Post({ params }) {
  const n = await one('SELECT * FROM news WHERE id=$1 AND published', [Number(params.id) || 0]);
  if (!n) notFound();
  return (
    <>
      <PageHero title={n.title} text={n.summary} crumb={<><Link href="/news">News</Link> / {n.category}</>} image={n.image || undefined} banner="banner_news" />
      <section className="section">
        <div className="narrow">
          <div className="meta" style={{ marginBottom: 24 }}><span className="tag" style={{ margin: 0 }}>{n.category}</span><span>{fmtDate(n.published_at)}</span>{n.author && <span>by {n.author}</span>}</div>
          {n.image && <Img src={n.image} className="article-img" alt="" />}
          <div className="prose">{n.body}</div>
          <Link href="/news" className="btn btn-outline" style={{ marginTop: 30 }}>← All news</Link>
        </div>
      </section>
    </>
  );
}
