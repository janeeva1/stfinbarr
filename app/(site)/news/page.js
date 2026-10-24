import Link from 'next/link';
import { query } from '@/lib/db';
import { fmtDate, excerpt } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Img from '@/components/Img';

export const metadata = { title: 'News' };

export default async function News({ searchParams }) {
  const cat = searchParams?.category;
  const cats = (await query('SELECT DISTINCT category FROM news WHERE published AND category IS NOT NULL ORDER BY 1')).map((r) => r.category);
  const news = await query(`SELECT * FROM news WHERE published ${cat ? 'AND category=$1' : ''} ORDER BY published_at DESC, id DESC`, cat ? [cat] : []);
  return (
    <>
      <PageHero title="News & Announcements" text="Bulletins, notices and stories from our parish family." banner="banner_news" />
      <section className="section">
        <div className="container">
          <div className="tabs">
            <Link href="/news" className={!cat ? 'on' : ''}>All</Link>
            {cats.map((c) => <Link key={c} href={`/news?category=${encodeURIComponent(c)}`} className={cat === c ? 'on' : ''}>{c}</Link>)}
          </div>
          {news.length ? (
            <div className="grid g3">
              {news.map((n, k) => (
                <Link key={n.id} href={`/news/${n.id}`} className="card">
                  <div className="thumb"><Img src={n.image} alt="" seed={k} /></div>
                  <div className="body"><span className="tag">{n.category}</span><h3>{n.title}</h3>
                    <div className="meta"><span>{fmtDate(n.published_at)}</span>{n.author && <span>by {n.author}</span>}</div>
                    <p>{excerpt(n.summary || n.body, 130)}</p></div>
                </Link>
              ))}
            </div>
          ) : <div className="empty">No posts yet.</div>}
        </div>
      </section>
    </>
  );
}
